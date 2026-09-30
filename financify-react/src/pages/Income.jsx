import { useEffect, useState, useContext } from "react";
import {
    collection, getDocs, addDoc, query, where, deleteDoc, doc, updateDoc,
} from "firebase/firestore";
import Tesseract from "tesseract.js";
import { db } from "../firebase/firebase";
import { AuthContext } from "../context/AuthContext";
import GlassCard from "../components/GlassCard";
import TransactionModal from "../components/TransactionModal";

const CATEGORIES = ["Salary", "Freelance", "Business", "Investment", "Gift", "Refund", "Other"];
const today = () => new Date().toISOString().slice(0, 10);
const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const emptyForm = () => ({ description: "", amount: "", date: today(), category: "" });
const inputCls =
    "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#5079b5]";
const labelCls = "mb-1 block text-sm text-gray-600";

// ================= INCOME DOCUMENT PARSER (used by handleOCR) =================
// Reads OCR text of salary slips, payment advices, settlements, interest advices, refunds.
// Empty values mean "not found": the caller falls back (date -> today, category -> "Other").

const KEEP_UPPER = new Set(["HDFC", "SBI", "ICICI", "BSES", "UPI", "NEFT"]);

const toLines = (text) =>
    text.split("\n").map((l) => l.trim()).filter(Boolean);

// ---------------- AMOUNT ----------------

const TIER1 =
    /net\s*pay|take\s*home|net\s*salary|net\s*(amount|payable|amt)|amount\s*(paid|payable|received|credited)|net\s*settlement|settlement\s*amount|(interest|amount)\s*credited|refund\s*amount|amount\s*refunded|grand\s*total|total\s*(payable|amt|amount)/i;
const TIER2 = /\btotal\b/i;
const NOT_TOTAL =
    /sub\s*-?\s*total|total\s*mrp|total\s*(qty|items?|savings?|discount|deductions?|earnings?|transactions?)|gst|tax/i;

function numbersIn(line) {
    const cleaned = line.replace(/\d+(?:\.\d+)?\s*%/g, " "); // drop 10%, 7.10%
    const found = cleaned.match(/\d{1,3}(?:,\d{2,3})+(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?/g) || [];
    return found.map((n) => Number(n.replace(/,/g, ""))).filter((n) => n > 0);
}

function extractAmount(lines) {
    for (const tier of [TIER1, TIER2]) {
        // scan bottom-up: the final figure sits near the end
        for (let i = lines.length - 1; i >= 0; i--) {
            if (!tier.test(lines[i]) || NOT_TOTAL.test(lines[i])) continue;
            let nums = numbersIn(lines[i]);
            if (!nums.length && lines[i + 1]) nums = numbersIn(lines[i + 1]);
            if (nums.length) return nums[nums.length - 1];
        }
    }
    // fallback: biggest currency-marked figure
    const marked = lines
        .join(" ")
        .match(/(?:₹|rs\.?|inr)\s*\d[\d,]*(?:\.\d{1,2})?/gi);
    if (marked) {
        const vals = marked.map((m) => Number(m.replace(/[^\d.]/g, ""))).filter((n) => n > 0);
        if (vals.length) return Math.max(...vals);
    }
    return "";
}

// ---------------- DATE ----------------

const MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
const NUM_DATE = "\\b(\\d{1,2})[\\/\\-.](\\d{1,2})[\\/\\-.](\\d{2,4})\\b";
const TXT_DATE = "\\b(\\d{1,2})[\\s\\-]([A-Za-z]{3})[a-z]*[\\s\\-,]+(\\d{2,4})\\b";

// The date money actually arrived, not the invoice/order date.
const MONEY_DATE = /(payment|pay|credit|credited|settlement|refund|paid|received)\s*date|date\s*of\s*(payment|credit)/i;

const iso = (y, m, d) => {
    y = String(y).length === 2 ? 2000 + Number(y) : Number(y);
    if (y < 2000 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return "";
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
};

function dateFromLine(line) {
    const n = new RegExp(NUM_DATE).exec(line);
    if (n) {
        const [a, b, y] = [Number(n[1]), Number(n[2]), n[3]];
        // Indian documents are DD/MM; only swap if it can't be DD/MM
        const out = b > 12 && a <= 12 ? iso(y, a, b) : iso(y, b, a);
        if (out) return out;
    }
    const t = new RegExp(TXT_DATE).exec(line);
    if (t) {
        const m = MONTHS.indexOf(t[2].toLowerCase()) + 1;
        if (m) return iso(t[3], m, Number(t[1]));
    }
    return "";
}

function extractDate(lines) {
    const passes = [MONEY_DATE, /date|\bdt\b/i, /./];
    for (const re of passes) {
        for (const l of lines) {
            if (!re.test(l)) continue;
            const d = dateFromLine(l);
            if (d) return d;
        }
    }
    return "";
}

// ---------------- DESCRIPTION ----------------
// First clean line at the top is the payer / source (company, bank, store).

const SKIP_DESC =
    /\b(gstin|gst|cin|invoice|receipt|slip|advice|memo|tax|date|total|ph|phone|tel|www|cash|order|welcome|statement)\b|https?:/i;

const titleCase = (s) =>
    s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase())
        .replace(/\b[A-Za-z]+\b/g, (w) => (KEEP_UPPER.has(w.toUpperCase()) ? w.toUpperCase() : w));

function extractDescription(lines) {
    const pick = lines.slice(0, 6).find((l) => {
        const letters = (l.match(/[A-Za-z]/g) || []).length;
        return l.length >= 3 && l.length <= 40 && letters >= 3 && letters / l.length > 0.6 && !SKIP_DESC.test(l);
    });
    return pick ? titleCase(pick) : "Income";
}

// ---------------- CATEGORY ----------------
// Must stay a subset of the CATEGORIES list at the top of this file.

const CATEGORY_WORDS = {
    Salary: ["salary", "payslip", "pay slip", "basic", "hra", "net pay", "employee", "emp id", "provident fund", "payroll"],
    Freelance: ["freelance", "freelancer", "contractor", "consulting", "consultant", "professional fees", "payment advice"],
    Business: ["settlement", "merchant", "mdr", "pos", "sales", "terminal", "wholesale"],
    Investment: ["interest", "fixed deposit", "fd", "dividend", "mutual fund", "redemption", "folio", "demat", "maturity", "sip"],
    Gift: ["gift", "gifted", "birthday", "shagun", "blessings"],
    Refund: ["refund", "refunded", "cashback", "reversal", "cancelled"],
};

function detectCategory(text) {
    const t = text.toLowerCase();
    let best = "Other", bestScore = 0;
    for (const [cat, words] of Object.entries(CATEGORY_WORDS)) {
        const score = words.filter((w) => new RegExp(`\\b${w}\\b`).test(t)).length;
        if (score > bestScore) { best = cat; bestScore = score; }
    }
    return best;
}

// ---------------- PUBLIC ----------------

function parseIncomeDoc(text) {
    const lines = toLines(text);
    return {
        description: extractDescription(lines),
        amount: extractAmount(lines),
        date: extractDate(lines),
        category: detectCategory(text),
    };
}


function Income() {
    const { user } = useContext(AuthContext);
    const [incomes, setIncomes] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(emptyForm());
    const [selected, setSelected] = useState(null);
    const [editing, setEditing] = useState(null);
    const [ocrLoading, setOcrLoading] = useState(false);

    const loadList = async () => {
        if (!user) return;
        const snap = await getDocs(
            query(collection(db, "incomes"), where("uid", "==", user.uid))
        );
        setIncomes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };

    useEffect(() => { loadList(); }, [user]);
    useEffect(() => { setPage(1); }, [search]);
    useEffect(() => {
        if (editing) {
            setForm({
                description: editing.description || "",
                amount: editing.amount ?? "",
                date: editing.date || today(),
                category: editing.category || "",
            });
        }
    }, [editing]);

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    const canSubmit = form.description.trim() && Number(form.amount) > 0 && form.category;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canSubmit || saving) return;
        setSaving(true);
        const data = {
            description: form.description.trim(),
            amount: Number(form.amount),
            date: form.date,
            category: form.category,
        };
        try {
            if (editing) {
                await updateDoc(doc(db, "incomes", editing.id), data);
                setEditing(null);
            } else {
                await addDoc(collection(db, "incomes"), { ...data, uid: user.uid });
            }
            setForm(emptyForm());
            await loadList();
        } finally {
            setSaving(false);
        }
    };

    const cancelEdit = () => { setEditing(null); setForm(emptyForm()); };
    const handleDelete = async () => {
        await deleteDoc(doc(db, "incomes", selected.id));
        await loadList();
        setSelected(null);
    };
    const handleEdit = () => { setEditing(selected); setSelected(null); };

    // ---------------- OCR ----------------
    // Page-segmentation mode 6 (single block) keeps the amounts on the right
    // side of each row. Do not remove it.

    const handleOCR = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setOcrLoading(true);
        let worker;
        try {
            worker = await Tesseract.createWorker("eng");
            await worker.setParameters({ tessedit_pageseg_mode: "6" });
            const { data } = await worker.recognize(file);

            console.log("========== OCR TEXT ==========");
            console.log(data.text);
            console.log("==============================");

            const r = parseIncomeDoc(data.text);

            // Nothing is saved here: the user verifies the filled form first.
            setForm({
                description: r.description,
                amount: r.amount,
                date: r.date || today(),
                category: r.category || "Other",
            });
        } catch (error) {
            console.error("OCR failed:", error);
            alert("Could not read the document.");
        } finally {
            if (worker) await worker.terminate();
            setOcrLoading(false);
            e.target.value = "";
        }
    };

    const total = incomes.reduce((t, i) => t + Number(i.amount || 0), 0);
    const categories = new Set(incomes.map((i) => i.category)).size;

    const sorted = incomes
        .filter((i) => (i.description || "").toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    const perPage = 5;
    const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
    const visible = sorted.slice((page - 1) * perPage, page * perPage);

    const stats = [
        ["Total income", fmt(total), "text-green-700"],
        ["Transactions", incomes.length, "text-gray-900"],
        ["Categories", categories, "text-gray-900"],
    ];

    return (
        <>
            <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <header>
                    <h1 className="text-2xl font-semibold text-gray-900">Income</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage and monitor your daily income.</p>
                </header>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {stats.map(([label, value, color]) => (
                        <div key={label}
                            className="rounded-2xl border border-white/70 bg-white/60 p-4 shadow-[0_8px_32px_rgba(80,121,181,0.12)] backdrop-blur-xl">
                            <p className="text-sm text-gray-500">{label}</p>
                            <p className={`mt-1 text-2xl font-semibold ${color}`}>{value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-5 lg:gap-6">
                    <GlassCard
                        title={editing ? "Edit income" : "Add income"}
                        className="flex flex-col lg:col-span-2"
                    >
                        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4">
                            {!editing && (
                                <label className="group flex min-h-[76px] flex-1 cursor-pointer items-center gap-3 rounded-2xl border border-white/80 bg-gradient-to-r from-[#5079b5]/15 via-white/50 to-sky-200/50 px-4 py-2.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                                    <svg viewBox="0 0 64 72" className={`h-12 w-11 shrink-0 drop-shadow-sm ${ocrLoading ? "animate-pulse" : ""}`} aria-hidden="true">
                                        <rect x="6" y="4" width="44" height="58" rx="7" fill="white" stroke="#5079b5" strokeOpacity=".35" strokeWidth="1.5" />
                                        <rect x="14" y="14" width="18" height="4" rx="2" fill="#5079b5" fillOpacity=".4" />
                                        <rect x="14" y="24" width="28" height="3" rx="1.5" fill="#94a3b8" fillOpacity=".5" />
                                        <rect x="14" y="32" width="22" height="3" rx="1.5" fill="#94a3b8" fillOpacity=".5" />
                                        <rect x="14" y="40" width="28" height="3" rx="1.5" fill="#94a3b8" fillOpacity=".5" />
                                        <rect x="9" y="12" width="38" height="3" rx="1.5" fill="#5079b5" fillOpacity=".6">
                                            <animate attributeName="y" values="12;50;12" dur={ocrLoading ? "1.2s" : "2.8s"} repeatCount="indefinite" />
                                        </rect>
                                        <circle cx="50" cy="56" r="10" fill="#5079b5" />
                                        <text x="50" y="60.5" textAnchor="middle" fontSize="12" fontWeight="700" fill="white" fontFamily="system-ui, sans-serif">₹</text>
                                    </svg>
                                    <span className="min-w-0 flex-1 leading-tight">
                                        <span className="block text-sm font-semibold text-[#5079b5]">
                                            {ocrLoading ? "Reading your document…" : "Scan & auto-fill"}
                                        </span>
                                        <span className="block truncate text-xs text-gray-500">
                                            Salary slip, invoice or payment proof
                                        </span>
                                    </span>
                                    {!ocrLoading && (
                                        <span className="shrink-0 rounded-full border border-[#5079b5]/25 bg-white/80 px-3 py-1 text-xs font-medium text-[#5079b5] transition-colors group-hover:bg-white">
                                            Upload
                                        </span>
                                    )}
                                    <input type="file" accept="image/*" onChange={handleOCR} disabled={ocrLoading} className="hidden" />
                                </label>
                            )}

                            <div>
                                <label className={labelCls}>Description</label>
                                <input className={inputCls} placeholder="e.g. Salary" value={form.description}
                                    onChange={(e) => set("description", e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelCls}>Amount</label>
                                    <input type="number" min="0" className={inputCls} placeholder="1000"
                                        value={form.amount} onChange={(e) => set("amount", e.target.value)} />
                                </div>
                                <div>
                                    <label className={labelCls}>Date</label>
                                    <input type="date" className={inputCls} value={form.date}
                                        onChange={(e) => set("date", e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Category</label>
                                <select className={inputCls} value={form.category}
                                    onChange={(e) => set("category", e.target.value)}>
                                    <option value="">Select category</option>
                                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="mt-auto flex gap-2 pt-2">
                                {editing && (
                                    <button type="button" onClick={cancelEdit}
                                        className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm text-gray-600 hover:bg-slate-50">
                                        Cancel
                                    </button>
                                )}
                                <button type="submit" disabled={!canSubmit || saving}
                                    className="h-10 flex-1 rounded-lg bg-[#5079b5] text-sm font-medium text-white hover:bg-[#446aa3] disabled:cursor-not-allowed disabled:opacity-50">
                                    {saving ? "Saving..." : editing ? "Save changes" : "Add income"}
                                </button>
                            </div>
                        </form>
                    </GlassCard>

                    <GlassCard
                        title="Income records"
                        className="lg:col-span-3"
                        action={
                            <input className={`${inputCls} sm:!w-56`} placeholder="Search" value={search}
                                onChange={(e) => setSearch(e.target.value)} />
                        }
                    >
                        {visible.length === 0 ? (
                            <p className="py-12 text-center text-sm text-gray-500">
                                {search ? "No income matches your search." : "No income added yet."}
                            </p>
                        ) : (
                            <ul className="divide-y divide-slate-200/70">
                                {visible.map((i) => (
                                    <li key={i.id}>
                                        <button onClick={() => setSelected(i)}
                                            className="flex w-full items-center justify-between gap-4 rounded-lg px-2 py-3 text-left hover:bg-white/70">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-gray-900">{i.description}</p>
                                                <p className="text-xs text-gray-500">
                                                    {i.category} · {new Date(i.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                </p>
                                            </div>
                                            <p className="shrink-0 text-sm font-semibold text-green-700">+ {fmt(i.amount)}</p>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {sorted.length > perPage && (
                            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                                <span>Page {page} of {totalPages}</span>
                                <div className="flex gap-2">
                                    <button disabled={page === 1} onClick={() => setPage(page - 1)}
                                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-gray-700 hover:bg-slate-50 disabled:opacity-40">
                                        Previous
                                    </button>
                                    <button disabled={page === totalPages} onClick={() => setPage(page + 1)}
                                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-gray-700 hover:bg-slate-50 disabled:opacity-40">
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </GlassCard>
                </div>
            </div>

            {selected && (
                <TransactionModal
                    transaction={selected}
                    onClose={() => setSelected(null)}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                />
            )}
        </>
    );
}

export default Income;
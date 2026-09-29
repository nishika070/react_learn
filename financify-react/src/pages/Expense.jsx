import { useEffect, useState, useContext } from "react";
import {
    collection,
    getDocs,
    addDoc,
    query,
    where,
    deleteDoc,
    doc,
    updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { AuthContext } from "../context/AuthContext";
import GlassCard from "../components/GlassCard";
import TransactionModal from "../components/TransactionModal";
import Tesseract from "tesseract.js";

const CATEGORIES = [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Health",
    "Entertainment",
    "Education",
    "Other",
];

const today = () => new Date().toISOString().slice(0, 10);
const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const emptyForm = () => ({
    description: "",
    amount: "",
    date: today(),
    category: "",
});

const inputCls =
    "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#5079b5]";

const labelCls = "mb-1 block text-sm text-gray-600";

function Expense() {
    const { user } = useContext(AuthContext);

    const [expenses, setExpenses] = useState([]);
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
            query(
                collection(db, "expenses"),
                where("uid", "==", user.uid)
            )
        );

        setExpenses(
            snap.docs.map((d) => ({
                id: d.id,
                ...d.data(),
            }))
        );
    };

    useEffect(() => {
        loadList();
    }, [user]);

    useEffect(() => {
        setPage(1);
    }, [search]);

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

    const set = (k, v) =>
        setForm((f) => ({ ...f, [k]: v }));

    const canSubmit =
        form.description.trim() &&
        Number(form.amount) > 0 &&
        form.category;

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
                await updateDoc(
                    doc(db, "expenses", editing.id),
                    data
                );
                setEditing(null);
            } else {
                await addDoc(
                    collection(db, "expenses"),
                    {
                        ...data,
                        uid: user.uid,
                    }
                );
            }

            setForm(emptyForm());
            await loadList();
        } finally {
            setSaving(false);
        }
    };

    const cancelEdit = () => {
        setEditing(null);
        setForm(emptyForm());
    };

    const handleDelete = async () => {
        await deleteDoc(doc(db, "expenses", selected.id));
        await loadList();
        setSelected(null);
    };

    const handleEdit = () => {
        setEditing(selected);
        setSelected(null);
    };

    // ---------------- OCR ----------------

    const extractAmount = (text) => {
        const lines = text
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);

        for (let i = 0; i < lines.length; i++) {
            if (
                /^(grand\s*)?total\b|total\s*amount|amount\s*payable|net\s*amount/i.test(
                    lines[i]
                )
            ) {
                const nearby = lines.slice(i, i + 3).join(" ");

                const matches = nearby.match(
                    /(?:₹|rs\.?|inr|\$)?\s*[0-9,]+\.[0-9]{1,2}/gi
                );

                if (matches) {
                    const numbers = matches
                        .map((m) =>
                            Number(
                                m
                                    .replace(/₹|rs\.?|inr|\$/gi, "")
                                    .replace(/,/g, "")
                                    .trim()
                            )
                        )
                        .filter((n) => n > 0);

                    if (numbers.length) {
                        return numbers[numbers.length - 1];
                    }
                }
            }
        }

        // Fallback: look for currency-marked amounts anywhere.
        const matches = text.match(
            /(?:₹|rs\.?|inr|\$)\s*[0-9,]+(?:\.[0-9]{1,2})?/gi
        );

        if (!matches) return "";

        const numbers = matches
            .map((m) =>
                Number(
                    m
                        .replace(/₹|rs\.?|inr|\$/gi, "")
                        .replace(/,/g, "")
                        .trim()
                )
            )
            .filter((n) => n > 0);

        return numbers.length
            ? numbers[numbers.length - 1]
            : "";
    };

    const convertDate = (first, second, year) => {
        if (year.length === 2) {
            year = "20" + year;
        }

        let day;
        let month;

        if (second > 12) {
            // MM/DD/YYYY
            month = first;
            day = second;
        } else if (first > 12) {
            // DD/MM/YYYY
            day = first;
            month = second;
        } else {
            // Indian receipts generally use DD/MM.
            day = first;
            month = second;
        }

        if (
            month < 1 ||
            month > 12 ||
            day < 1 ||
            day > 31
        ) {
            return "";
        }

        return `${year}-${String(month).padStart(
            2,
            "0"
        )}-${String(day).padStart(2, "0")}`;
    };

    const extractDate = (text) => {
        const lines = text
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);

        const dateRegex =
            /\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})\b/g;

        // Prefer dates appearing near date-related labels.
        for (let i = 0; i < lines.length; i++) {
            if (
                /date|transaction|invoice date|bill date|order date/i.test(
                    lines[i]
                )
            ) {
                const nearby = lines.slice(i, i + 2).join(" ");
                const match = dateRegex.exec(nearby);

                if (match) {
                    const converted = convertDate(
                        Number(match[1]),
                        Number(match[2]),
                        match[3]
                    );

                    if (converted) return converted;
                }
            }
        }

        // Otherwise use the first valid date found.
        const matches = [...text.matchAll(dateRegex)];

        for (const match of matches) {
            const converted = convertDate(
                Number(match[1]),
                Number(match[2]),
                match[3]
            );

            if (converted) return converted;
        }

        return "";
    };

    const extractDescription = (text) => {
        const lines = text
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);

        const ignored = [
            /gst/i,
            /ref/i,
            /reference/i,
            /invoice/i,
            /invoice\s*no/i,
            /bill\s*no/i,
            /order/i,
            /transaction/i,
            /date/i,
            /total/i,
            /subtotal/i,
            /amount/i,
            /tax/i,
            /customer/i,
            /payment/i,
            /credit\s*card/i,
            /phone/i,
            /address/i,
            /email/i,
            /qty/i,
            /quantity/i,
            /cashier/i,
            /privacy/i,
            /www\./i,
            /https?:\/\//i,
        ];

        const useful = lines.slice(0, 8).find(
            (line) =>
                line.length >= 3 &&
                line.length <= 60 &&
                !ignored.some((pattern) => pattern.test(line)) &&
                !/^[\d\s$₹.,:/-]+$/.test(line)
        );

        return useful || "Receipt Expense";
    };

    const detectCategory = (text) => {
        const t = text.toLowerCase();

        if (
            /ice cream|frozen yogurt|yogurt|custard|restaurant|pizza|burger|cafe|bakery|grocery|milk|dessert|food/.test(
                t
            )
        ) {
            return "Food";
        }

        if (
            /uber|ola|petrol|fuel|metro|cab|taxi|bus|parking/.test(
                t
            )
        ) {
            return "Transport";
        }

        if (
            /amazon|flipkart|shopping|mall|clothes|fashion/.test(
                t
            )
        ) {
            return "Shopping";
        }

        if (
            /electricity|water|bill|recharge|internet|mobile/.test(
                t
            )
        ) {
            return "Bills";
        }

        if (
            /medicine|pharmacy|hospital|doctor/.test(t)
        ) {
            return "Health";
        }

        if (
            /movie|cinema|netflix|spotify|game/.test(t)
        ) {
            return "Entertainment";
        }

        if (
            /course|book|college|school|education/.test(t)
        ) {
            return "Education";
        }

        return "Other";
    };

    const handleOCR = async (e) => {
        const file = e.target.files[0];

        if (!file) return;

        setOcrLoading(true);

        try {
            const result = await Tesseract.recognize(
                file,
                "eng"
            );

            const text = result.data.text;

            console.log("========== OCR TEXT ==========");
            console.log(text);
            console.log("==============================");

            setForm((f) => ({
                ...f,
                description: extractDescription(text),
                amount: extractAmount(text),
                date: extractDate(text),
                category: detectCategory(text),
            }));
        } catch (error) {
            console.error("OCR failed:", error);
            alert("Could not read the receipt.");
        } finally {
            setOcrLoading(false);
            e.target.value = "";
        }
    };

    // ---------------- STATS ----------------

    const total = expenses.reduce(
        (t, e) => t + Number(e.amount || 0),
        0
    );

    const categories = new Set(
        expenses.map((e) => e.category)
    ).size;

    const sorted = expenses
        .filter((e) =>
            (e.description || "")
                .toLowerCase()
                .includes(search.toLowerCase())
        )
        .sort(
            (a, b) =>
                new Date(b.date) - new Date(a.date)
        );

    const perPage = 5;

    const totalPages = Math.max(
        1,
        Math.ceil(sorted.length / perPage)
    );

    const visible = sorted.slice(
        (page - 1) * perPage,
        page * perPage
    );

    const stats = [
        ["Total expense", fmt(total), "text-red-600"],
        ["Transactions", expenses.length, "text-gray-900"],
        ["Categories", categories, "text-gray-900"],
    ];

    return (
        <>
            <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

                <header>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Expenses
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage and monitor your daily expenses.
                    </p>
                </header>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {stats.map(([label, value, color]) => (
                        <div
                            key={label}
                            className="rounded-2xl border border-white/70 bg-white/60 p-4 shadow-[0_8px_32px_rgba(80,121,181,0.12)] backdrop-blur-xl"
                        >
                            <p className="text-sm text-gray-500">
                                {label}
                            </p>

                            <p
                                className={`mt-1 text-2xl font-semibold ${color}`}
                            >
                                {value}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-5 lg:gap-6">

                    {/* ADD EXPENSE */}

                    <GlassCard
                        title={
                            editing
                                ? "Edit expense"
                                : "Add expense"
                        }
                        className="lg:col-span-2"
                        action={
                            !editing && (
                                <label className="h-10 cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-gray-600 hover:bg-slate-50">
                                    {ocrLoading
                                        ? "Reading..."
                                        : "Scan Receipt"}

                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleOCR}
                                        className="hidden"
                                    />
                                </label>
                            )
                        }
                    >
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-4"
                        >
                            <div>
                                <label className={labelCls}>
                                    Description
                                </label>

                                <input
                                    className={inputCls}
                                    placeholder="e.g. Petrol"
                                    value={form.description}
                                    onChange={(e) =>
                                        set(
                                            "description",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">

                                <div>
                                    <label className={labelCls}>
                                        Amount
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        className={inputCls}
                                        placeholder="1000"
                                        value={form.amount}
                                        onChange={(e) =>
                                            set(
                                                "amount",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div>
                                    <label className={labelCls}>
                                        Date
                                    </label>

                                    <input
                                        type="date"
                                        className={inputCls}
                                        value={form.date}
                                        onChange={(e) =>
                                            set(
                                                "date",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                            </div>

                            <div>
                                <label className={labelCls}>
                                    Category
                                </label>

                                <select
                                    className={inputCls}
                                    value={form.category}
                                    onChange={(e) =>
                                        set(
                                            "category",
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="">
                                        Select category
                                    </option>

                                    {CATEGORIES.map((c) => (
                                        <option
                                            key={c}
                                            value={c}
                                        >
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-2">

                                {editing && (
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm text-gray-600 hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                )}

                                <button
                                    type="submit"
                                    disabled={
                                        !canSubmit || saving
                                    }
                                    className="h-10 flex-1 rounded-lg bg-[#5079b5] text-sm font-medium text-white hover:bg-[#446aa3] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving
                                        ? "Saving..."
                                        : editing
                                        ? "Save changes"
                                        : "Add expense"}
                                </button>

                            </div>
                        </form>
                    </GlassCard>

                    {/* EXPENSE RECORDS */}

                    <GlassCard
                        title="Expense records"
                        className="lg:col-span-3"
                        action={
                            <input
                                className={`${inputCls} sm:!w-56`}
                                placeholder="Search"
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />
                        }
                    >
                        {visible.length === 0 ? (
                            <p className="py-12 text-center text-sm text-gray-500">
                                {search
                                    ? "No expenses match your search."
                                    : "No expenses added yet."}
                            </p>
                        ) : (
                            <ul className="divide-y divide-slate-200/70">

                                {visible.map((e) => (
                                    <li key={e.id}>
                                        <button
                                            onClick={() =>
                                                setSelected(e)
                                            }
                                            className="flex w-full items-center justify-between gap-4 rounded-lg px-2 py-3 text-left hover:bg-white/70"
                                        >
                                            <div className="min-w-0">

                                                <p className="truncate text-sm font-medium text-gray-900">
                                                    {e.description}
                                                </p>

                                                <p className="text-xs text-gray-500">
                                                    {e.category} ·{" "}
                                                    {new Date(
                                                        e.date
                                                    ).toLocaleDateString(
                                                        "en-IN",
                                                        {
                                                            day: "numeric",
                                                            month: "short",
                                                            year: "numeric",
                                                        }
                                                    )}
                                                </p>

                                            </div>

                                            <p className="shrink-0 text-sm font-semibold text-red-600">
                                                − {fmt(e.amount)}
                                            </p>

                                        </button>
                                    </li>
                                ))}

                            </ul>
                        )}

                        {sorted.length > perPage && (
                            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">

                                <span>
                                    Page {page} of {totalPages}
                                </span>

                                <div className="flex gap-2">

                                    <button
                                        disabled={page === 1}
                                        onClick={() =>
                                            setPage(page - 1)
                                        }
                                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-gray-700 hover:bg-slate-50 disabled:opacity-40"
                                    >
                                        Previous
                                    </button>

                                    <button
                                        disabled={
                                            page === totalPages
                                        }
                                        onClick={() =>
                                            setPage(page + 1)
                                        }
                                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-gray-700 hover:bg-slate-50 disabled:opacity-40"
                                    >
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

export default Expense;

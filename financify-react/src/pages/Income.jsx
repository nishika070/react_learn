import { useEffect, useState, useContext } from "react";
import {
    collection, getDocs, addDoc, query, where, deleteDoc, doc, updateDoc,
} from "firebase/firestore";
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

function Income() {
    const { user } = useContext(AuthContext);
    const [incomes, setIncomes] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(emptyForm());
    const [selected, setSelected] = useState(null);
    const [editing, setEditing] = useState(null);

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

                <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-5 lg:gap-6">
                    <GlassCard title={editing ? "Edit income" : "Add income"} className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-4">
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
                            <div className="flex gap-2">
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
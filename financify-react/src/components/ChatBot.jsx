import { useState, useRef, useEffect } from "react";

const inr = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const SUGGESTIONS = [
    "Total income?",
    "Total expense?",
    "Saving rate?",
    "Top spending category?",
    "This month summary",
    "Biggest expense?",
];

function isThisMonth(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d)) return false;
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function buildAnswer(question, transactions) {
    const q = question.toLowerCase();
    const incomes = transactions.filter((t) => t.type === "income");
    const expenses = transactions.filter((t) => t.type === "expense");
    const sum = (arr) => arr.reduce((s, t) => s + Number(t.amount || 0), 0);

    const totalIncome = sum(incomes);
    const totalExpense = sum(expenses);
    const savings = totalIncome - totalExpense;
    const rate = totalIncome === 0 ? 0 : Math.round((savings / totalIncome) * 100);

    if (transactions.length === 0) {
        return "I don't see any transactions yet. Add some income or expenses (or load the demo data) and ask me again.";
    }

    // category totals
    const byCat = {};
    expenses.forEach((t) => {
        const c = t.category || "Other";
        byCat[c] = (byCat[c] || 0) + Number(t.amount || 0);
    });
    const catSorted = Object.entries(byCat).sort((a, b) => b[1] - a[1]);

    if (/month/.test(q)) {
        const mi = sum(incomes.filter((t) => isThisMonth(t.date)));
        const me = sum(expenses.filter((t) => isThisMonth(t.date)));
        return `This month: income ${inr(mi)}, expense ${inr(me)}, net ${inr(mi - me)}.`;
    }
    if (/(biggest|largest|highest).*(expense|spend|transaction)|max/.test(q)) {
        if (!expenses.length) return "You have no expenses yet.";
        const top = [...expenses].sort((a, b) => Number(b.amount) - Number(a.amount))[0];
        return `Your biggest expense is ${inr(Number(top.amount))}${
            top.description ? ` for "${top.description}"` : ""
        }${top.category ? ` (${top.category})` : ""}.`;
    }
    if (/(top|most|category|categories|where)/.test(q)) {
        if (!catSorted.length) return "No expense categories yet.";
        const [name, amt] = catSorted[0];
        const share = Math.round((amt / totalExpense) * 100);
        const runner = catSorted[1] ? ` Next is ${catSorted[1][0]} at ${inr(catSorted[1][1])}.` : "";
        return `Most of your money goes to ${name}: ${inr(amt)} (${share}% of expenses).${runner}`;
    }
    if (/saving|save|rate/.test(q)) {
        return `You've saved ${inr(savings)}, which is a saving rate of ${rate}%.`;
    }
    if (/average|avg/.test(q)) {
        return expenses.length
            ? `Your average expense is ${inr(totalExpense / expenses.length)} across ${expenses.length} transactions.`
            : "No expenses yet.";
    }
    if (/how many|count|number/.test(q)) {
        return `You have ${transactions.length} transactions: ${incomes.length} income and ${expenses.length} expense.`;
    }
    if (/balance|net|left/.test(q)) {
        return `Your net balance is ${inr(savings)} (income ${inr(totalIncome)} minus expense ${inr(totalExpense)}).`;
    }
    if (/expense|spend|spent/.test(q)) {
        return `Your total expense is ${inr(totalExpense)} across ${expenses.length} transactions.`;
    }
    if (/income|earn|salary/.test(q)) {
        return `Your total income is ${inr(totalIncome)} across ${incomes.length} transactions.`;
    }
    return "I can answer questions about total income, total expense, savings, top category, this month's summary and your biggest expense. Try one of the suggestions below.";
}

export default function ChatBot({ transactions = [] }) {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([
        {
            from: "bot",
            text: "Hi! Ask me about your income, expenses or savings.",
        },
    ]);
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, open]);

    function send(text) {
        const value = (text ?? input).trim();
        if (!value) return;
        setMessages((m) => [...m, { from: "user", text: value }]);
        setInput("");
        setTimeout(() => {
            setMessages((m) => [
                ...m,
                { from: "bot", text: buildAnswer(value, transactions) },
            ]);
        }, 350);
    }

    return (
        <>
            {open && (
                <div
                    role="dialog"
                    aria-label="Financify assistant"
                    className="fixed bottom-24 right-4 sm:right-6 z-50 flex h-[28rem] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_16px_48px_rgba(30,58,138,0.22)]"
                >
                    <div className="flex items-center justify-between bg-[#5079b5] px-4 py-3 text-white">
                        <div>
                            <p className="text-sm font-semibold">Financify Assistant</p>
                            <p className="text-xs text-white/75">Answers from your data</p>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            aria-label="Close chat"
                            className="rounded-md px-2 py-1 text-lg leading-none hover:bg-white/15"
                        >
                            ×
                        </button>
                    </div>

                    <div className="flex-1 space-y-2 overflow-y-auto bg-slate-50 p-3">
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-snug ${
                                    m.from === "user"
                                        ? "ml-auto bg-[#5079b5] text-white"
                                        : "border border-slate-200 bg-white text-gray-800"
                                }`}
                            >
                                {m.text}
                            </div>
                        ))}
                        <div ref={endRef} />
                    </div>

                    <div className="flex flex-wrap gap-1.5 border-t border-slate-100 bg-slate-50 px-3 py-2">
                        {SUGGESTIONS.map((s) => (
                            <button
                                key={s}
                                onClick={() => send(s)}
                                className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs text-[#3f649a] hover:bg-slate-100"
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2 border-t border-slate-100 p-3">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && send()}
                            placeholder="Ask about your finances"
                            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#5079b5] focus:ring-2 focus:ring-[#5079b5]/20"
                        />
                        <button
                            onClick={() => send()}
                            className="rounded-lg bg-[#5079b5] px-4 text-sm text-white hover:bg-[#3f649a]"
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}

            <button
                onClick={() => setOpen((o) => !o)}
                aria-label={open ? "Close assistant" : "Open assistant"}
                className="fixed bottom-6 right-4 sm:right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#5079b5] text-white shadow-[0_8px_24px_rgba(80,121,181,0.5)] transition hover:bg-[#3f649a]"
            >
                {open ? (
                    <span className="text-2xl leading-none">×</span>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                )}
            </button>
        </>
    );
}
import { useState, useEffect, useContext, useCallback } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { seedOnce } from "../seedOnce";
import StatCard from "../components/StatCard";
import Searchbar from "../components/SearchBar";
import TransactionList from "../components/TransactionList";
import Pagination from "../components/Pagination";
import IncomeExpenseChart from "../components/IncomeExpenseChart";
import ExpenseCategoryChart from "../components/ExpenseCategoryChart";
import ChatBot from "../components/ChatBot";
import { Icon } from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";

function GlassCard({ title, subtitle, action, children, className = "" }) {
    return (
        <section
            className={`rounded-3xl border border-white/70 bg-white/60 backdrop-blur-xl p-5 sm:p-6 shadow-[0_8px_32px_rgba(80,121,181,0.12)] ${className}`}
        >
            {(title || action) && (
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        {title && (
                            <h2 className="text-base font-semibold text-[var(--color-superheading)]">
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>
                        )}
                    </div>
                    {action}
                </div>
            )}
            {children}
        </section>
    );
}

function greeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
}

function firstName(user) {
    if (!user) return "";
    if (user.displayName) return user.displayName.split(" ")[0];
    if (user.isAnonymous) return "Guest";
    return user.email ? user.email.split("@")[0] : "";
}

function Dashboard() {
    const [transactions, setTransactions] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [expenses, setExpenses] = useState([]);
    const [seeding, setSeeding] = useState(false);
    const { user } = useContext(AuthContext);

    const loadList = useCallback(async () => {
        if (!user) return;

        const [expenseSnapshot, incomeSnapshot] = await Promise.all([
            getDocs(query(collection(db, "expenses"), where("uid", "==", user.uid))),
            getDocs(query(collection(db, "incomes"), where("uid", "==", user.uid))),
        ]);

        const expenseArray = expenseSnapshot.docs.map((doc) => ({
            id: doc.id,
            type: "expense",
            ...doc.data(),
        }));
        const incomeArray = incomeSnapshot.docs.map((doc) => ({
            id: doc.id,
            type: "income",
            ...doc.data(),
        }));

        setExpenses(expenseArray);
        setTransactions([...expenseArray, ...incomeArray]);
    }, [user]);

    useEffect(() => {
        loadList();
    }, [loadList]);

    async function handleSeed() {
        setSeeding(true);
        try {
            await seedOnce(user.uid);
            await loadList();
        } finally {
            setSeeding(false);
        }
    }

    // ============================ Cards ============================

    const totalIncome = transactions.reduce(
        (total, t) => (t.type === "income" ? total + Number(t.amount || 0) : total),
        0
    );
    const totalExpense = transactions.reduce(
        (total, t) => (t.type === "expense" ? total + Number(t.amount || 0) : total),
        0
    );
    const totalCategories = new Set(
        transactions.map((t) => t.category).filter(Boolean)
    ).size;
    const savingRate =
        totalIncome === 0
            ? 0
            : Math.round(((totalIncome - totalExpense) / totalIncome) * 100);

    // ============================ Search ============================

    const filteredTransactions = transactions.filter((t) =>
        (t.description || "").toLowerCase().includes(search.toLowerCase())
    );
    const sortedTransaction = [...filteredTransactions].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
    );

    // ============================ Pagination ============================

    const recordsPerPage = 5;
    const startIndex = (currentPage - 1) * recordsPerPage;
    const visibleTransactions = sortedTransaction.slice(
        startIndex,
        startIndex + recordsPerPage
    );
    const totalPages = Math.ceil(sortedTransaction.length / recordsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const name = firstName(user);
    const todayLabel = new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
            {/* Header */}
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl tracking-tight text-gray-800">
                        <span className="font-normal">{greeting()}</span>
                        {name && (
                            <span className="font-semibold text-[#5079b5]">
                                , {name}
                            </span>
                        )}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        {todayLabel}. Here's your financial overview.
                    </p>
                </div>

                <button
                    onClick={handleSeed}
                    disabled={seeding}
                    className="rounded-md bg-[#5079b5] px-2.5 py-1 text-[11px] text-white transition hover:bg-[#3f649a] disabled:opacity-60"
                >
                    {seeding ? "Adding..." : "Demo Data"}
                </button>
            </header>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
                <StatCard
                    title="Total Income"
                    value={`₹${totalIncome.toLocaleString("en-IN")}`}
                    valueColor="text-green-600"
                    icon={<Icon name="income" />}
                    iconClass="bg-green-100 text-green-700"
                />
                <StatCard
                    title="Total Expense"
                    value={`₹${totalExpense.toLocaleString("en-IN")}`}
                    valueColor="text-red-600"
                    icon={<Icon name="expense" />}
                    iconClass="bg-red-100 text-red-600"
                />
                <StatCard
                    title="Categories"
                    value={totalCategories}
                    icon={<Icon name="categories" />}
                />
                <StatCard
                    title="Saving Rate"
                    value={`${savingRate}%`}
                    valueColor={savingRate < 0 ? "text-red-600" : undefined}
                    icon={<Icon name="saving" />}
                />
            </div>

            {/* Charts: 3/5 + 2/5 */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
                <GlassCard
                    title="Income vs Expense"
                    subtitle="Weekly income compared to expenses"
                    className="lg:col-span-3"
                >
                    <div className="h-64">
                        <IncomeExpenseChart
                            incomes={transactions.filter((t) => t.type === "income")}
                            expenses={expenses}
                        />
                    </div>
                </GlassCard>

                <GlassCard
                    title="Expense Categories"
                    subtitle="Where your money goes"
                    className="lg:col-span-2"
                >
                    <div className="h-64">
                        <ExpenseCategoryChart expenses={expenses} />
                    </div>
                </GlassCard>
            </div>

            {/* Transactions */}
            <GlassCard
                title="Recent Transactions"
                subtitle={`${sortedTransaction.length} ${
                    sortedTransaction.length === 1 ? "record" : "records"
                }`}
                action={
                    <div className="w-full sm:w-64 [&_input]:!w-full">
                        <Searchbar search={search} setSearch={setSearch} />
                    </div>
                }
            >
                {sortedTransaction.length === 0 ? (
                    <p className="py-12 text-center text-sm text-gray-500">
                        {search
                            ? "No transactions match your search."
                            : "No transactions yet. Add income or an expense to get started."}
                    </p>
                ) : (
                    <>
                        <TransactionList transactions={visibleTransactions} />
                        {totalPages > 1 && (
                            <div className="mt-4 flex justify-center">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    setCurrentPage={setCurrentPage}
                                />
                            </div>
                        )}
                    </>
                )}
            </GlassCard>

            {/* Floating assistant */}
            <ChatBot transactions={transactions} />
        </div>
    );
}

export default Dashboard;
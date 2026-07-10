import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";

import StatCard from "../components/StatCard";
import Searchbar from "../components/SearchBar";
import TransactionList from "../components/TransactionList";
import Pagination from "../components/Pagination";
import IncomeExpenseChart from "../components/IncomeExpenseChart";
import ExpenseCategoryChart from "../components/ExpenseCategoryChart";
 function Dashboard() {
    const [transactions, setTransactions] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [expenses,setExpenses]=useState([]);
    const loadList = async () => {
        const expenseSnapshot = await getDocs(collection(db, "expenses"));
        const incomeSnapshot = await getDocs(collection(db, "incomes"));

        const expenseArray = expenseSnapshot.docs.map((doc) => ({
            id: doc.id,
            type: "expense",
            ...doc.data(),
        }));
        setExpenses(expenseArray)

        const incomeArray = incomeSnapshot.docs.map((doc) => ({
            id: doc.id,
            type: "income",
            ...doc.data(),
        }));

        setTransactions([
            ...expenseArray,
            ...incomeArray,
        ]);
    };

    useEffect(() => {
        loadList();
    }, []);

    // ============================
    // Cards
    // ============================

    const totalIncome = transactions.reduce((total, transaction) => {
        return transaction.type === "income"
            ? total + transaction.amount
            : total;
    }, 0);

    const totalExpense = transactions.reduce((total, transaction) => {
        return transaction.type === "expense"
            ? total + transaction.amount
            : total;
    }, 0);

    const totalCategories = new Set(
        transactions.map((transaction) => transaction.category)
    ).size;

    const savingRate =
        totalIncome === 0
            ? 0
            : (
                  ((totalIncome - totalExpense) / totalIncome) *
                  100
              ).toFixed(2);

    // ============================
    // Search
    // ============================

    const filteredTransactions = transactions.filter((transaction) =>
        transaction.description
            .toLowerCase()
            .includes(search.toLowerCase())
    );
    const sortedTransaction=[...filteredTransactions].sort((a,b)=>{
        new Date(b.date)-new Date(a.date);
    })

    // ============================
    // Pagination
    // ============================

    const recordsPerPage = 5;

    const startIndex = (currentPage - 1) * recordsPerPage;

    const endIndex = startIndex + recordsPerPage;

    const visibleTransactions = sortedTransaction.slice(
        startIndex,
        endIndex
    );

    const totalPages = Math.ceil(
        sortedTransaction.length / recordsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    return (
        <div className="max-w-7xl mx-auto px-3 py-4">

            {/* ================= Header ================= */}

            <div className="mb-4">

                <h1
                    className="
                        text-[20px]
                        font-semibold
                        text-[var(--color-heading)]
                    "
                >
                    Dashboard
                </h1>

                <p className="mt-2 text-gray-500">
                    Manage and monitor all your finances.
                </p>

            </div>

            {/* ================= Cards ================= */}

            <div className="grid grid-cols-4 gap-3 mb-8 px-5">

                <StatCard
                    title="Total Income"
                    value={`₹${totalIncome.toLocaleString("en-IN")}`}
                    valueColor="text-green-700"
                />

                <StatCard
                    title="Total Expense"
                    value={`₹${totalExpense.toLocaleString("en-IN")}`}
                    valueColor="text-red-600"
                />

                <StatCard
                    title="Categories"
                    value={totalCategories}
                />

                <StatCard
                    title="Saving Rate"
                    value={`${savingRate}%`}
                />

            </div>

            {/* ================= Main Layout ================= */}

            <div className="flex gap-6 mt-8">

                {/* Left Section */}

                <div className="w-[45%]">

                    <div className="flex justify-between items-center mb-4">

                        <h2
                            className="
                                text-xl
                                font-semibold
                                text-[var(--color-superheading)]
                            "
                        >
                            Recent Transactions
                        </h2>

                        <Searchbar
                            search={search}
                            setSearch={setSearch}
                        />

                    </div>

                    <TransactionList
                        transactions={visibleTransactions}
                    />

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        setCurrentPage={setCurrentPage}
                    />

                </div>

                {/* Right Section */}

                <div className="w-[55%]">

                    <div
                        className="
                            bg-white
                            ml-5
                            p-4
                            border-2
                            border-l-4
                            border-l-[var(--color-superheading)]
                            border-transparent
                            rounded-md
                            shadow-md
                        ">

                        <h2
                            className="
                                text-xl
                                font-semibold
                                m-4
                                mb-1
                                pt-7
                                ml-5
                                text-[var(--color-superheading)]
                            ">
                            Analysis
                        </h2>

                        <div>
                            {/* graphs */}
                            {/* bar incomevs expense */}
                            <IncomeExpenseChart
                                        totalIncome={totalIncome}
                                        totalExpense={totalExpense}/>
                            <ExpenseCategoryChart
                                        expenses={expenses}/>

                        </div>


                    </div>

                </div>

            </div>

        </div>
    );
}

export default Dashboard;
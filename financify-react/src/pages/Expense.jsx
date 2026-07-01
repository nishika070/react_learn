import { useEffect, useState } from "react";

import ExpenseForm from "../components/ExpenseForm";
import SearchBar from "../components/SearchBar";
import RecordList from "../components/RecordList";
import StatCard from "../components/StatCard";

import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";

function Expense() {

    const [expenses, setExpenses] = useState([]);

    const loadList = async () => {
        const snapshot = await getDocs(collection(db, "expenses"));

        const expenseArray = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        setExpenses(expenseArray);
    };

    useEffect(() => {
        loadList();
    }, []);
    // ==============================
    // ======/card====================
    // ----------------------------
    const totalExpense = expenses.reduce((total,expense)=>{
        return total + expense.amount;
    },0);
    const totalTransactions = expenses.length;
    const totalCategories = new Set(
    expenses.map(expense => expense.category)
    ).size;
    //------------------------------
    //------main return ------------
    //------------------------------
    return (
        <>
        <div className="max-w-7xl mx-auto px-8 py-4">
            {/*-------------HEADING -------------*/}
            <div className="mb-4">
            <h1
                className="
                    text-[20px]
                    font-semibold
                    text-[var(--color-heading)]">
                Expense Page
            </h1>
            <p  
                className="
                    text-gray-500
                    mt-2
                    ">
                Manage and monitor your daily expenses.
            </p>
            </div>
            {/*-------------CARDS -------------*/}


            <div className="grid grid-cols-3 gap-6 mb-8">
            <StatCard 
                title="Total Expense"
                value={`${totalExpense}`}
            />
            <StatCard 
                title="Transactions"
                value={`${totalTransactions}`}
            />
            <StatCard 
                title="Categories"
                value={`${totalCategories}`}
            />
            </div>
            {/*-------------TWO COL LAYOUT  -------------*/}

            <div className="flex gap-6 mt-8">

                <div className="w-1/2">
                    <ExpenseForm loadList={loadList}/>
                </div>

                <div className="w-1/2">
                    <SearchBar />

                    <RecordList
                        expenses={expenses}
                    />
                </div>

            </div>
        </div>
        </>
    );
}

export default Expense;
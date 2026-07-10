import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import ExpenseForm from "../components/ExpenseForm";
import SearchBar from "../components/SearchBar";
import RecordList from "../components/RecordList";
import Pagination from "../components/Pagination";
import TransactionList from "../components/TransactionList";

function Expense() {

    const [expenses, setExpenses] = useState([]);
    const [search,setSearch] = useState("");


    const loadList = async () => {
        // function loadlist to load the list
        const snapshot = await getDocs(collection(db, "expenses"));
        // get docs basically return the object
        // now with .docs we get details saved like id:data
        // for all docs we save them in expense array 
        const expenseArray = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        // now setExpenses updates the Expenses with the expenseArray
        setExpenses(expenseArray);
    };
    // helps in load here it loads load list but can work on submit as well

    useEffect(() => {
        loadList();
    }, []);
    // ==============================
    // ======/card====================
    // ----------------------------
    const totalExpense = expenses.reduce((total,expense)=>{
        console.log(total);
        return total + expense.amount;
    },0);
    const totalTransactions = expenses.length;
    const totalCategories = new Set(
    expenses.map(expense => expense.category)
    ).size;
    const filteredExpenses = expenses.filter((expense) => expense.description.toLowerCase().includes(search.toLowerCase()));
    //------------------------------
    //------Pagination logic  ------
    //------------------------------
    const sortedExpense=[...filteredExpenses].sort((a,b)=>{
        new Date(b.date)-new Date(a.date);
    })
    const [currentPage,setCurrentPage]=useState(1)
    const recordsPerPage=5;
    const startIndex=(currentPage-1)*recordsPerPage
    const endIndex=(startIndex +recordsPerPage);
    let visibleExpenses=sortedExpense.slice(startIndex,endIndex);
    const totalPages= Math.ceil(sortedExpense.length/recordsPerPage);

    //------------------------------
    //------main return ------------
    //------------------------------
    
    return (
        <>
        

        <div className="max-w-7xl mx-auto px-3 py-4 ">
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


            <div className="grid grid-cols-3 gap-6 mb-8 px-5">
            <StatCard 
                title="Total Expense"
                value={`₹${totalExpense.toLocaleString("en-IN")}`}
                                valueColor="text-red-600"

            />
            <StatCard 
                title="Total Transactions"
                value={`${totalTransactions}`}
            />
            <StatCard 
                title="Categories"
                value={`${totalCategories}`}
            />
            </div>
            {/*-------------TWO COL LAYOUT  -------------*/}

            <div className="flex gap-6 ml-5 mt-8">

                <div className="w-[40%]">
                    <ExpenseForm loadList={loadList}/>
                </div>

                <div className="flex-1">
                    <div className="flex
                                   justify-between
                                ">
                    <h2 className="
                        text-xl 
                        font-semibold 
                        m-4
                        mb-1
                        pt-7
                        ml-5
                        text-center
                        text-[var(--color-superheading)]
                    "   
                    >Expense Record</h2>
                    <SearchBar
                        search={search}
                        setSearch={setSearch} 
                    / >
                    </div>    
                    <div>
                    <RecordList
                        expenses={visibleExpenses}
                    />
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        setCurrentPage={setCurrentPage}

                        />
                    </div>
               
            </div>

            </div>
            
        </div>
        </>
    );
}

export default Expense;
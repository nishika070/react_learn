import { useState } from "react"
import StatCard from "../components/StatCard"
import { collection, getDocs } from "firebase/firestore";
import {db} from "../firebase/firebase"
import { useEffect } from "react";
import TransactionList from "../components/TransactionList";
import Searchbar from "../components/SearchBar";
//load
//async load kro 


function Dashboard(){
    const [transactions,setTransactions]=useState([]);
    const [search,setSearch]=useState("");
    const loadList=async()=>{
        const expenseSnapshot = await getDocs(collection(db,"expenses"))
        const incomeSnapshot  = await getDocs(collection(db,"incomes"))
        const expenseArray = expenseSnapshot.docs.map((doc)=>({
            id:doc.id,
            type : "expense" ,
            ...doc.data()

        }));
        const incomeArray = incomeSnapshot.docs.map((doc)=>({
            id:doc.id,
            type : "income" ,
            ...doc.data()

        }))
        const transactionArray=[
            ...expenseArray,
            ...incomeArray
        ]
        setTransactions(transactionArray)
    }
    useEffect(()=>{
        loadList();
    },[]);
    const totalIncome=transactions.reduce((total,transaction)=>{
        if(transaction.type==="income"){
            return total+transaction.amount;
        }
        else {
            return total;
        }
    },0)
    const totalExpense=transactions.reduce((total,transaction)=>{
        if(transaction.type==="expense"){
            return total+transaction.amount;
        }
        else {
            return total;
        }
    },0)
    const totalCategories = new Set(
        transactions.map((transaction)=>transaction.category)
    ).size;
    const savingRate=
        totalIncome === 0
        ? 0
        :(((totalIncome-totalExpense)/totalIncome)*100).toFixed(2);
    
    return(
        <div>
            <div>
                {/* heading */}
                <h2>Dashboards</h2>
                <p>Manage and monitor your expenses.</p>

            </div>
            <div className="grid grid-cols-4">
                {/* cardss */}
                <StatCard title="Total Income"
                          value={totalIncome}
                          />
                <StatCard title="Total Expense"
                          value={totalExpense}
                          />
                <StatCard title="Categories"
                          value={totalCategories}
                          />
                <StatCard title="Saving Rate"
                          value={savingRate}
                          />
                
            </div>
            <div>
                <div>
                    {/* total transactions */}
                    {/* list  */}
                    <Searchbar search={search}
                                setSearch={setSearch}/>
                   <TransactionList transactions={transactions}/> 
                </div>
                <div>
                    {/* chart of categories  */}
                </div>
            </div>
        </div>
    )
}
export default Dashboard
import Navbar from "../components/Navbar"
import IncomeForm from "../components/IncomeForm"
import IncomeList from "../components/IncomeList"
import StatCard from "../components/StatCard"
import Searchbar from "../components/SearchBar"
import { collection,getDocs } from "firebase/firestore"
import { useState } from "react"
import { Await } from "react-router-dom"
import { useEffect } from "react"
import {db} from "../firebase/firebase"
import Expense from "./Expense"
function Income(){
    //load the data 
    const [incomes,setIncome]=useState([]);
    const [search,setSearch]=useState("");
    const loadList=async()=>{
        const snapshot = await getDocs (collection(db,"incomes"));
        const expenseArray = snapshot.docs.map(doc=>({
            id:doc.id,
            ...doc.data()
        }));
        setIncome(expenseArray);
    }

    //define usestate
    useEffect(
        ()=>{
            loadList();
        },[]
    )
    
    //cards banao
    const totalIncome =incomes.reduce((total,income)=>{
        return total+income.amount;
    },0);
    const totalTransactions= incomes.length;
    const totalCategories =new Set(
        incomes.map(income=>income.category)

    ).size;
    const filteredIncome=incomes.filter((income)=>income.description.toLowerCase().includes(search.toLowerCase()));

    return (
        <>
        {/* bnaoooo yha pr cards call kro  */}
        <div>
            <div>
                {/* title */}
                <h2>Income Page</h2>
                <p>Manage and monitor your daily incomes.</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
                {/* stat cards  */}
                <StatCard
                    title="Total Income"
                    value={`${totalIncome}`}/>
                <StatCard
                    title="Transactions"
                    value={`${totalTransactions}`}/>                
                <StatCard
                    title="Categories"
                    value={`${totalCategories}`}/>
            </div>
            <div className="flex p-3 gap-2">
                <div className="w-1/2">
                    {/* expense form comes here  */}
                    <IncomeForm loadList={loadList}/>
                </div>
                <div className="flex flex-col p-3 g-2 w-1/2">
                    {/* so list comes here  */}
                    <Searchbar 
                        search={search}
                        setSearch={setSearch} />
                    <IncomeList incomes ={filteredIncome}/>
                </div>
            </div>
        </div>

        </>
        )
}
export default Income
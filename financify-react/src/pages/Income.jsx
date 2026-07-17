import {db} from "../firebase/firebase"
import { useState } from "react"
import { Await, data } from "react-router-dom"
import { useEffect } from "react"
import Navbar from "../components/Navbar"
import StatCard from "../components/StatCard"
import IncomeForm from "../components/IncomeForm"
import Searchbar from "../components/SearchBar"
import IncomeList from "../components/IncomeList"
import Expense from "./Expense"
import Pagination from "../components/Pagination"
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import TransactionModal from "../components/TransactionModal"
import {
    collection,
    getDocs,
    query,
    where,
    deleteDoc,
    doc,
    updateDoc,
} from "firebase/firestore";
function Income(){
    const { user } = useContext(AuthContext);
    //load the data 
    const [incomes,setIncome]=useState([]);
    const [search,setSearch]=useState("");
    const [selectedIncome,setSelectedIncome]=useState(null);
    const [editingIncome,setEditingIncome]=useState(null);

    // initally it is null

    
    const loadList=async()=>{const q = query(
            collection(db, "incomes"),
            where("uid", "==", user.uid)
        );

        const snapshot = await getDocs(q);

        const incomeArray = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        setIncome(incomeArray);
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
//================================
    // pagination logic
// ===============================
    // so what is the pagination logic
    const sortedIncome=[...filteredIncome].sort((a,b)=>{
        return new Date(b.date)-new Date(a.date);
    })
    const [currentPage,setCurrentPage]=useState(1)
    const recordsPerPage=5
    const startIndex=(currentPage-1)*recordsPerPage 
    const endIndex=(startIndex + recordsPerPage);
    let visibleIncome=sortedIncome.slice(startIndex,endIndex);
    const totalPages=Math.ceil(sortedIncome.length/recordsPerPage);

    // u ave const per page
    // start end
    // .slice
    const handleDelete=async()=>{
        await deleteDoc(
            doc(db,"incomes",selectedIncome.id)
        );
        await loadList();
        setSelectedIncome(null);

    }
    const handleEdit=()=>{
        setEditingIncome(selectedIncome)
        setSelectedIncome(null);
    }
   
    return (
        <>
        {/* bnaoooo yha pr cards call kro  */}
        <div className="max-w-7xl mx-auto px-3 py-4">
            <div className="mb-4">
                {/* title */}
                <h1 
                    className="
                            font-semibold
                            text-[20px]
                            text-var[--color-headin)]
                            ">
                    Income Page
                </h1>
                <p
                    className="
                            mt-2
                            text-gray-500">
                    Manage and monitor your daily incomes.
                </p>
            </div>
            {/* ================================== */}
            {/* ===========Cards=================== */}
            {/* =================================== */}
            
            <div className="grid grid-cols-3 mb-8 px-5 gap-3">
                {/* stat cards  */}
                <StatCard
                    title="Total Income"
                    value={`+ ${totalIncome.toLocaleString("en-IN")}`}
                            valueColor="text-green-700"/>
                <StatCard
                    title="Transactions"
                    value={`${totalTransactions}`}/>                
                <StatCard
                    title="Categories"
                    value={`${totalCategories}`}/>
            </div>
            {/*-------------TWO COL LAYOUT  -------------*/}

            <div className="flex gap-6 ml-5 mt-8">
                <div className="w-[40%]">
                    {/* income form comes here  */}
                    <IncomeForm loadList={loadList}
                    editingIncome={editingIncome}
                    setEditingIncome={setEditingIncome}
                    />
                </div>
                {/* the income transaction side  */}
                <div className="w-[60%]">
                    <div className="flex
                                    justify-between">

                        {/* heading + search btn  */}
                        <h2 className="
                            text-xl
                            font-semibold
                            m-4
                            mb-1
                            pt-7
                            ml-5
                            text-[var(--color-superheading)]">
                            Income Record
                        </h2>
                        <Searchbar
                            search={search}
                            setSearch={setSearch}/>

                    </div>
                   <IncomeList
                             incomes={visibleIncome}
                             setSelectedIncome={setSelectedIncome}
                    />
                    <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            setCurrentPage={setCurrentPage}
                    />
                </div>
                
            </div>
        </div>
        {selectedIncome && (
            <TransactionModal
                        transaction={selectedIncome}
                        onClose={()=>setSelectedIncome(null)}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
/>        )}
        </>
        )
}
export default Income
import {db} from "../firebase/firebase";
// from (db) from file 
import { useState } from "react";
import {addDoc , collection} from "firebase/firestore"
// from library
function ExpenseForm({loadList}){
    const [description,setDescription]=useState("");
    const [amount,setAmount]=useState("");
    const [date,setDate]=useState("");
    const [category,setCategory]=useState("");
    const handleSubmit=async(e)=>{
        e.preventDefault();
        const expense= {
            description,
            amount:Number(amount),
            date,
            category
        };
        
        console.log("till the expense object is made")
        //object ko database pr dena
        //add docs to submiT/SAVE data on the database {firebase in this particular case }

        await addDoc(
            collection(db,"expenses"),expense
        )
       console.log("the object is addedto the expenses in the database");
       
        setDescription("");
        setAmount("");
        setDate("");
        setCategory("");
        console.log("now loadlist will be await")
        await loadList();
        console.log("loadlist updated ")
         alert("saved!")
    };
    return(
        
        <form 
            onSubmit={handleSubmit}

            className="
            bg-[var(--color-card)]
            rounded-[var(--radius-md)] 
            shadow-[var(--shadow-card)]
            p-6
            " >
            <h2 className="
                text-2xl 
                font-semibold 
                mb-6
                text-[var(--color-superheading)]
               
            ">
                +Add New Expense
            </h2>
            <div className="mb-5">
                <label htmlFor="Description"
                    className="
                        block
                        mb-2
                        font-medium
                        p-2
                        rounded-[var(--radius-sm)]
                        "
                >
                    Description
                </label>
                <input 
                    id="Description"
                    type="text"
                    placeholder="for ex. Petrol Expense"
                    value={description}
                    onChange={(e)=> setDescription(e.target.value)}
                    className="
                        w-1/2
                        border
                        rounded-md
                        px-3
                        py-2"/>
            </div>
            <div className="mb-5">
                <label htmlFor="Amount"
                className="
                        block
                        mb-2
                        font-medium
                        p-2
                        rounded-[var(--radius-sm)]
                        ">Amount</label>
                <input
                    id="Amount"
                    type="number"
                    placeholder="1000"
                    value={amount}
                    onChange={(e)=>setAmount(e.target.value)}
                    className="
                        w-1/2
                        border
                        rounded-md
                        px-3
                        py-2"

                >
                </input>
            </div>
            <div className="mb-5">
                <label htmlFor="Date"
                className="
                        block
                        mb-2
                        font-medium
                        p-2
                        rounded-[var(--radius-sm)]
                        ">Date</label>
                <input 
                    type="date" 
                    id="Date"
                    value={date}
                    onChange={(e)=>setDate(e.target.value)}
                    className="
                        w-1/2
                        border
                        rounded-md
                        px-3
                        py-2"


                />
            </div>
            <div className="mb-5">
                <label htmlFor="Category"
                className="
                        block
                        mb-2
                        font-medium
                        p-2
                        rounded-[var(--radius-sm)]
                        ">Category</label>

                <select 
                        value={category}
                        onChange={(e)=>setCategory(e.target.value)}
                        className="
                        w-1/2
                        border
                        rounded-md
                        px-3
                        py-2"
                        >
                    <option value="">Select Category</option>
                    <option value="Food">Food</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Bills">Bills</option>
                    <option value="Travel">Travel</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other">Other</option>
                    
                </select>
            </div>
            <div className="mb-5">
                
                <button id="submitBtn"
                type="submit"
                className="
                     w-full
                     bg-[var(--color-primary)]
                     text-white
                     py-3
                     mt-3
                     rounded-md
                     "
                    >
                        AddExpense
                </button>
            </div>





        </form>
    )
}
export default ExpenseForm;
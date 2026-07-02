import { useState } from "react";
import {db} from "../firebase/firebase"
import { collection,addDoc } from "firebase/firestore";
function IncomeForm({loadList}){
    const [description,setDescription]=useState("");
    const [amount,setAmount]=useState("");
    const [date,setDate]=useState("");
    const [category,setCategory]=useState("");
    const handleSubmit=async(e)=>{
        e.preventDefault();
        const income={
            description,
            amount:Number(amount),
            date,
            category
        };
        console.log(income);
        
        await addDoc(
           collection(db,"incomes"),income
        )  
        setDescription("");
        setAmount("");
        setDate("");
        setCategory("");      
        alert("saved");
        await loadList();

    }


    
    return (
        <>
        {/* now u have to create a form */}
        <form 
            onSubmit={handleSubmit}
            // whyt not handlesubmit() bcz that is a call of the function
            //not the instance but here we rsending the instance 
            className="
                    flex
                    flex-col
                    gap-2
                    ">
                        
            {/* heading part */}
            <div>
                <h3>+ Add Income Record</h3>
            </div>
            {/* description label and input */}
            <div>
                <label htmlFor="description">
                        Description
                </label>
                <input type="text"
                        placeholder="ex. Petrol"
                        id="description"
                        onChange={(e)=>setDescription(e.target.value)}/>

            </div>
            {/* amount label and input */}
            <div>
                <label htmlFor="amount">
                        Amount
                </label>
                <input type="number"
                        placeholder="ex.1000"
                        id="amount"
                        onChange={(e)=>setAmount(e.target.value)}
                />
            </div>
            {/* date label and input */}
            <div>
                <label htmlFor="date">
                    Date

                </label>
                <input type="date"
                        id="date"
                        onChange={(e)=>setDate(e.target.value)}/>
            </div>
            {/* category label and input */}
            <div>
                <label htmlFor="category">Category</label>
                <select id="category"
                        onChange={(e)=>setCategory(e.target.value)}>
                    <option value="">Select Category</option>
                    <option value="Bussiness" >Bussiness</option>
                    <option value="Salary" >Salary</option>
                    <option value="FreeLancing" >FreeLancing</option>
                    <option value="Other" >Other</option>

                </select>
            </div>
            {/* button  */}
            <button id="submitBtn">Submit </button>
        </form>
        </>
    )

};
export default IncomeForm;
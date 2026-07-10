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
                    p-6
                    mt-7
                    space-y-5
                    bg-[var(--color-card)]
                    rounded-[var(--radius-md)]

                    shadow-md

                    border-l-4
                    border-l-transparent

                    hover:border-l-[var(--color-superheading)]

                    transition-all
                    duration-300 

                    ">
                        
            {/* heading part */}
           
                <h2 className="
                                text-xl
                                font-semibold
                                text-[var(--color-superheading)]
                                border-b-2
                                border-[var(--color-superheading)]
                                border-b
                                pb-2
                                mb-4
                                "   >+ Add New Income</h2>
            
            {/* description label and input */}
            <div>
                <label htmlFor="description"
                    className="
                        block
                        mb-2
                        font-medium
                        ">
                        Description
                </label>
                <input 
                        id="description"
                        type="text"
                        placeholder="ex. Petrol"
                        value={description}
                        onChange={(e)=>setDescription(e.target.value)}
                        className="
                                w-full
                                border
                                rounded-md
                                px-3
                                py-2
                                
                                focus:outline-none
                                focus:ring-2
                                focus:ring-[var(--color-superheading)]
                                focus:border-transparent
                                "  
                                />

            </div>
            {/* amount label and input */}
            <div>
                <label htmlFor="amount"
                        className="
                                block
                                mb-2
                                font-medium
                                ">
                        Amount
                </label>
                <input  type="number"
                        id="amount"
                        placeholder="ex.1000"
                        onChange={(e)=>setAmount(e.target.value)}
                        className="
                                w-full
                                border
                                rounded-md
                                px-3
                                py-2
                                
                                focus:outline-none
                                focus:ring-2
                                focus:ring-[var(--color-superheading)]
                                focus:border-transparent"   
                />
            </div>
            {/* date label and input */}
            <div>
                <label htmlFor="date"
                className="
                        block
                        mb-2
                        font-medium">
                    Date

                </label>
                <input type="date"
                        id="date"
                        onChange={(e)=>setDate(e.target.value)}
                        className="
                        w-full
                        border
                        rounded-md
                        px-3
                        py-2

                        focus:outline-none
                        focus:ring-2
                        focus:ring-[var(--color-superheading)]
                        focus:border-transparent
                        "/>
            </div>
            {/* category label and input */}
            <div>
                <label htmlFor="category"
                        className="
                        block
                        mb-2
                        font-medium">Category</label>
                <select id="category"
                        className="
                        w-full
                        border
                        rounded-md
                        px-3
                        py-2

                        focus:outline-none
                        focus:ring-2
                        focus:ring-[var(--color-superheading)]
                        focus:border-transparent
                        "
                        onChange={(e)=>setCategory(e.target.value)}>
                    <option value="">Select Category</option>
                    <option value="Bussiness" >Bussiness</option>
                    <option value="Salary" >Salary</option>
                    <option value="FreeLancing" >FreeLancing</option>
                    <option value="Other" >Other</option>

                </select>
            </div>
            {/* button  */}
            <button id="submitBtn"
            className="
                     w-full
                     bg-[var(--color-primary)]
                     text-white
                     py-3
                     mt-3
                     rounded-md
                     hover:bg-[var(--color-primary-hover)]
                     transition-colors
                     duration-300
                     ">Submit </button>
        </form>
        </>
    )

};
export default IncomeForm;
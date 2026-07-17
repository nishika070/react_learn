import { useState ,useContext ,useEffect} from "react";
import {db} from "../firebase/firebase"
import { collection,addDoc,updateDoc,doc } from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";
function IncomeForm({loadList ,editingIncome,setEditingIncome}){
    const [description,setDescription]=useState("");
    const [amount,setAmount]=useState("");
    const [date,setDate]=useState("");
    const [category,setCategory]=useState("");
    const {user}=useContext(AuthContext);
    const handleSubmit = async (e) => {
    e.preventDefault();

    const income = {
        uid: user.uid,
        description,
        amount: Number(amount),
        date,
        category,
    };

    if (editingIncome) {

        await updateDoc(
            doc(db, "incomes", editingIncome.id),
            income
        );
        alert("updated!")
        setEditingIncome(null);

    } else {

        await addDoc(
            collection(db, "incomes"),
            
            income
        );
        alert("saved!")

    }

    setDescription("");
    setAmount("");
    setDate("");
    setCategory("");

    await loadList();
};
    //useeffect when editing income vhanges 
    useEffect(()=>{
        if(editingIncome ){
            setDescription(editingIncome.description);
            setAmount(editingIncome.amount);
            setDate(editingIncome.date);
            setCategory(editingIncome.category);

        }
    },[editingIncome]);


    
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
                                "   >{editingIncome ? "+ Update Income" : "+ Add New Income"}</h2>
            
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
                        value={amount}
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
                        value={date}
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
                        value={category}
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
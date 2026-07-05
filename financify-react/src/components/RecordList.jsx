import { useState } from "react"

function RecordList({expenses}){
    
    return(
        <>
        <h2 className="
            text-2xl 
            font-semibold 
            mb-6
            pb-4
            text-(--color-superheading)]
        "   
        >Expense Record</h2>
        <ul 
            className="flex flex-col gap-0.5">{
            expenses.map(expense=>(
                <li className="
                        w-1/2
                        border
                        rounded-md
                        m-4
                        px-3
                        py-2
                        mb-2.5 "
                    key={expense.id}>
                        <div className="flex justify-around">
                        <span><p>{expense.description}</p></span>
                        <span><p>₹ {expense.amount}</p></span>
                        </div>
                        <div className="flex justify-around"><p>{expense.category}</p>
                        <p>{expense.date}</p></div>
                </li>
            ))
        }
        </ul>
        </>
    )
}
export default RecordList
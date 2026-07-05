import { useState } from "react"

function RecordList({expenses}){
    
    return(
        <>
        <div className="
                        bg-white
                        m-5
                        border-2
                        border-l-4
                        border-l-[var(--color-superheading)]
                        rounded-md
                        pl-2
                        border-transparent
                        shadow-md">
        
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
                        <div className="flex justify-between">
                        <span><p>{expense.description}</p></span>
                        <span><p>₹ {expense.amount}</p></span>
                        </div>
                        <div className="flex justify-around"><p>{expense.category}</p>
                        <p>{expense.date}</p></div>
                </li>
            ))
        }
        </ul>
        </div>
        </>
    )
}
export default RecordList
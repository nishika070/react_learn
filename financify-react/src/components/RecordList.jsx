import { useState } from "react"

function RecordList({expenses}){
    const categoryColors = {
            Travel: "bg-blue-100 text-blue-700",
            Food: "bg-orange-100 text-orange-700",
            Bills: "bg-red-100 text-red-700",
            Entertainment: "bg-purple-100 text-purple-700",
            Health: "bg-green-100 text-green-700",
            Shopping: "bg-pink-100 text-pink-700",
        };
    
    return(
        <>
        <div className="
                        bg-white
                        ml-5
                        border-2
                        border-l-4
                        border-l-[var(--color-superheading)]
                        rounded-md
                        pl-2
                        p-4
                        border-transparent
                        shadow-md">
        
        <ul 
            className="flex flex-col gap-1 space-y-4">{
            expenses.map(expense=>(
                <li className="
                        border
                        border-gray-400
                        rounded-md
                        px-3
                        py-[6px]
                        mb-2.5 
                        shadow-md
                        hover:-translate-y-1 
                        hover:border-[var(--color-superheading)]
                        hover:shadow-lg
                        hover:bg-[var(--color-background)]
                        transition-all
                        duration-300
                        "
                    key={expense.id}>
                        <div className="flex justify-between">
                        <p className="
                                    font-semibold
                                    text-xl
                                    text-[var(--color-superheading)]

                                        ">
                                    {expense.description}</p>
                        <p className="
                                    font-semibold
                                    text-xl
                                    text-red-800
                                    

                                        ">₹ {expense.amount.toLocaleString("en-IN")}</p>
                        </div>
                        <div className="flex gap-3 items-center mt-2">
                                <span className={`
                                    px-2
                                    rounded-md
                                    font-semibold
                                    ${categoryColors[expense.category]}
                                `}>
                                {expense.category}</span>      
                                <span className="
                                                text-sm
                                                text-gray-500
                                    "  >{expense.date}</span>
                        </div>
                </li>
            ))
        }
        </ul>
        </div>
        </>
    )
}
export default RecordList
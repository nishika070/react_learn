
function RecordList({expenses}){
    const loadlist=async()=>{
        const snapshot=await getDocs(collection(db,"expenses"))
        const expensesArray=snapshot.docs.map(doc=>({
            id : doc.id,
            ...doc.data()
            //this means aur jo bhi original data h usse isme expenses object me sare copy krdo
            //({  }) it is like () this bcz {}yeh body smajata h funcyion ki if u want ({}) this returns object
        }))
        console.log(expensesArray)
        setExpenses(expensesArray);
    }
    
    return(
        <>
        <h2 className="
            text-2xl 
            font-semibold 
            mb-6
            pb-4
            text-[var(--color-superheading)]
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
                        mb-{10px} "
                    key={expense.id}>
                        <p>{expense.description}</p>
                        <p>₹ {expense.amount}</p>
                        <p>{expense.category}</p>
                        <p>{expense.date}</p>
                </li>
            ))
        }
        </ul>
        </>
    )
}
export default RecordList
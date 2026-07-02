function IncomeList({incomes}){
    return (
        <>
        <div>
            <h2>
                Income Record
            </h2>
            <ul>
                {
                    incomes.map(income=>(
                        <li key={income.id}>
                            <p>{income.description}</p>
                            <p>₹{income.amount}</p>
                            <p>{income.date}</p>
                            <p>{income.category}</p>
                        </li>

                    ))
                }
            </ul>
        </div>

        </>
    )
};
export default IncomeList;

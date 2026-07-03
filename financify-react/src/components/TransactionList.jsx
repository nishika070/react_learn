function TransactionList({transactions}){
    return(
        <>
            <h2>
                Transaction Records
            </h2>
            <ul>
                {
                transactions.map(transaction=>(
                    <li
                        key={transaction.id}>
                        <p>{transaction.description}</p>
                        <p>{transaction.amount}</p>
                        <p>{transaction.date}</p>
                        <p>{transaction.category}</p>

                    </li>
                ))   
            }         
            </ul>
        </>
    )
}
export default TransactionList;
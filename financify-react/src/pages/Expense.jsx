import ExpenseForm from "../components/ExpenseForm"
import Searchbar from "../components/SearchBar"
import RecordList from "../components/RecordList"
import StatCard from "../components/StatCard"
function Expense(){
    return(
        <>
        <h1>expense page</h1>
        <StatCard/>
        <div className="flex  gap-6 mt-8">
            <div className="w-1/2">
                <ExpenseForm/>
            </div>
            <div className="w-1/2">
                <Searchbar/>
                <RecordList/>
            </div>
        </div>
        </>

    )
}
export default Expense
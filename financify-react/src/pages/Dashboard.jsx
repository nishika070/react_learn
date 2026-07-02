import { useState } from "react"
import StatCard from "../components/StatCard"
//load
//async load kro 


function Dashboard(){
    const [transaction,setTransaction]=useState([]);
    let totalIncome=0;
    let categories=0;
    let totalExpense=0;
    let savingRate=0;

    return(
        <div>
            <div>
                {/* heading */}
                <h2>Dashboards</h2>
                <p>Manage and monitor your expenses.</p>

            </div>
            <div className="grid grid-cols-4">
                {/* cardss */}
                <StatCard title="Total Income"
                          value={totalIncome}
                          />
                <StatCard title="Total Expense"
                          value={totalExpense}
                          />
                <StatCard title="Categories"
                          value={categories}
                          />
                <StatCard title="Saving Rate"
                          value={savingRate}
                          />
                
            </div>
            <div>
                <div>
                    {/* total transactions */}
                    {/* list  */}
                    {/* <rendertransaction/> */}
                    
                </div>
                <div>
                    {/* chart of categories  */}
                </div>
            </div>
        </div>
    )
}
export default Dashboard
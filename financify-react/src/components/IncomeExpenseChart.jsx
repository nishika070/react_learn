import { Bar } from "react-chartjs-2";

import {
    Chart as ChartJS,
    CategoryScale ,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
}from "chart.js";
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
);
function IncomeExpenseChart({totalIncome,totalExpense}){
    const data={
        labels : ["Income","Expense"],
        datasets:[
            {
                label:"Amount",
                data:[
                    totalIncome,
                    totalExpense
                ],
                backgroundColor: [
                    "#22c55e",
                    "#ef4444"
                ]
            }
        ]
    }
    return(
        <>
        <div className="w-10 h-2">
        <Bar data={data}/>
        </div>
        </>
    )
};
export default IncomeExpenseChart;
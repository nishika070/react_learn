import { Doughnut } from "react-chartjs-2";
import {
   Chart as ChartJS,
   ArcElement,
   Tooltip,
   Legend 
} from "chart.js"

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);
function ExpenseCategoryChart( {expenses}){
    const categoryTotals={};
    expenses.forEach(expense => {
        if(categoryTotals[expense.category]){
            categoryTotals[expense.category]+=expense.amount;

        }
        else{
            categoryTotals[expense.category]=expense.amount;
        }
        
    });
    const dataKeys=Object.keys(categoryTotals);
    const dataValues=Object.values(categoryTotals);
    const data={
        labels:dataKeys,
        datasets :[{
            data:dataValues,
        backgroundColor: [
                "#3B82F6",
                "#10B981",
                "#F59E0B",
                "#EF4444",
                "#8B5CF6",
                "#EC4899",
                "#06B6D4"
            ],
            borderWidth: 1,
        
    },],
};
    return (
        <>
        <div className="w-80 h-80 p-5">
        <Doughnut data={data}/>
        </div>
        </>
    )
}
export default ExpenseCategoryChart;
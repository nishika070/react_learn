import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

function ExpenseCategoryChart({ expenses }) {
  const categoryTotals = {};

  expenses.forEach((expense) => {
    const category = expense.category;
    const amount = Number(expense.amount || 0);

    if (categoryTotals[category]) {
      categoryTotals[category] += amount;
    } else {
      categoryTotals[category] = amount;
    }
  });

  const data = {
    labels: Object.keys(categoryTotals),

    datasets: [
      {
        data: Object.values(categoryTotals),

        backgroundColor: [
          "#5B8DEF",
          "#55A895",
          "#E6A23C",
          "#D98282",
          "#8B7BC8",
          "#D96B9B",
          "#58AFC0",
        ],

        borderWidth: 2,
        borderColor: "#FFFFFF",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  return (
    <div className="w-full h-full">
      <Doughnut data={data} options={options} />
    </div>
  );
}

export default ExpenseCategoryChart;
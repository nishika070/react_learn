import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

function IncomeExpenseChart({ incomes, expenses }) {
  const weeklyIncome = [0, 0, 0, 0, 0];
  const weeklyExpense = [0, 0, 0, 0, 0];

  incomes.forEach((income) => {
    const day = new Date(income.date).getDate();
    const week = Math.ceil(day / 7);

    weeklyIncome[week - 1] += Number(income.amount || 0);
  });

  expenses.forEach((expense) => {
    const day = new Date(expense.date).getDate();
    const week = Math.ceil(day / 7);

    weeklyExpense[week - 1] += Number(expense.amount || 0);
  });

  const data = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
    datasets: [
      {
        label: "Income",
        data: weeklyIncome,
        backgroundColor: "#55A895",
        borderRadius: 6,
      },
      {
        label: "Expense",
        data: weeklyExpense,
        backgroundColor: "#D98282",
        borderRadius: 6,
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

    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="w-full h-full">
      <Bar data={data} options={options} />
    </div>
  );
}

export default IncomeExpenseChart;
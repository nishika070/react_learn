function TransactionList({ transactions }) {

    const categoryColors = {
        Travel: "bg-blue-100 text-blue-700",
        Food: "bg-orange-100 text-orange-700",
        Bills: "bg-red-100 text-red-700",
        Entertainment: "bg-purple-100 text-purple-700",
        Shopping: "bg-pink-100 text-pink-700",
        Other: "bg-gray-100 text-gray-700",
    };

    return (
        <div
            className="
                bg-white
                border-l-4
                border-l-[var(--color-superheading)]
                rounded-xl
                shadow-md
                p-4
            "
        >

            <ul className="flex flex-col space-y-4">

                {transactions.map((transaction) => (

                    <li
                        key={transaction.id}
                        className="
                            border
                            border-gray-300
                            rounded-xl
                            px-4
                            py-3

                            hover:shadow-lg
                            hover:-translate-y-1
                            hover:border-[var(--color-superheading)]

                            transition-all
                            duration-300
                        "
                    >

                        <div className="flex justify-between items-center">

                            <p
                                className="
                                    font-semibold
                                    text-lg
                                    text-[var(--color-superheading)]
                                "
                            >
                                {transaction.description}
                            </p>

                            <p
                                className={`font-bold text-lg ${
                                    transaction.type === "income"
                                        ? "text-green-600"
                                        : "text-red-600"
                                }`}
                            >
                                {transaction.type === "income" ? "+" : "-"} ₹
                                {transaction.amount.toLocaleString("en-IN")}
                            </p>

                        </div>

                        <div className="flex items-center gap-3 mt-2">

                            <span className="text-gray-500 text-sm">
                                {transaction.date}
                            </span>

                            <span
                                className={`
                                    px-2
                                    py-1
                                    rounded-full
                                    text-xs
                                    font-semibold
                                    ${
                                        categoryColors[transaction.category] ||
                                        "bg-gray-100 text-gray-700"
                                    }
                                `}
                            >
                                {transaction.category}
                            </span>

                            <span
                                className={`
                                    px-2
                                    py-1
                                    rounded-full
                                    text-xs
                                    font-semibold
                                    ${
                                        transaction.type === "income"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                    }
                                `}
                            >
                                {transaction.type}
                            </span>

                        </div>

                    </li>

                ))}

            </ul>

        </div>
    );
}

export default TransactionList;
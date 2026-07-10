function IncomeList({ incomes }) {
    const categoryColors = {
        Travel: "bg-blue-100 text-blue-700",
        Food: "bg-orange-100 text-orange-700",
        Bills: "bg-red-100 text-red-700",
        Entertainment: "bg-purple-100 text-purple-700",
        Health: "bg-green-100 text-green-700",
        Shopping: "bg-pink-100 text-pink-700",
    };

    return (
        <>
            <div
                className="
                    bg-white
                    ml-5
                    p-4
                    border-2
                    border-l-4
                    border-l-[var(--color-superheading)]
                    border-transparent
                    rounded-md
                    shadow-md
                "
            >
                <ul className="flex flex-col gap-4">
                    {incomes.map((income) => (
                        <li
                            key={income.id}
                            className="
                                border
                                border-gray-400
                                rounded-md
                                px-3
                                py-[6px]
                                shadow-md
                                hover:-translate-y-1
                                hover:border-[var(--color-superheading)]
                                hover:shadow-lg
                                hover:bg-[var(--color-background)]
                                transition-all
                                duration-300
                            "
                        >
                            <div className="flex justify-between items-center">
                                <p
                                    className="
                                        font-semibold
                                        text-xl
                                        text-[var(--color-superheading)]
                                    "
                                >
                                    {income.description}
                                </p>

                                <p
                                    className="
                                        font-semibold
                                        text-xl
                                        text-green-700
                                    "
                                >
                                    ₹{income.amount.toLocaleString("en-IN")}
                                </p>
                            </div>

                            <div className="flex gap-3 items-center mt-2">
                                <span className="text-sm text-gray-500">
                                    {income.date}
                                </span>

                                <span
                                    className={`
                                        px-2
                                        py-1
                                        rounded-md
                                        text-sm
                                        font-semibold
                                        ${categoryColors[income.category]}
                                    `}
                                >
                                    {income.category}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}

export default IncomeList;
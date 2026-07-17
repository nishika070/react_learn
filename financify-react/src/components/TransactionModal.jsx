function TransactionModal({transaction , onClose,onDelete ,onEdit}){
    return (
        <>
        <div 
            className="
                    fixed
                    inset-0
                    bg-black/40
                    backdrop-blur-sm
                    flex
                    flex-col
                    items-center
                    justify-center
                    z-50
                    ">
                    <div className="bg-white
                        w-[500px]
                        rounded-xl
                        shadow-2xl
                        p-6">
                    <h2 className="text-xl font-bold mb-6">Transaction Details</h2>
                    <div className="space-y-3">
                    <p>
                        <span className="font-semibold">
                            Description:
                        </span>{" "}
                        {transaction.description}
                    </p>

                    <p>
                        <span className="font-semibold">
                            Amount:
                        </span>{" "}
                        ₹{transaction.amount.toLocaleString("en-IN")}
                    </p>

                    <p>
                        <span className="font-semibold">
                            Category:
                        </span>{" "}
                        {transaction.category}
                    </p>

                    <p>
                        <span className="font-semibold">
                            Date:
                        </span>{" "}
                        {transaction.date}
                    </p>

                    

                </div>

                <div className="flex justify-end gap-3 mt-8">

                    <button
                        onClick={onEdit}
                        className="
                            px-4
                            py-2
                            rounded-lg
                            bg-yellow-500
                            text-white
                        "
                    >
                        Edit
                    </button>

                    <button
                        onClick={onDelete}
                        className="
                            px-4
                            py-2
                            rounded-lg
                            bg-red-500
                            text-white
                        "
                    >
                        Delete
                    </button>

                    <button
                        onClick={onClose}
                        className="
                            px-4
                            py-2
                            rounded-lg
                            border
                        "
                    >
                        Close
                    </button>

                </div>
                </div>

        </div>
        </>
    )
}
export default TransactionModal;
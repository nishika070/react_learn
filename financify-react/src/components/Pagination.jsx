function Pagination({currentPage,totalPages,setCurrentPage}){
    return(
        <div className="
                        
                        flex 
                        gap-3
                        items-center
                        justify-center
                        mt-5
                        bg-white
                        rounded-md
                        shadow-sm
                        ml-50
                        mr-50
                        "    >
            <button
                className="
                        text-grey-500
                        "   
                disabled={currentPage===1}
                onClick={()=>{
                    setCurrentPage(currentPage-1);
                }}>
                    {"<"}prev
            </button>
            <p className="
                    text-[var-(--color-superheading)]
                    text-xl

                    "   >
                
                {currentPage}
                
            </p>
            <button
                    disabled={currentPage===totalPages}
                    onClick={()=>{
                        setCurrentPage(currentPage+1);
                    }}>
                Next{">"}
            </button>
        </div>
    )
};
export default Pagination
function Searchbar({search,setSearch}){
    return (
        <>
        
            <input 
                type="text" 
                placeholder="search"
                value={search}
                onChange={(e)=>setSearch(e.target.value)}
                className="
                        max-w-[512px]
                        mt-9
                        p-2
                        mb-3
                        border-2
                        rounded-md
                        shadow-md
                        w-20%

                        hover:shadow-lg
                        hover:border-[var(--color-superheading)]
                        hover:-translate-y-1
                        transition-all
                        duration-300
                                               
                        placeholder:text-gray-500 font-medium

                        "

                
                >    
            </input>
       
        </>
    )
}
export default Searchbar
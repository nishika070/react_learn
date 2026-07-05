function Searchbar({search,setSearch}){
    return (
        <>
        
            <input 
                type="text" 
                placeholder="search"
                value={search}
                onChange={(e)=>setSearch(e.target.value)}
                className="
                        max-width: 512px;
                        mt-9
                        p-2
                        mb-3
                        border-2
                        rounded-md
                        shadow-md

                        hover:shadow-lg
                        hober:border-[var(--color-superheading)]
                        hover:-translate-y-1
                        transition-all
                        duration-300
                                               
                        placeholder:grey-50 font-semibold

                        "

                
                >    
            </input>
       
        </>
    )
}
export default Searchbar
function Searchbar({search,setSearch}){
    return (
        <>
        <div className="
        py-3 m-4 center justify-center ml-1.5 border rounded-md" >
            <input 
                type="text" 
                placeholder="search"
                value={search}
                onChange={(e)=>setSearch(e.target.value)}
                
                >    
            </input>
        </div>
        </>
    )
}
export default Searchbar
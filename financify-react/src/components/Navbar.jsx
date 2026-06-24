function Navbar(){
    return (
        <nav className="flex justify-between px-8 py-4 items-center">
            <div>
                {/*left*/}
                <h1>FINANCIFY</h1>
                <p>Track your spending with ease</p>
            </div>
            <div>
                {/* right */}
                <a href="#">Dashboard</a>
                <a href="#">Expense</a>
                <a href="#">Income</a>

            </div>
        </nav>
    )
}
export default Navbar
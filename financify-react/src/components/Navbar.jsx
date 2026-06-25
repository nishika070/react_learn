import logo from "../assets/logo.svg"
function Navbar(){
    return (
        <nav className="flex justify-between !px-8 !py-4 items-center text-[var(--color-heading)]">
            <div className="flex gap-3">
                {/*left*/}
                
                    <img className="w-12 h-12" src={logo} alt="logo"/>
                    <div className="flex flex-col">
                        <h1 className="text-[var(--color-superheading)] font-bold text-[24px]">FINANCIFY</h1>
                        <p className="text-[var(--color-text)] text-[14px]">Track your spending with ease</p>
                    </div>
            </div>
            <div className="flex justify-around align-baseline gap-3 text-[var(--text-subtext)] text-[18px]">
                {/* right */}
                <a href="#">Dashboard</a>
                <a href="#">Expense</a>
                <a href="#">Income</a>

            </div>
        </nav>
    )
}
export default Navbar
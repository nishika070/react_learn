import logo from "../assets/logo.svg"
import { Link } from "react-router-dom";
function Navbar(){
    return (
        <nav className="max-w-7xl mx-auto px-3 py-8  flex justify-between items-center text-[var(--color-heading)]">
            
            <div className="flex gap-3">
                {/*left*/}
                
                    <img className="w-12 h-12" src={logo} alt="logo"/>
                    <div className="flex flex-col">
                        <h1 className="text-[var(--color-superheading)] font-bold text-[24px]">FINANCIFY</h1>
                        <p className="text-[var(--color-text)] gap-0 text-[14px]">Track your spending with ease</p>
                    </div>
            </div>
            <div className="flex justify-around align-baseline gap-3 text-[var(--text-subtext)] text-[18px]">
                {/* right */}
                <Link to="/">Dashboard</Link>

                <Link to="/expense">Expense</Link>
                
                <Link to="/income">Income</Link>
            </div>
        </nav>
    )
}
export default Navbar
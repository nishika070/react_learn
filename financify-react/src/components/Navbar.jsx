import logo from "../assets/logo.svg"
import { Link } from "react-router-dom";
function Navbar(){
    const navLink = `
    hover:-translate-y-0.5
    hover:text-[var(--color-superheading)]
    transition-all
    duration:300
`;
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
            <div className="flex justify-around align-baseline gap-3 font-semibold text-[var(--color-heading)] text-[20px]
                            ">
                {/* right */}
                <Link to="/" className={navLink}>
                        Dashboard
                </Link>

                <Link to="/expense"className={navLink}  >Expense</Link>
                
                <Link to="/income" className={navLink}>Income</Link>
            </div>
        </nav>
    )
}
export default Navbar
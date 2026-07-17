import logo from "../assets/logo.svg";
import { NavLink } from "react-router-dom";
import { auth } from "../firebase/firebase";
import { AuthContext } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { useContext, useState } from "react";

function Navbar() {
    const [showMenu, setShowMenu] = useState(false);

    const { user } = useContext(AuthContext);
    console.log(user);
console.log(user?.uid);
    const userName = user?.isAnonymous
        ? "Guest"
        : user?.displayName;

    const avatarLetter = userName?.charAt(0).toUpperCase();

    const navLink = ({ isActive }) =>
        `px-4 py-2 rounded-full font-semibold transition-all duration-300 ${
            isActive
                ? "bg-[var(--color-superheading)] text-white"
                : "text-[var(--color-heading)] hover:text-[var(--color-superheading)] hover:-translate-y-0.5"
        }`;

    async function handleLogout() {
        await signOut(auth);
        setShowMenu(false);
    }

    return (
        <nav className="max-w-7xl mx-auto px-3 py-8 flex justify-between items-center">

            {/* Logo */}
            <div className="flex items-center gap-3">

                <img
                    src={logo}
                    alt="logo"
                    className="w-12 h-12"
                />

                <div>
                    <h1 className="text-4xl font-bold text-[var(--color-superheading)]">
                        FINANCIFY
                    </h1>

                    <p className="text-sm text-[var(--color-text)]">
                        Track your spending with ease
                    </p>
                </div>

            </div>

            {/* Navigation */}
            <div className="flex items-center gap-8 text-lg">

                <NavLink
                    to="/dashboard"
                    className={navLink}
                >
                    Dashboard
                </NavLink>

                <NavLink
                    to="/expense"
                    className={navLink}
                >
                    Expense
                </NavLink>

                <NavLink
                    to="/income"
                    className={navLink}
                >
                    Income
                </NavLink>

            </div>

            {/* Profile */}
            <div className="relative">

                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="
                        flex
                        items-center
                        gap-3
                        bg-white
                        rounded-full
                        shadow-md
                        px-3
                        py-2
                        hover:shadow-xl
                        transition-all
                        duration-300
                    "
                >

                    <div
                        className="
                            w-10
                            h-10
                            rounded-full
                            bg-[var(--color-superheading)]
                            text-white
                            flex
                            items-center
                            justify-center
                            font-semibold
                        "
                    >
                        {avatarLetter}
                    </div>

                    <div className="text-left">

                        <p className="font-semibold">
                            {userName}
                        </p>

                        <p className="text-xs text-gray-500">
                            {user?.isAnonymous
                                ? "Guest Account"
                                : "Google Account"}
                        </p>

                    </div>

                    <span className="text-gray-500">
                        {showMenu ? "▲" : "▼"}
                    </span>

                </button>

                {showMenu && (

                    <div
                        className="
                            absolute
                            right-0
                            mt-2
                            w-56
                            bg-white
                            rounded-xl
                            shadow-xl
                            border
                            p-4
                            z-50
                        "
                    >

                        <p className="font-semibold">
                            {userName}
                        </p>

                        <p className="text-sm text-gray-500 mb-3">
                            {user?.isAnonymous
                                ? "Guest Account"
                                : user?.email}
                        </p>

                        <hr className="mb-3" />

                        <button
                            onClick={handleLogout}
                            className="
                                w-full
                                text-left
                                px-3
                                py-2
                                rounded-lg
                                text-red-600
                                hover:bg-red-50
                                transition-all
                            "
                        >
                            Logout
                        </button>

                    </div>

                )}

            </div>

        </nav>
    );
}

export default Navbar;
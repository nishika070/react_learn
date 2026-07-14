import logo from "../assets/logo.svg";
import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Navbar() {

    const { user } = useContext(AuthContext);

    const userName = user?.isAnonymous
        ? "Guest"
        : user?.displayName;

    const avatarLetter = userName?.charAt(0).toUpperCase();

    const navLink = ({ isActive }) =>
        `px-4 py-2 rounded-full font-semibold transition-all duration-300
        ${
            isActive
                ? "bg-[var(--color-superheading)] text-white"
                : "text-[var(--color-heading)] hover:text-[var(--color-superheading)] hover:-translate-y-0.5"
        }`;

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

            <button
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

                <button className="text-gray-500">
                    ▼
                </button>

            </button>

        </nav>
    );
}

export default Navbar;
import { useContext, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { AuthContext } from "../context/AuthContext";

/* ---------- icons ---------- */
const ICONS = {
    dashboard: (
        <>
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </>
    ),

    income: <path d="M7 17 17 7M9 7h8v8" />,

    expense: <path d="M7 7l10 10M17 9v8H9" />,

    categories: (
        <>
            <path d="M4 4h7l9 9-7 7-9-9V4Z" />
            <circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" />
        </>
    ),

    saving: (
        <>
            <path d="M19 5 5 19" />
            <circle cx="7" cy="7" r="2.2" />
            <circle cx="17" cy="17" r="2.2" />
        </>
    ),

    signout: (
        <>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="m16 17 5-5-5-5M21 12H9" />
        </>
    ),
};

export function Icon({ name, className = "w-5 h-5" }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {ICONS[name]}
        </svg>
    );
}

function Logo() {
    return (
        <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-xl inline-flex items-center justify-center bg-[var(--color-superheading)] text-white shadow-md">
                <svg
                    viewBox="0 0 24 24"
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a1 1 0 0 1 1 1v2" />
                    <path d="M3 7.5V17a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H5.5A2.5 2.5 0 0 1 3 7.5Z" />
                    <circle cx="15.5" cy="13.5" r="1" fill="currentColor" />
                </svg>
            </span>

            <div className="leading-none">
                <p className="text-xl font-extrabold tracking-tight text-[var(--color-superheading)]">
                    FINANCIFY
                </p>

                <p className="mt-1 text-[11px] tracking-wide text-gray-500">
                    Personal finance
                </p>
            </div>
        </div>
    );
}

const NAV = [
    { to: "/dashboard", label: "Dashboard", icon: "dashboard" },
    { to: "/income", label: "Income", icon: "income" },
    { to: "/expense", label: "Expenses", icon: "expense" },
];

const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
        isActive
            ? "bg-[var(--color-superheading)] text-white shadow-lg"
            : "text-gray-600 hover:bg-white/70"
    }`;

function displayName(user) {
    if (!user) return "";
    if (user.displayName) return user.displayName;
    if (user.isAnonymous) return "Guest";
    return user.email ? user.email.split("@")[0] : "there";
}

function Navbar() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [signingOut, setSigningOut] = useState(false);

    async function handleSignOut() {
        setSigningOut(true);

        try {
            await signOut(auth);
            navigate("/", { replace: true });
        } finally {
            setSigningOut(false);
        }
    }

    const name = displayName(user);

    return (
        <div className="relative h-[100dvh] w-full flex overflow-hidden bg-[#eef3fb]">

            {/* Background */}
            <div
                className="pointer-events-none absolute inset-0"
                aria-hidden="true"
            >
                <div className="absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-[var(--color-superheading)] opacity-25 blur-3xl" />

                <div className="absolute top-1/3 -right-32 h-[26rem] w-[26rem] rounded-full bg-sky-300 opacity-40 blur-3xl" />

                <div className="absolute -bottom-40 left-1/3 h-[24rem] w-[24rem] rounded-full bg-indigo-300 opacity-30 blur-3xl" />
            </div>

            {/* Sidebar */}
            <aside className="relative z-10 hidden lg:flex w-64 shrink-0 flex-col m-4 mr-0 rounded-3xl border border-white/70 bg-white/55 backdrop-blur-xl shadow-[0_8px_32px_rgba(80,121,181,0.15)] p-5">

                <Logo />

                <nav className="mt-10 flex flex-col gap-1.5">
                    {NAV.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={linkClass}
                        >
                            <Icon name={item.icon} />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="mt-auto pt-4 border-t border-white/80">

                    <div className="flex items-center gap-3 px-1 pb-3">
                        <span className="w-9 h-9 rounded-full bg-[var(--color-superheading)] text-white inline-flex items-center justify-center text-sm font-semibold">
                            {(name[0] || "?").toUpperCase()}
                        </span>

                        <p className="text-sm font-medium text-gray-700 truncate">
                            {name}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleSignOut}
                        disabled={signingOut}
                        className="w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-600 hover:bg-white/70 transition-colors disabled:opacity-60"
                    >
                        <Icon name="signout" />
                        Sign out
                    </button>

                </div>
            </aside>

            {/* Main column */}
            <div className="relative z-10 flex-1 min-w-0 flex flex-col">

                {/* Mobile header */}
                <header className="lg:hidden m-3 mb-0 rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl px-4 py-3 flex items-center justify-between">

                    <Logo />

                    <button
                        type="button"
                        onClick={handleSignOut}
                        disabled={signingOut}
                        aria-label="Sign out"
                        className="p-2 rounded-lg text-gray-600 hover:bg-white/70"
                    >
                        <Icon name="signout" />
                    </button>

                </header>

                {/* Mobile navigation */}
                <nav className="lg:hidden mx-3 mt-2 flex gap-1.5 overflow-x-auto">

                    {NAV.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={linkClass}
                        >
                            <Icon
                                name={item.icon}
                                className="w-4 h-4"
                            />
                            {item.label}
                        </NavLink>
                    ))}

                </nav>

                {/* ROUTED PAGE CONTENT */}
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>

            </div>
        </div>
    );
}

export default Navbar;
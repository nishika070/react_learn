import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    GoogleAuthProvider,
    signInWithPopup,
    signInAnonymously,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase/firebase";
import { AuthContext } from "../context/AuthContext";

const provider = new GoogleAuthProvider();

// ---- Demo account -------------------------------------------------------
// Create this user in Firebase Console > Authentication > Users first.
// Use a throwaway email + password you never use anywhere else:
// these constants end up in the public JS bundle.
const DEMO_EMAIL = "demo_financify@gmail.com"; // replace with your throwaway demo user
const DEMO_PASSWORD = "a1a2a3a4a5"; // replace with a throwaway password
const SHOW_DEMO_CREDENTIALS = false; // keep false: the button already autofills
// -------------------------------------------------------------------------

function friendlyError(code) {
    switch (code) {
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
            return "Email or password is incorrect.";
        case "auth/invalid-email":
            return "Enter a valid email address.";
        case "auth/too-many-requests":
            return "Too many attempts. Try again in a few minutes.";
        case "auth/network-request-failed":
            return "No internet connection. Check your network and try again.";
        case "auth/popup-closed-by-user":
        case "auth/cancelled-popup-request":
            return "";
        default:
            return "Something went wrong. Please try again.";
    }
}

function Logo({ dark = false }) {
    return (
        <div className="flex items-center gap-3.5">
            <span
                className={`w-14 h-14 rounded-2xl inline-flex items-center justify-center ${
                    dark
                        ? "bg-[var(--color-superheading)] text-white"
                        : "bg-white text-[var(--color-superheading)]"
                }`}
            >
                <svg
                    viewBox="0 0 24 24"
                    className="w-7 h-7"
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
                <p
                    className={`text-3xl font-extrabold tracking-tight ${
                        dark ? "text-[var(--color-superheading)]" : "text-white"
                    }`}
                >
                    FINANCIFY
                </p>
                <p
                    className={`mt-1.5 text-[13px] tracking-wide ${
                        dark ? "text-gray-500" : "text-white/80"
                    }`}
                >
                    Track your spending with ease
                </p>
            </div>
        </div>
    );
}

/* Animated background for the blue panel.
   Meaning: drifting waves = money flowing,
   floating coins = money rising,
   growth line with points = savings growing month by month,
   breathing rupee sign = the currency behind it all.
   NOTE: wave paths tile every 1000 units. If you edit the Q/T x-values,
   keep that period or the loop will visibly jump. */
function FlowBackground() {
    const coins = [
        { x: 120, d: 0, t: 16, s: 26 },
        { x: 300, d: 5, t: 20, s: 18 },
        { x: 470, d: 2, t: 18, s: 30 },
        { x: 650, d: 8, t: 22, s: 20 },
        { x: 820, d: 4, t: 17, s: 24 },
        { x: 930, d: 10, t: 21, s: 16 },
    ];

    return (
        <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1000 800"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
        >
            <defs>
                <radialGradient id="fbGlow" cx="85%" cy="8%" r="65%">
                    <stop offset="0%" stopColor="#fff" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                </radialGradient>
                <pattern id="fbDots" width="28" height="28" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1.2" fill="#fff" fillOpacity="0.14" />
                </pattern>
            </defs>

            <style>{`
                .fb-draw { stroke-dasharray: 1; stroke-dashoffset: 1;
                           animation: fbDraw 2.6s ease-out 0.3s forwards; }
                @keyframes fbDraw { to { stroke-dashoffset: 0; } }

                .fb-dot { opacity: 0; animation: fbFade .6s ease-out forwards; }
                @keyframes fbFade { to { opacity: 1; } }

                /* waves drift sideways forever (period = 1000 units) */
                .fb-wave-a { animation: fbDrift 22s linear infinite; }
                .fb-wave-b { animation: fbDrift 34s linear infinite reverse; }
                .fb-wave-c { animation: fbDrift 48s linear infinite; }
                @keyframes fbDrift { to { transform: translateX(-1000px); } }

                /* rupee sign breathes */
                .fb-rupee { transform-box: fill-box; transform-origin: center;
                            animation: fbBreathe 8s ease-in-out infinite; }
                @keyframes fbBreathe {
                    0%,100% { transform: scale(1);    fill-opacity: .05; }
                    50%     { transform: scale(1.05); fill-opacity: .09; }
                }

                /* small coins float upward */
                .fb-coin { opacity: 0; animation: fbRise linear infinite; }
                @keyframes fbRise {
                    0%   { transform: translateY(0);      opacity: 0; }
                    15%  { opacity: .35; }
                    85%  { opacity: .35; }
                    100% { transform: translateY(-820px); opacity: 0; }
                }

                /* goal point pings outward */
                .fb-ping { transform-box: fill-box; transform-origin: center;
                           animation: fbPing 2.8s ease-out 3s infinite; opacity: 0; }
                @keyframes fbPing {
                    0%   { transform: scale(.6); opacity: .7; }
                    100% { transform: scale(2.6); opacity: 0; }
                }

                /* data points gently pulse after they appear */
                .fb-pulse { transform-box: fill-box; transform-origin: center;
                            animation: fbPulse 3s ease-in-out infinite; }
                @keyframes fbPulse { 50% { transform: scale(1.35); } }

                @media (prefers-reduced-motion: reduce) {
                    .fb-draw { animation: none; stroke-dashoffset: 0; }
                    .fb-dot { animation: none; opacity: 1; }
                    .fb-coin, .fb-ping { animation: none; display: none; }
                    .fb-wave-a, .fb-wave-b, .fb-wave-c,
                    .fb-rupee, .fb-pulse { animation: none; }
                }
            `}</style>

            {/* soft light from the top-right */}
            <rect width="1000" height="800" fill="url(#fbGlow)" />

            {/* faint dot grid, top-right */}
            <rect x="480" y="0" width="520" height="380" fill="url(#fbDots)" />

            {/* big faint rupee sign */}
            <text
                className="fb-rupee"
                x="600"
                y="470"
                fontSize="460"
                fontWeight="700"
                fill="#fff"
                fillOpacity="0.05"
                fontFamily="system-ui, sans-serif"
            >
                ₹
            </text>

            {/* floating coins */}
            {coins.map((c) => (
                <g
                    key={c.x}
                    className="fb-coin"
                    style={{ animationDuration: `${c.t}s`, animationDelay: `${c.d}s` }}
                >
                    <circle cx={c.x} cy="830" r={c.s / 2} fill="none" stroke="#fff" strokeWidth="1.5" />
                    <text
                        x={c.x}
                        y={830 + c.s * 0.18}
                        fontSize={c.s * 0.6}
                        fill="#fff"
                        textAnchor="middle"
                        fontFamily="system-ui, sans-serif"
                    >
                        ₹
                    </text>
                </g>
            ))}

            {/* drifting waves: 3 layers, different speed/direction */}
            <g className="fb-wave-c">
                <path
                    d="M0 640 Q250 590 500 640 T1000 640 T1500 640 T2000 640 L2000 800 L0 800 Z"
                    fill="#fff"
                    fillOpacity="0.06"
                />
            </g>
            <g className="fb-wave-b">
                <path
                    d="M0 700 Q250 660 500 700 T1000 700 T1500 700 T2000 700 L2000 800 L0 800 Z"
                    fill="#fff"
                    fillOpacity="0.07"
                />
            </g>
            <g className="fb-wave-a">
                <path
                    d="M0 755 Q250 725 500 755 T1000 755 T1500 755 T2000 755 L2000 800 L0 800 Z"
                    fill="#fff"
                    fillOpacity="0.09"
                />
            </g>

            {/* growth line (starts higher so it clears the copyright text) */}
            <path
                className="fb-draw"
                pathLength="1"
                d="M40 600 C 200 600, 320 580, 440 545 S 640 500, 740 420 S 900 310, 960 230"
                fill="none"
                stroke="#fff"
                strokeOpacity="0.6"
                strokeWidth="2.5"
                strokeLinecap="round"
            />

            {/* data points along the line */}
            {[
                [40, 600, 0.4],
                [440, 545, 1.1],
                [740, 420, 1.8],
            ].map(([cx, cy, delay]) => (
                <g key={cx} className="fb-dot" style={{ animationDelay: `${delay}s` }}>
                    <circle
                        className="fb-pulse"
                        style={{ animationDelay: `${delay}s` }}
                        cx={cx}
                        cy={cy}
                        r="5"
                        fill="#fff"
                        fillOpacity="0.85"
                    />
                </g>
            ))}

            {/* highlighted goal point */}
            <g className="fb-dot" style={{ animationDelay: "2.5s" }}>
                <circle
                    className="fb-ping"
                    cx="960"
                    cy="230"
                    r="18"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="1.5"
                />
                <circle cx="960" cy="230" r="18" fill="none" stroke="#fff" strokeOpacity="0.4" />
                <circle cx="960" cy="230" r="7" fill="#fff" />
            </g>
        </svg>
    );
}

function Login() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");

    useEffect(() => {
        if (user) navigate("/dashboard", { replace: true });
    }, [user, navigate]);

    async function run(action) {
        setError("");
        setInfo("");
        setLoading(true);
        try {
            await action();
        } catch (err) {
            setError(friendlyError(err.code));
        } finally {
            setLoading(false);
        }
    }

    const handleGoogleLogin = () => run(() => signInWithPopup(auth, provider));
    const handleGuestLogin = () => run(() => signInAnonymously(auth));

    function handleEmailLogin(e) {
        e.preventDefault();
        if (!email || !password) {
            setError("Enter your email and password.");
            return;
        }
        run(() => signInWithEmailAndPassword(auth, email.trim(), password));
    }

    // Demo: fields autofill first, then login fires right after
    function handleDemoLogin() {
        setEmail(DEMO_EMAIL);
        setPassword(DEMO_PASSWORD);
        run(async () => {
            await new Promise((r) => setTimeout(r, 500)); // lets the autofill be seen
            await signInWithEmailAndPassword(auth, DEMO_EMAIL, DEMO_PASSWORD);
        });
    }

    async function handleForgotPassword() {
        setError("");
        setInfo("");
        if (!email) {
            setError("Enter your email above, then tap Forgot password.");
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email.trim());
            setInfo("Password reset link sent. Check your inbox.");
        } catch (err) {
            setError(friendlyError(err.code));
        }
    }

    const inputClass =
        "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 " +
        "placeholder:text-gray-400 focus:outline-none focus:ring-2 " +
        "focus:ring-[var(--color-superheading)] focus:border-transparent";

    return (
        <div className="h-[100dvh] w-full flex overflow-hidden bg-white">
            {/* LEFT: 65% blue brand panel (desktop) */}
            <aside className="relative hidden lg:block w-[65%] overflow-hidden bg-[var(--color-superheading)] text-white">
                <FlowBackground />
                <div className="relative z-10 h-full flex flex-col p-10 xl:p-14">
                    <Logo />

                    {/* headline sits in the upper third; the growth line owns the lower right */}
                    <div className="mt-[min(14vh,9rem)] max-w-xl">
                        <h2 className="text-4xl xl:text-5xl font-bold leading-[1.1] tracking-tight">
                            Know where every rupee goes.
                        </h2>
                        <p className="mt-4 text-lg text-white/85 max-w-md">
                            Log income and expenses in seconds, and see your month at a glance.
                        </p>
                    </div>

                    <p className="mt-auto text-sm text-white/70">
                        &copy; {new Date().getFullYear()} Financify. All rights reserved.
                    </p>
                </div>
            </aside>

            {/* RIGHT: 35% form panel (full width on mobile) */}
            <main className="w-full lg:w-[35%] flex items-center justify-center overflow-y-auto px-6 sm:px-10 py-6">
                <div className="w-full max-w-sm">
                    {/* Logo on small screens, since the blue panel is hidden */}
                    <div className="lg:hidden mb-8">
                        <Logo dark />
                    </div>

                    <h1 className="text-2xl font-semibold text-center text-[var(--color-superheading)]">
                        Welcome back
                    </h1>
                    <p className="text-center text-sm text-gray-500 mt-1.5 mb-7">
                        Sign in to continue.
                    </p>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full border border-gray-300 rounded-xl py-2.5 font-semibold hover:bg-gray-100 transition-colors disabled:opacity-60"
                    >
                        Continue with Google
                    </button>

                    <button
                        type="button"
                        onClick={handleGuestLogin}
                        disabled={loading}
                        className="w-full mt-2.5 py-2.5 rounded-xl bg-[var(--color-superheading)] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
                    >
                        Continue as guest
                    </button>

                    <div className="flex items-center my-4">
                        <hr className="flex-1 border-gray-200" />
                        <span className="mx-4 text-sm text-gray-500">or</span>
                        <hr className="flex-1 border-gray-200" />
                    </div>

                    <form onSubmit={handleEmailLogin} noValidate>
                        <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                            Email address
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={inputClass}
                        />

                        <div className="flex justify-between items-center mt-3.5 mb-1.5">
                            <label htmlFor="password" className="text-sm font-medium">
                                Password
                            </label>
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-sm text-[var(--color-superheading)] hover:underline"
                            >
                                Forgot password?
                            </button>
                        </div>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`${inputClass} pr-16`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((s) => !s)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500 hover:text-gray-800"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>

                        {/* Reserved height so the layout never jumps */}
                        <p
                            role={error ? "alert" : "status"}
                            className={`mt-2 min-h-[1.25rem] text-sm ${
                                error ? "text-red-600" : "text-green-700"
                            }`}
                        >
                            {error || info}
                        </p>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 py-2.5 rounded-xl bg-[var(--color-superheading)] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>

                    <button
                        type="button"
                        onClick={handleDemoLogin}
                        disabled={loading}
                        className="w-full mt-2.5 py-2.5 rounded-xl border border-[var(--color-superheading)] text-[var(--color-superheading)] font-semibold hover:bg-[var(--color-background)] transition-colors disabled:opacity-60"
                    >
                        Try demo account
                    </button>

                    {SHOW_DEMO_CREDENTIALS && (
                        <p className="mt-2 text-xs text-center text-gray-500 break-all">
                            Demo: {DEMO_EMAIL} / {DEMO_PASSWORD}
                        </p>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Login;
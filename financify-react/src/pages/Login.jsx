import { auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
    GoogleAuthProvider,
    signInWithPopup,
    signInAnonymously,
} from "firebase/auth";
import { useContext, useEffect, useState } from "react";

const provider = new GoogleAuthProvider();

function Login() {

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        if (user) {
            navigate("/dashboard");
        }
    }, [user]);

    async function handleLogin() {
        const result = await signInWithPopup(auth, provider);
        console.log(result.user);
    }

    async function handleGuestLogin() {
        const result = await signInAnonymously(auth);
        console.log(result.user);
    }

    async function handleEmailLogin() {
        console.log(email, password);

        // Firebase Email Login
        // We'll connect this next.
    }

    return (
        <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">

            <div className="w-[450px] bg-white rounded-3xl shadow-xl p-10">

                <h1 className="text-4xl font-bold text-center text-[var(--color-superheading)]">
                    Welcome Back 👋
                </h1>

                <p className="text-center text-gray-500 mt-3 mb-8">
                    Manage your finances with confidence.
                </p>

                {/* Google */}

                <button
                    onClick={handleLogin}
                    className="
                        w-full
                        border
                        border-gray-300
                        rounded-xl
                        py-3
                        font-semibold
                        hover:bg-gray-100
                        transition-all
                        duration-300
                    "
                >
                    Continue with Google
                </button>

                {/* Guest */}

                <button
                    onClick={handleGuestLogin}
                    className="
                        w-full
                        mt-4
                        py-3
                        rounded-xl
                        bg-[var(--color-superheading)]
                        text-white
                        font-semibold
                        hover:opacity-90
                        transition-all
                        duration-300
                    "
                >
                    Continue as Guest
                </button>

                {/* Divider */}

                <div className="flex items-center my-8">

                    <hr className="flex-1"/>

                    <span className="mx-4 text-gray-500">
                        OR
                    </span>

                    <hr className="flex-1"/>

                </div>

                {/* Email */}

                <label className="font-medium">
                    Email Address
                </label>

                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                    className="
                        w-full
                        mt-2
                        mb-5
                        border
                        rounded-xl
                        px-4
                        py-3
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[var(--color-superheading)]
                    "
                />

                {/* Password */}

                <div className="flex justify-between items-center">

                    <label className="font-medium">
                        Password
                    </label>

                    <button
                        className="
                            text-sm
                            text-[var(--color-superheading)]
                            hover:underline
                        "
                    >
                        Forgot Password?
                    </button>

                </div>

                <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                    className="
                        w-full
                        mt-2
                        border
                        rounded-xl
                        px-4
                        py-3
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[var(--color-superheading)]
                    "
                />

                {/* Sign In */}

                <button
                    onClick={handleEmailLogin}
                    className="
                        w-full
                        mt-8
                        py-3
                        rounded-xl
                        bg-[var(--color-superheading)]
                        text-white
                        font-semibold
                        hover:opacity-90
                        transition-all
                        duration-300
                    "
                >
                    Sign In
                </button>

            </div>

        </div>
    );
}

export default Login;
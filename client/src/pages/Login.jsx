import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = ({ setIsAuthenticated }) => {
    const [formData, setFormData] = useState({ email: "", pass: "" });
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await fetch("/api/v1/auth/login", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }

            sessionStorage.setItem("token", data.token);

            setIsAuthenticated(true);
            navigate("/dashboard");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-black text-white">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm p-6 bg-zinc-900 rounded-lg border border-zinc-800"
            >
                <h2 className="text-xl font-bold mb-4">Login to System</h2>

                {error && (
                    <p className="text-red-500 mb-2 font-mono text-sm">
                        {error}
                    </p>
                )}

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                        Email
                    </label>
                    <input
                        type="text"
                        className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded text-white"
                        value={formData.email}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                email: e.target.value,
                            })
                        }
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium mb-1">
                        Password
                    </label>
                    <input
                        type="password"
                        className="w-full p-2  bg-zinc-950 border border-zinc-800 rounded text-white"
                        value={formData.pass}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                pass: e.target.value,
                            })
                        }
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded font-medium"
                >
                    Submit Credentials
                </button>

                <p className="text-sm text-zinc-400 text-center">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="text-blue-500 hover:underline font-medium"
                    >
                        Create an account
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default Login;

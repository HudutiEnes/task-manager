import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import LayoutWrapper from "./components/LayoutWrapper";

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const verifyUser = async () => {
            try {
                const response = await fetch("/api/v1/auth/verify", {
                    credentials: "include",
                });

                setIsAuthenticated(response.ok);
            } catch (error) {
                console.error("Authentication verification failed:", error);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        verifyUser();
    }, []);

    return (
        <BrowserRouter>
            <LayoutWrapper>
                <Navbar />

                <main className="mt-10">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        <Route
                            element={
                                <ProtectedRoute
                                    isAuthenticated={isAuthenticated}
                                    toggleLoad={isLoading}
                                />
                            }
                        >
                            <Route path="/" element={<Home />} />
                            <Route path="/dash" element={<Dashboard />} />
                        </Route>
                    </Routes>
                </main>
            </LayoutWrapper>
        </BrowserRouter>
    );
}

export default App;

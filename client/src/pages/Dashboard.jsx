import { useState, useEffect } from "react";
import { fetchTasks } from "../components/FetchTasks";
import CreateTask from "../components/CreateTask.jsx";

const Dashboard = () => {
    // Initializing the state machine
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTasks(setTasks, setIsLoading, setError);
    }, []);

    const handleCreate = async (name) => {
        try {
            setError(null);

            const token = sessionStorage.getItem("token");

            if (!token) {
                throw new Error("Please log in again.");
            }

            const response = await fetch("/api/v1/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name,
                    status: "pending",
                    description: "",
                    due_date: null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to create task.");
            }

            // Refresh tasks from PostgreSQL
            await fetchTasks(setTasks, setIsLoading, setError);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-black p-6 text-white">
            <h1 className="mb-6 text-2xl font-bold">Task Dashboard</h1>

            <div className="mb-6">
                <CreateTask onCreate={handleCreate} />
            </div>

            {error && (
                <p className="mb-4 text-red-500">System Error: {error}</p>
            )}

            <h2 className="mb-4 text-lg font-semibold">Your Tasks</h2>

            {isLoading ? (
                <p className="text-zinc-400">Loading tasks...</p>
            ) : tasks.length === 0 ? (
                <p className="text-zinc-500">
                    No tasks yet. Create your first task above.
                </p>
            ) : (
                <ul className="space-y-2">
                    {tasks.map((task) => (
                        <li
                            key={task.id}
                            className="rounded border border-zinc-800 bg-zinc-900 p-3"
                        >
                            {task.name} -{" "}
                            <span className="text-zinc-500">{task.status}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
export default Dashboard;

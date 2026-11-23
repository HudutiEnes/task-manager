export const fetchTasks = async (setTasks, setIsLoading, setError) => {
    try {
        setIsLoading(true);
        setError(null);

        const token = sessionStorage.getItem("token");

        if (!token) {
            throw new Error("Not authenticated. Please log in.");
        }

        const res = await fetch("/api/v1/tasks", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (res.status === 401) {
            sessionStorage.removeItem("token");
            throw new Error("Session expired. Please log in again.");
        }

        if (!res.ok) {
            throw new Error("Failed to get tasks.");
        }

        const data = await res.json();
        setTasks(data);
    } catch (err) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
};

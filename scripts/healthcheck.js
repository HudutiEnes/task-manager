async function GetHealth() {
    try {
        const result = await fetch("http://127.0.0.1:3000/health", {
            signal: AbortSignal.timeout(2000),
        });

        if (!result.ok) {
            console.error("Request error! Status:", result.status);
            process.exitCode = 1;
            return;
        }

        const health = await result.json();
        console.log(health);
        process.exitCode = 0;
    } catch (error) {
        console.error("Fetch failed:", error);
        process.exitCode = 1;
    }
}

GetHealth();

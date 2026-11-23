// Task Manager API - Entry Point
// Sets up middleware, routes, and error handling

require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

// Setup the Log Stream
const logDirectory = path.join(__dirname, "../logs/");

// Create stream in append mode

const accessLogStream = fs.createWriteStream(
    path.join(logDirectory, "access.log"),
    { flags: "a" },
);

// Global middleware
app.use(express.json());

// Write detailed logs to the file for Python to manage
app.use(morgan("combined", { stream: accessLogStream }));

// Keep short dev logs in terminal for live feedback
app.use(morgan("dev"));

// Routes & Error Handling
const taskRoutes = require("./routes/taskRoutes.js");
const authRoutes = require("./routes/authRoutes.js");
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/auth", authRoutes);

// Basic health check
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "UP",
        timeStamp: new Date().toISOString(),
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error",
    });
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
    console.log(`Server is starting on port ${PORT}`);
});

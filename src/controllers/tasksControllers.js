tasks = require("../../tasks.json");
import pool from "../database/db.js";

// Validating the tasks status
const validStatuses = ["pending", "in-progress", "completed"];

const allowedFields = ["title", "status", "dueDate"];

// Creates new task and adds it to in-memory array
const createTask = async (req, res, next) => {
    try {
        const { title, status, description, dueDate } = req.body;
        const userID = req.user.id;

        console.log("POST /", req.body);

        if (!title || !status) {
            return next(new Error("Title and Status are required"));
        }

        const result = await pool.query(
            "INSERT INTO tasks (title, description, status, dueDate, userID) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [title, description, status, dueDate, userID],
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error" });
    }
};

// Fetches all tasks from array
const getTasks = async (req, res) => {
    try {
        const userID = req.user.id;

        const result = await pool.query(
            "SELECT id, title, description,status, dueDate, created_at, last_modified FROM tasks WHERE user_id = $1 ORDERED BY created_at DESC",
            [userID],
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error" });
    }
};

//Fetches specific task found by id
const getTasksbyID = async (req, res) => {
    try {
        const { taskId } = req.params;
        const userID = req.user.id;

        const result = await pool.query(
            "SELECT name, description, status, due_date, created_at, last_modified FROM tasks WHERE id = $1 AND user_id = $2",
            [taskId, userID],
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error" });
    }
};

// Updates the task
const updateTask = async (req, res) => {
    try {
        const { title, status, dueDate } = req.body;
        const { taskId } = req.params;
        const userId = req.user.id;

        if (!title.trim()) {
            return res.status(400).json({
                message: "Task title is required to update task",
            });
        }

        const result = await pool.query(
            "UPDATE tasks SET name = $1, status = $2, dueDate = $3, last_modified = CURRENT_TIMESTAMP WHERE id = $4, user_id = $5 RETURNING *",
            [title, status, dueDate, taskId, userId],
        );

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error" });
    }
};

// Deletes the task by id
const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        if (!taskId) {
            return res.status(400).json({ message: "Task does not exist." });
        }

        const result = await pool.query(
            "DELETE FROM tasks WHERE id = $1 RETURNING *",
        );

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error" });
    }
};

const patchTask = async (req, res) => {
    try {
        const updates = req.body;
        const { taskId } = req.params;
        const names = [];
        const values = [];

        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                names.push(key);
                values.push(value);
            } else {
                return res.status(400).json({
                    message:
                        "Enter allowed fields (task name, task status, due date)",
                });
            }
        }

        if (values.length === 0) {
            return res.status(400).json({
                message: "No fields provided for update.",
            });
        }

        const namesResult = names
            .map((name, index) => {
                return name + " = " + "$" + (index + 1);
            })
            .join(", ");

        const IDindex = values.length + 1;

        const query =
            "UPDATE tasks SET " +
            namesResult +
            " WHERE id = $" +
            IDindex +
            " RETURNING *";

        const result = await pool.query(query, [...values, taskId]);

        return res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error" });
    }
};

module.exports = {
    getTasks,
    getTasksbyID,
    createTask,
    updateTask,
    deleteTask,
    patchTask,
};

import pool from "../database/db.js";
import {
    validStatuses,
    validateDate,
    validateID,
} from "../validators/taskValidators.js";

const allowedFields = ["name", "status", "due_date"];

// Creates new task and adds it to in-memory array
const createTask = async (req, res) => {
    try {
        const { name, status, description } = req.body;
        let { due_date } = req.body;
        const user_id = req.user.id;

        console.log("POST /", req.body);

        if (!name || typeof name !== "string" || name.trim().length === 0) {
            return res.status(400).json({ message: "Task name is invalid." });
        }

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message:
                    "Please enter valid status(pending, in-progress, completed)",
            });
        }

        if (typeof description !== "string") {
            return res
                .status(400)
                .json({ message: "Description must be of type string" });
        }

        const dateValidation = validateDate(due_date);

        if (!dateValidation.valid) {
            return res.status(400).json({
                message: dateValidation.message,
            });
        }

        due_date = dateValidation.value;

        const normalizedName = name.trim();

        const result = await pool.query(
            "INSERT INTO tasks (name, description, status, due_date, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [normalizedName, description, status, due_date, user_id],
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
        const user_id = req.user.id;

        const result = await pool.query(
            "SELECT id, name, description, status, due_date, created_at, last_modified FROM tasks WHERE user_id = $1 ORDER BY created_at DESC",
            [user_id],
        );

        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error" });
    }
};

//Fetches specific task found by id
const getTasksbyID = async (req, res) => {
    try {
        const { task_id } = req.params;
        const user_id = req.user.id;

        const idValidation = validateID(task_id);

        if (!idValidation.valid) {
            return res.status(400).json({
                message: idValidation.message,
            });
        }

        const id = idValidation.value;

        const result = await pool.query(
            "SELECT id, name, description, status, due_date, created_at, last_modified FROM tasks WHERE id = $1 AND user_id = $2",
            [id, user_id],
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "The task was not found" });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error" });
    }
};

// Updates the task
const updateTask = async (req, res) => {
    try {
        const { name, status, description } = req.body;
        let { due_date } = req.body;
        const { task_id } = req.params;
        const user_id = req.user.id;

        if (!name || typeof name !== "string" || name.trim().length == 0) {
            return res.status(400).json({
                message: "Task title is not valid",
            });
        }

        const idValidation = validateID(task_id);
        if (!idValidation.valid) {
            return res.status(400).json({
                message: idValidation.message,
            });
        }

        const id = idValidation.value;

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message:
                    "Invalid status inputed. Valid statuses are {pending, in-progress and completed}",
            });
        }

        if (typeof description !== "string") {
            return res
                .status(400)
                .json({ message: "Description must be of string type" });
        }

        const dateValidation = validateDate(due_date);
        if (!dateValidation.valid) {
            return res.status(400).json({
                message: dateValidation.message,
            });
        }

        due_date = dateValidation.value;

        const normalizedName = name.trim();

        const result = await pool.query(
            "UPDATE tasks SET name = $1, status = $2, description = $3, due_date = $4, last_modified = CURRENT_TIMESTAMP WHERE id = $5 AND user_id = $6 RETURNING *",
            [normalizedName, status, description, due_date, id, user_id],
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Task was not found" });
        }

        return res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error" });
    }
};

// Deletes the task by id
const deleteTask = async (req, res) => {
    try {
        const { task_id } = req.params;
        const user_id = req.user.id;

        const idValidation = validateID(task_id);
        if (!idValidation.valid) {
            return res.status(400).json({
                message: idValidation.message,
            });
        }

        const id = idValidation.value;

        const result = await pool.query(
            "DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *",
            [id, user_id],
        );

        if (result.rowCount === 0) {
            return res
                .status(404)
                .json({ message: "The task was not found to be deleted" });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error" });
    }
};

const patchTask = async (req, res) => {
    try {
        const updates = req.body;
        const { task_id } = req.params;
        const user_id = req.user.id;
        const fields = [];
        const values = [];

        if (!updates || Object.keys(updates).length === 0) {
            return res
                .status(400)
                .json({ message: "Invalid fields inputed for update." });
        }

        const idValidation = validateID(task_id);
        if (idValidation.valid) {
            return res.status(400).json({
                message: idValidation.message,
            });
        }

        const id = idValidation.value;

        for (const [key, value] of Object.entries(updates)) {
            if (!allowedFields.includes(key)) {
                return res.status(400).json({
                    message:
                        "Invalid field inputed. Allowed fields (title, status, dueDate)",
                });
            }
            let normalizedValue = value;
            if (key === "name") {
                if (typeof value !== "string" || value.trim().length === 0) {
                    return res
                        .status(400)
                        .json({ message: "Invalid task name or empty name" });
                }
                normalizedValue = value.trim();
            } else if (key === "status") {
                if (!validStatuses.includes(value)) {
                    return res
                        .status(400)
                        .json({ message: "Invalid status value" });
                }
            } else if (key === "due_date") {
                const dateValidation = validateDate(value);
                if (!dateValidation.valid) {
                    return res.status(400).json({
                        message: dateValidation.message,
                    });
                }
                value = dateValidation.value;
            }
            fields.push(key);
            values.push(normalizedValue);
        }

        const fieldsResult = fields
            .map((name, index) => {
                return name + " = " + "$" + (index + 1);
            })
            .join(", ");

        const IDindex = values.length + 1;
        const userIndex = IDindex + 1;

        const query =
            "UPDATE tasks SET " +
            fieldsResult +
            " WHERE id = $" +
            IDindex +
            " AND user_id = $" +
            userIndex +
            " RETURNING *";

        const result = await pool.query(query, [...values, id, user_id]);

        if (result.rowCount == 0) {
            return res
                .status(404)
                .json({ message: "Task was not found for updating" });
        }

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

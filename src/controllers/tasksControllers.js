const pool = require("../database/db.js");
const {
    validateName,
    validateDate,
    validateStatus,
    validateID,
} = require("../validators/taskValidators.js");
const allowedFields = ["name", "status", "description", "due_date"];

// Creates new task and adds it to in-memory array
const createTask = async (req, res) => {
    try {
        let { name, status, description, due_date } = req.body;
        const user_id = req.user.id;

        const nameValidation = validateName(name);
        if (!nameValidation.valid) {
            return res.status(400).json({
                message: nameValidation.message,
            });
        }

        name = nameValidation.value;

        const statusValidation = validateStatus(status);
        if (!statusValidation.valid) {
            return res.status(400).json({
                message: statusValidation.message,
            });
        }

        status = statusValidation.value;

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
        let { task_id } = req.params;
        const user_id = req.user.id;

        const idValidation = validateID(task_id);

        if (!idValidation.valid) {
            return res.status(400).json({
                message: idValidation.message,
            });
        }
        task_id = idValidation.value;

        const result = await pool.query(
            "SELECT id, name, description, status, due_date, created_at, last_modified FROM tasks WHERE id = $1 AND user_id = $2",
            [task_id, user_id],
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
        let { name, status, description, due_date } = req.body;
        let { task_id } = req.params;
        const user_id = req.user.id;

        const nameValidation = validateName(name);
        if (!nameValidation.valid) {
            return res.status(400).json({
                message: nameValidation.message,
            });
        }
        name = nameValidation.value;

        const idValidation = validateID(task_id);
        if (!idValidation.valid) {
            return res.status(400).json({
                message: idValidation.message,
            });
        }
        task_id = idValidation.value;

        const statusValidation = validateStatus(status);
        if (!statusValidation.valid) {
            return res.status(400).json({
                message: statusValidation.message,
            });
        }
        status = statusValidation.value;

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
            [normalizedName, status, description, due_date, task_id, user_id],
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
        let { task_id } = req.params;
        const user_id = req.user.id;

        const idValidation = validateID(task_id);
        if (!idValidation.valid) {
            return res.status(400).json({
                message: idValidation.message,
            });
        }
        task_id = idValidation.value;

        const result = await pool.query(
            "DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *",
            [task_id, user_id],
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
        let { task_id } = req.params;
        const user_id = req.user.id;
        const fields = [];
        const values = [];

        if (!updates || Object.keys(updates).length === 0) {
            return res
                .status(400)
                .json({ message: "Invalid fields inputed for update." });
        }

        if (Array.isArray(updates) || typeof updates !== "object") {
            return res
                .status(400)
                .json({ message: "Updates must be json format {}" });
        }

        const idValidation = validateID(task_id);
        if (!idValidation.valid) {
            return res.status(400).json({
                message: idValidation.message,
            });
        }
        task_id = idValidation.value;

        for (const [key, value] of Object.entries(updates)) {
            if (!allowedFields.includes(key)) {
                return res.status(400).json({
                    message:
                        "Invalid field inputed. Allowed fields: name, status, description, due_date",
                });
            }
            let finalValue = value;
            if (key === "name") {
                if (typeof value !== "string" || value.trim().length === 0) {
                    return res
                        .status(400)
                        .json({ message: "Invalid task name or empty name" });
                }
                finalValue = value.trim();
            } else if (key === "status") {
                const statusValidation = validateStatus(value);
                if (!statusValidation.valid) {
                    return res
                        .status(400)
                        .json({ message: statusValidation.message });
                }
                finalValue = statusValidation.value;
            } else if (key === "description") {
                if (typeof value !== "string") {
                    return res.status(400).json({
                        message: "Invalid description, must be string.",
                    });
                }
                finalValue = value.trim();
            } else if (key === "due_date") {
                const dateValidation = validateDate(value);
                if (!dateValidation.valid) {
                    return res.status(400).json({
                        message: dateValidation.message,
                    });
                }
                finalValue = dateValidation.value;
            }
            fields.push(key);
            values.push(finalValue);
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

        const result = await pool.query(query, [...values, task_id, user_id]);

        if (result.rowCount === 0) {
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

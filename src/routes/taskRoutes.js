const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware.js");

const {
    getTasks,
    getTasksbyID,
    createTask,
    updateTask,
    deleteTask,
    patchTask,
} = require("../controllers/tasksControllers");

router.use(authenticateToken);

router.get("/", getTasks);
router.get("/:task_id", getTasksbyID);
router.post("/", createTask);
router.put("/:task_id", updateTask);
router.delete("/:task_id", deleteTask);
router.patch("/:task_id", patchTask);

module.exports = router;

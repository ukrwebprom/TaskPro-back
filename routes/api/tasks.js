const express = require("express");
const { validateBody, authenticate } = require("../../middlewares");
const { taskSchemas } = require("../../models/task");
const ctrl = require("../../controllers/tasks");
const router = express.Router();

router.delete("/:taskId", authenticate, ctrl.deleteTask);

module.exports = router;

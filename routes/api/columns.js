const express = require("express");
const { validateBody, authenticate } = require("../../middlewares");
const { schemas } = require("../../models/column");
const { taskSchemas } = require("../../models/task");
const ctrl = require("../../controllers/columns");
const router = express.Router();

router.post("/", authenticate, validateBody(schemas.addSchema), ctrl.addColumn);
router.patch(
  "/:columnId",
  authenticate,
  validateBody(schemas.updateSchema),
  ctrl.updateColumn
);
router.post("/", authenticate, validateBody(schemas.addSchema), ctrl.addColumn);
router.delete("/:columnId", authenticate, ctrl.deleteColumn);
router.post(
  "/:columnId/tasks",
  authenticate,
  validateBody(taskSchemas.addSchema),
  ctrl.addTask
);

module.exports = router;

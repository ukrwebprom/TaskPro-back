const express = require("express");
const { validateBody, authenticate } = require("../../middlewares");
const { schemas } = require("../../models/column");
const ctrl = require("../../controllers/columns");
const router = express.Router();

router.post("/", authenticate, validateBody(schemas.addSchema), ctrl.addColumn);
router.patch(
  "/:columnId",
  authenticate,
  validateBody(schemas.updateSchema),
  ctrl.updateColumn
);

module.exports = router;

const express = require("express");
const { validateBody, authenticate } = require("../../middlewares");
const { schemas } = require("../../models/board");
const ctrl = require("../../controllers/boards");
const router = express.Router();

router.get("/", authenticate, ctrl.getAll);
router.post("/", authenticate, validateBody(schemas.addSchema), ctrl.addBoard);
router.get("/:boardId", authenticate, ctrl.getBoard);
router.put(
  "/:boardId",
  authenticate,
  validateBody(schemas.updateSchema),
  ctrl.updateBoard
);

module.exports = router;

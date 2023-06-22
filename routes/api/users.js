const express = require("express");
const { validateBody } = require("../../middlewares");
const { schemas } = require("../../models/user");
const ctrl = require("../../controllers/users");
const router = express.Router();

router.post("/register", validateBody(schemas.registerSchema), ctrl.register);

module.exports = router;

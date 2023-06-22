const express = require("express");
const { validateBody, authenticate } = require("../../middlewares");
const { schemas } = require("../../models/user");
const ctrl = require("../../controllers/users");
const router = express.Router();

router.post("/register", validateBody(schemas.registerSchema), ctrl.register);
router.post("/login", validateBody(schemas.loginSchema), ctrl.login);
router.get("/me", authenticate, ctrl.me);

module.exports = router;

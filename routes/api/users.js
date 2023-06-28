const express = require("express");
const {
  validateBody,
  authenticate,
  upload,
  passport,
} = require("../../middlewares");
const { schemas } = require("../../models/user");
const ctrl = require("../../controllers/users");
const router = express.Router();

router.post("/register", validateBody(schemas.registerSchema), ctrl.register);
router.post("/login", validateBody(schemas.loginSchema), ctrl.login);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  ctrl.googleAuth
);

router.get("/me", authenticate, ctrl.me);
router.patch(
  "/theme",
  authenticate,
  validateBody(schemas.themeSchema),
  ctrl.updateTheme
);
router.put(
  "/update",
  authenticate,
  upload.single("avatar"),
  validateBody(schemas.updateUserSchema),
  ctrl.updateUser
);
router.post("/logout", authenticate, ctrl.logout);

module.exports = router;

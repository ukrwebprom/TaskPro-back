const express = require("express");
const { validateBody } = require("../../middlewares");
const { schemas } = require('../../models/supportMail');
const ctrl = require('../../controllers/support');
const router = express.Router();

router.post('/', validateBody(schemas.addSchema), ctrl.addSupportMail);

module.exports = router;

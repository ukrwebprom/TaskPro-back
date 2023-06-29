const express = require("express");
const { authenticate,validateBody} = require("../../middlewares");
const { schemas } = require('../../models/support');
const ctrl = require('../../controllers/support');
const router = express.Router();

router.post('/', authenticate, validateBody(schemas.addSchema), ctrl.addSupportMail);

module.exports = router;

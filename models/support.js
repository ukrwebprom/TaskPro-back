const { Schema, model } = require("mongoose");
const { HandleMongooseError } = require("../helpers");
const Joi = require("joi");

const supportSchema = new Schema({
    email: {
        type: String,
       required: true,
    },
    message: {
        type: String,
        required: true,
    }
    
}, { versionKey: false });

const addSchema = Joi.object({
  email: Joi.string().email().required(),
  message: Joi.string().required(),
});

const schemas = {
  addSchema,
};

supportSchema.post("save", HandleMongooseError);

const SupportMail = model('support', supportSchema);

module.exports = {
    SupportMail,
    schemas
};
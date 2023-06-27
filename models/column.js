const { Schema, model } = require("mongoose");
const { HandleMongooseError } = require("../helpers");
const Joi = require("joi");

const columnSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    board: {
      type: Schema.Types.ObjectId,
      ref: "board",
      required: true,
    },
    tasks: [
      {
        type: Schema.Types.ObjectId,
        ref: "task",
      },
    ],
  },
  { versionKey: false, timestamps: false }
);

const addSchema = Joi.object({
  title: Joi.string().required(),
  board: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required(),
});

const updateSchema = Joi.object({
  title: Joi.string().required(),
});

const schemas = {
  addSchema,
  updateSchema,
};

columnSchema.post("save", HandleMongooseError);

const Column = model("Column", columnSchema);

module.exports = { Column, schemas };

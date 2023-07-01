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
    order: {
      type: Number,
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

const updateOrderSchema = Joi.object({
  newOrder: Joi.number().required(),
});

const schemas = {
  addSchema,
  updateSchema,
  updateOrderSchema,
};

columnSchema.post("save", HandleMongooseError);

const Column = model("Column", columnSchema);

module.exports = { Column, schemas };

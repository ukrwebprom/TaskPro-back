const { Schema, model } = require("mongoose");
const { HandleMongooseError } = require("../helpers");
const Joi = require("joi");

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    token: {
      type: String,
      default: null,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    theme: {
      type: String,
      enum: ["light", "dark", "violet"],
      default: "dark",
    },
  },
  { versionKey: false, timestamps: false }
);

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(64).required(),
  name: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(64).required(),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const themeSchema = Joi.object({
  theme: Joi.string().valid("dark", "light", "violet").required(),
});

const updateUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(64).required(),
  name: Joi.string().required(),
  avatar: Joi.string(),
});

const schemas = {
  registerSchema,
  loginSchema,
  refreshSchema,
  themeSchema,
  updateUserSchema,
};

userSchema.post("save", HandleMongooseError);

const User = model("user", userSchema);

module.exports = { User, schemas };

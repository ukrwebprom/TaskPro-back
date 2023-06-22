const { User } = require("../models/user");
const { HttpError, ctrlWrapper } = require("../helpers");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = process.env;

const register = async (req, res) => {
  const { email, password, name } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    ...req.body,
    password: hashedPassword,
  });

  res.status(201).json({
    message: "Successful registration ",
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw HttpError(404, "Wrong email or password");

  const check = await bcrypt.compare(password, user.password);
  if (!check) throw HttpError(404, "Wrong email or password");

  const payload = {
    id: user._id,
  };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "24h" });
  await User.findByIdAndUpdate(user._id, { token });
  res.status(200).json({
    token,
    name: user.name,
  });
};

const me = async (req, res) => {
  const { name, email, avatar, theme } = req.user;
  res.status(200).json({
    name,
    email,
    avatar,
    theme,
  });
};

const updateTheme = async (req, res) => {
  const { id } = req.user;
  const result = await User.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  if (!result) {
    throw HttpError(404, "Not Found");
  }
  res.status(200).json({ message: "Theme is updated" });
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  me: ctrlWrapper(me),
  updateTheme: ctrlWrapper(updateTheme),
};

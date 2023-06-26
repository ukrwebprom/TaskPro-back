const { User } = require("../models/user");
const { HttpError, ctrlWrapper } = require("../helpers");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY, REFRESH_SECRET_KEY } = process.env;
const cloudinary = require("cloudinary").v2;

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
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
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "14m" });
  const resreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, {
    expiresIn: "14d",
  });
  await User.findByIdAndUpdate(user._id, { token, refreshToken });
  res.status(200).json({
    token,
    refreshToken,
    name: user.name,
    theme: user.theme,
    avatar: user.avatar,
  });
};

const refresh = async (req, res) => {
  const { refreshToken: token } = req.body;
  try {
    const { id } = jwt.verify(token, REFRESH_SECRET_KEY);
    const isExist = await User.findOne({ refreshToken: token });
    if (!isExist) {
      throw HttpError(403, "Token invalid");
    }

    const payload = {
      id,
    };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "14m" });
    const resreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, {
      expiresIn: "14d",
    });
    res.json({
      token,
      resreshToken,
    });
  } catch (error) {
    throw HttpError(403, error.message);
  }
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

const updateUser = async (req, res) => {
  let url = null;
  if (req.file) {
    const locaFilePath = req.file.path;
    const result = await cloudinary.uploader.upload(locaFilePath, {
      folder: "avatars",
      resource_type: "image",
      quality: "auto",
      fetch_format: "auto",
      public_id: req.file.originalname,
      format: "webp",
      transformation: [{ width: 136, crop: "fill" }],
    });
    url = result.secure_url;
  }
  const { id, avatar } = req.user;
  const { password, email } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    if (id !== existingUser.id) {
      throw HttpError(409, "Email in use");
    }
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const updatedUser = await User.findByIdAndUpdate(
    id,
    {
      ...req.body,
      password: hashedPassword,
      avatar: url || avatar,
    },
    { new: true }
  );
  if (!updatedUser) {
    throw HttpError(404, "Bad request");
  }
  res.status(200).json({
    avatarUrl: updatedUser.avatar,
    name: updatedUser.name,
    email: updatedUser.email,
  });
};

const logout = async (req, res) => {
  const { id } = req.user;
  await User.findByIdAndUpdate(id, { token: null, resreshToken: null });
  res.status(204).json();
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  refresh: ctrlWrapper(refresh),
  me: ctrlWrapper(me),
  updateTheme: ctrlWrapper(updateTheme),
  updateUser: ctrlWrapper(updateUser),
  logout: ctrlWrapper(logout),
};

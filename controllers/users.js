const { User } = require("../models/user");
const { HttpError, ctrlWrapper } = require("../helpers");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY, REFRESH_SECRET_KEY, FRONTEND_URL } = process.env;
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
  const refreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, {
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

const googleAuth = async (req, res) => {
  const payload = {
    id: req.user._id,
  };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "14m" });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, {
    expiresIn: "7d",
  });
  await User.findByIdAndUpdate(req.user._id, { token, refreshToken });

  res.redirect(`${FRONTEND_URL}?token=${token}&refreshToken=${refreshToken}`);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.body;

  try {
    const { id } = jwt.verify(refreshToken, REFRESH_SECRET_KEY);
    const isExist = await User.findOne({ refreshToken });
    if (!isExist) {
      throw HttpError(403, "Token invalid");
    }

    const payload = {
      id,
    };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "14m" });
    const newRefreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, {
      expiresIn: "14d",
    });
    await User.findByIdAndUpdate(id, { token, refreshToken: newRefreshToken });

    res.status(200).json({
      token,
      refreshToken: newRefreshToken,
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
  res.status(200).json({ theme: result.theme });
};

const updateUser = async (req, res) => {
  const { id } = req.user;
  const { password, email } = req.body;
  const user = await User.findById(id);
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    if (id !== existingUser.id) {
      throw HttpError(409, "Email in use");
    }
  }
  let hashedPassword;
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  const updatedUser = await User.findByIdAndUpdate(
    id,
    {
      ...req.body,
      password: hashedPassword || user.password,
    },
    { new: true }
  );

  res.status(200).json({
    avatar: updatedUser.avatar,
    name: updatedUser.name,
    email: updatedUser.email,
  });
};

const logout = async (req, res) => {
  const { id } = req.user;
  await User.findByIdAndUpdate(id, { token: null, refreshToken: null });
  res.status(204).json();
};

const uploadAvatar = async (req, res) => {
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

  res.status(200).json({ url: result.secure_url });
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  googleAuth: ctrlWrapper(googleAuth),
  refresh: ctrlWrapper(refresh),
  me: ctrlWrapper(me),
  updateTheme: ctrlWrapper(updateTheme),
  updateUser: ctrlWrapper(updateUser),
  logout: ctrlWrapper(logout),
  uploadAvatar: ctrlWrapper(uploadAvatar),
};

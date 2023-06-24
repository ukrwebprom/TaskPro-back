const { Board } = require("../models/board");
const { HttpError, ctrlWrapper } = require("../helpers");

const getAll = async (req, res) => {
  const { _id: owner } = req.user;
  const result = await Board.find({ owner });
  res.status(200).json(result);
};

const addBoard = async (req, res) => {
  const { _id: owner } = req.user;
  const result = await Board.create({ ...req.body, owner });
  res.status(201).json({ id: result.id });
};

const updateBoard = async (req, res) => {
  const { boardId } = req.params;
  const { _id: owner } = req.user;
  const result = await Board.findByIdAndUpdate(
    boardId,
    { ...req.body, owner },
    { new: true }
  );
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.status(200).json();
};

module.exports = {
  getAll: ctrlWrapper(getAll),
  addBoard: ctrlWrapper(addBoard),
  updateBoard: ctrlWrapper(updateBoard),
};

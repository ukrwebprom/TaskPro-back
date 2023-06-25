const { Board } = require("../models/board");
const { Column } = require("../models/column");
const { HttpError, ctrlWrapper } = require("../helpers");

const getAll = async (req, res) => {
  const { _id: user } = req.user;
  const result = await Board.find({ user });
  res.status(200).json(result);
};

const getBoard = async (req, res) => {
  const { boardId } = req.params;
  const board = await Board.findById(boardId);
  if (!board) {
    return res.status(404).json({ error: "Board not found" });
  }
  const columns = await Column.find({ board: boardId });

  res.status(200).json({ columns });
};

const addBoard = async (req, res) => {
  const { _id: user } = req.user;
  const result = await Board.create({ ...req.body, user });
  res.status(201).json({ id: result.id });
};

const updateBoard = async (req, res) => {
  const { boardId } = req.params;
  const { _id: user } = req.user;
  const result = await Board.findByIdAndUpdate(
    boardId,
    { ...req.body, user },
    { new: true }
  );
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.status(200).json({ message: "Successful update" });
};

module.exports = {
  getAll: ctrlWrapper(getAll),
  addBoard: ctrlWrapper(addBoard),
  updateBoard: ctrlWrapper(updateBoard),
  getBoard: ctrlWrapper(getBoard),
};

const { Board } = require("../models/board");
const { Column } = require("../models/column");
const { Task } = require("../models/task");
const { HttpError, ctrlWrapper } = require("../helpers");

const getAll = async (req, res) => {
  const { _id: user } = req.user;
  const boards = await Board.find({ user });
  const populatedBoards = await Promise.all(
    boards.map(async (board) => {
      const populatedColumns = await Column.find({ board: board._id })
        .populate("tasks")
        .sort({ order: 1 });

      const sortedColumns = populatedColumns.map((column) => {
        const sortedTasks = column.tasks.sort((a, b) => a.order - b.order);
        return { ...column.toJSON(), tasks: sortedTasks };
      });

      return {
        ...board.toJSON(),
        columns: sortedColumns,
      };
    })
  );
  res.status(200).json(populatedBoards);
};

const addBoard = async (req, res) => {
  const { _id: user } = req.user;
  const result = await Board.create({ ...req.body, user });
  res.status(201).json({ _id: result.id });
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

const updateBoardBcg = async (req, res) => {
  const { boardId } = req.params;
  const { background } = req.body;
  const result = await Board.findByIdAndUpdate(
    boardId,
    { background },
    { new: true }
  );
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.status(200).json({ message: "Background is updated" });
};

const deleteBoard = async (req, res) => {
  const { boardId } = req.params;
  const result = await Board.findByIdAndDelete(boardId);
  if (!result) {
    throw HttpError(404, "Not found");
  }
  const columns = await Column.find({ board: boardId }).populate("tasks");
  for (const column of columns) {
    if (column.tasks.length) {
      await Task.deleteMany({
        _id: { $in: column.tasks.map((task) => task._id) },
      });
    }
    await Column.findByIdAndDelete(column.id);
  }

  res.status(200).json({ message: "Board deleted" });
};

module.exports = {
  getAll: ctrlWrapper(getAll),
  addBoard: ctrlWrapper(addBoard),
  updateBoard: ctrlWrapper(updateBoard),
  updateBoardBcg: ctrlWrapper(updateBoardBcg),
  deleteBoard: ctrlWrapper(deleteBoard),
};

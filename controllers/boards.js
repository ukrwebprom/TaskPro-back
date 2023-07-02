const { Board } = require("../models/board");
const { Column } = require("../models/column");
const { Task } = require("../models/task");
const { HttpError, ctrlWrapper } = require("../helpers");

const getAll = async (req, res) => {
  const { _id: user } = req.user;
  const boards = await Board.find({ user });
  const populatedBoards = await Promise.all(
    boards.map(async (board) => {
      const populatedColumns = await Column.find({ board: board._id }).populate(
        "tasks"
      );
      return {
        ...board.toJSON(),
        columns: populatedColumns,
      };
    })
  );
  res.status(200).json(populatedBoards);
};

const getBoard = async (req, res) => {
  const { boardId } = req.params;
  const board = await Board.findById(boardId);
  if (!board) {
    return res.status(404).json({ error: "Board not found" });
  }
  const columns = await Column.find({ board: boardId }).populate("tasks");

  res.status(200).json(columns);
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
  if (columns.length) {
    await Promise.all(
      columns.map(async (column) => {
        if (column.tasks.length) {
          const tasks = [...column.tasks];
          const flatTasks = tasks.flat();

          await Promise.all(
            flatTasks.map(async (task) => {
              await Task.findByIdAndDelete(task.id);
            })
          );
        }
        await Column.findByIdAndDelete(column.id);
      })
    );
  }

  res.status(200).json({ message: "Board deleted" });
};

module.exports = {
  getAll: ctrlWrapper(getAll),
  addBoard: ctrlWrapper(addBoard),
  updateBoard: ctrlWrapper(updateBoard),
  updateBoardBcg: ctrlWrapper(updateBoardBcg),
  getBoard: ctrlWrapper(getBoard),
  deleteBoard: ctrlWrapper(deleteBoard),
};

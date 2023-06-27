const { Column } = require("../models/column");
const { Task } = require("../models/task");
const { HttpError, ctrlWrapper } = require("../helpers");

const addColumn = async (req, res) => {
  const result = await Column.create(req.body);
  res.status(201).json(result);
};

const updateColumn = async (req, res) => {
  const { columnId } = req.params;
  const result = await Column.findByIdAndUpdate(
    columnId,
    { title: req.body.title },
    {
      new: true,
    }
  );
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.status(200).json({ message: "Successful update" });
};

const deleteColumn = async (req, res) => {
  const result = await Column.findByIdAndDelete(req.params.columnId);
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.status(200).json({ message: "Column deleted" });
};

const addTask = async (req, res) => {
  const { columnId } = req.params;
  const column = await Column.findById(columnId).populate("tasks");
  if (!column) {
    throw HttpError(404, "Not found");
  }
  const newTask = new Task({
    ...req.body,
    column: columnId,
  });
  const savedTask = await newTask.save();
  column.tasks.push(newTask);
  await column.save();

  res.status(200).json(savedTask);
};

module.exports = {
  addColumn: ctrlWrapper(addColumn),
  updateColumn: ctrlWrapper(updateColumn),
  deleteColumn: ctrlWrapper(deleteColumn),
  addTask: ctrlWrapper(addTask),
};

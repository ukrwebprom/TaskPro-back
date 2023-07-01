const { Column } = require("../models/column");
const { Task } = require("../models/task");
const { HttpError, ctrlWrapper } = require("../helpers");

const addColumn = async (req, res) => {
  const { board: boardId } = req.body;
  const columns = await Column.find({ board: boardId });
  const newColumn = await Column.create({ ...req.body, order: columns.length });
  res.status(201).json(newColumn);
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

  res.status(201).json(savedTask);
};

const updateOrder = async (req, res) => {
  const { newOrder } = req.body;
  const { columnId } = req.params;
  const column = ({ board: boardId, order: oldOrder } = await Column.findById(
    columnId
  ));
  const columns = await Column.find({ board: boardId });
  columns.sort((a, b) => a.order - b.order);
  columns.splice(oldOrder, 1);
  columns.splice(newOrder, 0, column);

  const updatedColumns = await Promise.all(
    columns.map(async (column, index) => {
      const updatedColumn = await Column.findByIdAndUpdate(
        column.id,
        {
          order: index,
        },
        { new: true }
      );
      return updatedColumn;
    })
  );
  res.status(200).json({});
};

module.exports = {
  addColumn: ctrlWrapper(addColumn),
  updateColumn: ctrlWrapper(updateColumn),
  deleteColumn: ctrlWrapper(deleteColumn),
  addTask: ctrlWrapper(addTask),
  updateOrder: ctrlWrapper(updateOrder),
};

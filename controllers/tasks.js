const { Task } = require("../models/task");
const { Column } = require("../models/column");
const { HttpError, ctrlWrapper } = require("../helpers");

const updateTask = async (req, res) => {
  const { taskId } = req.params;

  const updatedTask = await Task.findByIdAndUpdate(taskId, req.body, {
    new: true,
  });
  if (!updatedTask) {
    throw new HttpError(404, "No task found with that id");
  }
  res.status(200).json({ message: "Task updated" });
};
const moveTask = async (req, res) => {
  const { taskId } = req.params;
  const { column: columnId } = req.body;

  const task = await Task.findById(taskId);
  if (!task) {
    throw new HttpError(404, "No task found with that id");
  }
  const oldColumnId = task.column;
  const oldColumn = await Column.findById(oldColumnId).populate("tasks");

  oldColumn.tasks.pull({ _id: taskId });
  oldColumn.tasks.sort((a, b) => a.order - b.order);

  const reorderedTasks = await Promise.all(
    oldColumn.tasks.map(async (task, index) => {
      const reorderedTask = await Task.findByIdAndUpdate(
        task.id,
        {
          order: index,
        },
        { new: true }
      );
      return reorderedTask;
    })
  );

  oldColumn.tasks = reorderedTasks;
  await oldColumn.save();

  const updatedTask = await Task.findByIdAndUpdate(taskId, req.body, {
    new: true,
  });

  const column = await Column.findById(columnId).populate("tasks");
  if (!column) {
    throw HttpError(404, "ColumnId not found");
  }
  updatedTask.order = column.tasks.length;
  await updatedTask.save();
  column.tasks.push(updatedTask);

  await column.save();

  res.status(200).json({ message: "Task moved" });
};

const deleteTask = async (req, res) => {
  const { taskId } = req.params;

  const result = await Task.findByIdAndDelete(taskId);
  if (!result) {
    throw new HttpError(404, "No task found with that id");
  }
  res.status(200).json({ message: "Task deleted" });
};

module.exports = {
  deleteTask: ctrlWrapper(deleteTask),
  updateTask: ctrlWrapper(updateTask),
  moveTask: ctrlWrapper(moveTask),
};

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
  const { column: columnId, newOrder } = req.body;

  const task = await Task.findById(taskId);
  if (!task) {
    throw new HttpError(404, "No task found");
  }

  const oldColumnId = task.column.toString();

  if (oldColumnId === columnId && newOrder !== undefined) {
    const column = await Column.findById(columnId).populate("tasks");
    if (!column) {
      throw new HttpError(404, "No column found");
    }

    column.tasks.pull({ _id: taskId });
    column.tasks.splice(newOrder, 0, task);

    await Promise.all(
      column.tasks.map(async (task, index) => {
        task.order = index;
        await task.save();
      })
    );

    await column.save();
  } else if (oldColumnId !== columnId) {
    const oldColumn = await Column.findById(oldColumnId).populate("tasks");
    if (!oldColumn) {
      throw new HttpError(404, "No column found");
    }

    oldColumn.tasks.pull({ _id: taskId });

    await Promise.all(
      oldColumn.tasks.map(async (task, index) => {
        task.order = index;
        await task.save();
      })
    );

    if (newOrder !== undefined) {
      const column = await Column.findById(columnId).populate("tasks");
      if (!column) {
        throw new HttpError(404, "No column found");
      }

      column.tasks.splice(newOrder, 0, task);

      await Promise.all(
        column.tasks.map(async (task, index) => {
          task.order = index;
          await task.save();
        })
      );

      await column.save();
    } else {
      task.order = oldColumn.tasks.length;
      await task.save();

      const column = await Column.findById(columnId);
      if (!column) {
        throw new HttpError(404, "No column found");
      }

      column.tasks.push(task);
      await column.save();
    }
  }

  res.status(200).json({ message: "Task moved" });
};

const deleteTask = async (req, res) => {
  const { taskId } = req.params;
  const task = ({ column: columnId } = await Task.findById(taskId));
  if (!task) {
    throw new HttpError(404, "No task found with that id");
  }
  await Task.findByIdAndDelete(taskId);
  const tasks = await Task.find({ column: columnId });
  tasks.sort((a, b) => a.order - b.order);
  for (let index = 0; index < tasks.length; index++) {
    await Task.findByIdAndUpdate(
      tasks[index].id,
      { order: index },
      { new: true }
    );
  }
  res.status(200).json({ message: "Task deleted" });
};

module.exports = {
  deleteTask: ctrlWrapper(deleteTask),
  updateTask: ctrlWrapper(updateTask),
  moveTask: ctrlWrapper(moveTask),
};

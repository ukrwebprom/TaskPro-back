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
    throw new HttpError(404, "No task found ");
  }
  const column = await Column.findById(columnId).populate("tasks");
  if (!column) {
    throw new HttpError(404, "No column found ");
  }

  const oldColumnId = task.column.toString();

  if (oldColumnId === columnId && newOrder !== undefined) {
    const updatedTask = await Task.findByIdAndUpdate(taskId, req.body, {
      new: true,
    });

    column.tasks.splice(task.order, 1);
    column.tasks.sort((a, b) => a.order - b.order);
    column.tasks.splice(newOrder, 0, updatedTask);

    const reorderedTasks = await Promise.all(
      column.tasks.map(async (task, index) => {
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
    column.tasks = reorderedTasks;
    await column.save();
  }
  if (oldColumnId !== columnId) {
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

    if (newOrder === undefined) {
      const updatedTask = await Task.findByIdAndUpdate(taskId, req.body, {
        new: true,
      });
      updatedTask.order = column.tasks.length;
      await updatedTask.save();
      column.tasks.push(updatedTask);

      await column.save();
    } else {
      const updatedTask = await Task.findByIdAndUpdate(taskId, req.body, {
        new: true,
      });
      column.tasks.sort((a, b) => a.order - b.order);
      column.tasks.splice(newOrder, 0, updatedTask);

      const reorderedTasks = await Promise.all(
        column.tasks.map(async (task, index) => {
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
      column.tasks = reorderedTasks;
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
  const reorderedTasks = await Promise.all(
    tasks.map(async (task, index) => {
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

  res.status(200).json({ message: "Task deleted" });
};

module.exports = {
  deleteTask: ctrlWrapper(deleteTask),
  updateTask: ctrlWrapper(updateTask),
  moveTask: ctrlWrapper(moveTask),
};

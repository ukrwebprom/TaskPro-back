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
    throw new HttpError(404, "No task found with that id");
  }
  const oldColumnId = task.column;

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

    const column = await Column.findById(columnId).populate("tasks");
    if (!column) {
      throw HttpError(404, "ColumnId not found");
    }
    const { tasks } = column;

    if (!newOrder) {
      const updatedTask = await Task.findByIdAndUpdate(taskId, req.body, {
        new: true,
      });
      updatedTask.order = tasks.length;
      await updatedTask.save();
      tasks.push(updatedTask);

      await column.save();
    } else {
      const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        { column: columnId },
        {
          new: true,
        }
      );
      tasks.splice(newOrder, 0, updatedTask);
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
      column.tasks = reorderedTasks;
      await column.save();
    }
  }
  if (oldColumnId === columnId && newOrder) {
    const column = await Column.findById(columnId).populate("tasks");
    const { tasks } = column;
    tasks.splice(task.order, 1);
    tasks.sort((a, b) => a.order - b.order);
    tasks.splice(newOrder, 0, task);

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
    column.tasks = reorderedTasks;
    await column.save();
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

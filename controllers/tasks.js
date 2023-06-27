const { Task } = require("../models/task");
const { HttpError, ctrlWrapper } = require("../helpers");

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
};

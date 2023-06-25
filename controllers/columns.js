const { Column } = require("../models/column");
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
  res.status(200).json();
};

module.exports = {
  addColumn: ctrlWrapper(addColumn),
  updateColumn: ctrlWrapper(updateColumn),
};

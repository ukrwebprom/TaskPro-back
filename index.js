const app = require("./app");
const mongoose = require("mongoose");
const { MONGO_DB, PORT } = process.env;
mongoose
  .connect(MONGO_DB)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running. Use our API on port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error.message);
    process.exit(1);
  });

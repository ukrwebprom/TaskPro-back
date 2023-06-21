require('dotenv').config();
const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message: message });
});

const start = async() => {
    try {
        await mongoose.connect(process.env.MONGO_DB);
        console.log("MongoDB connected");
        app.listen(PORT, () => {
            console.log(`Server running. Use our API on port: ${PORT}`);
          })
    } catch {
        console.log("MongoDB connection error");
    }
}

start();
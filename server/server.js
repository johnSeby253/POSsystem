const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./Database/connection");
const userRoutes = require("./Routes/userRoutes");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://po-ssystem-alpha.vercel.app"],
    credentials: true,
  }),
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "POS API is running!" });
});

app.use("/api", userRoutes);

const PORT = process.env.PORT || 5020;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

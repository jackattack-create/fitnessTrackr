// create the express server here
require("dotenv").config();

const express = require("express");
const server = express();

const morgan = require("morgan");
const cors = require("cors");

const client = require("./db/client");
const PORT = process.env.PORT || 3000;

const apiRouter = require("./api");

server.use(cors());
server.use(morgan("dev"));
server.use(express.urlencoded({ extended: true }));
server.use(express.json());

server.use("/api", apiRouter);

server.get("/", (req, res, next) => {
  try {
    res.send("<h1>HAYYYY</h1>");
  } catch (error) {
    console.error(error);
  }
});

server.use("*", (req, res, next) => {
  res.status(404);
  res.send({ error: "route not found" });
});

server.use((error, req, res, next) => {
  res.status(500);
  res.send(error);
});

server.listen(PORT, () => {
  client.connect();
  console.log("The server is up on port", PORT);
});

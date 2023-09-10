require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const dbConfig = require("./configs/db.config");
const { initMongoDB } = require("./services/db/mongo.service");
const compression = require("compression");
const { EventEmitter } = require("events");

const server = http.createServer(app);
const io = new Server(server);

const event = new EventEmitter();

app.use(express.json());
app.use(compression());
app.use(cors({ origin: "*" }));
app.use("@", express.static(__dirname));

initMongoDB(dbConfig.MONGO_URL)
  .then((info) => {
    console.log(info.message);
  })
  .catch((err) => {
    console.log(err);
  });

io.on("connection", (socket) => {
  console.log("Socket connection set ", Date.now().toLocaleString());

  // app.use(function (req, res, next) {
  //   req.io = socket;
  //   next();
  // });

  socket.on("disconnect", () => {
    console.log("Socket disconnection detected ", Date.now().toLocaleString());
  });
});

app.get("/", (req, res) => {
  res.json({ msg: "Hello from the server" });
});

app.use("/api/v1/auth", require("./routes/auth.route"));
app.use("/api/v1/driver", require("./routes/driver.route"));
app.use("/api/v1/geocoding", require("./routes/geocoding.route"));

app.listen(process.env.PORT, () => {
  console.log(`Server started at ${process.env.PORT}`);
});

module.exports = { event };

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const dbConfig = require("./configs/db.config")

const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(cors({ origin: "*" }));
app.use("@", express.static(__dirname))

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

app.use("/auth", require("./routes/auth.route"));

app.listen(process.env.PORT, () => {
  console.log(`Server started at ${process.env.PORT}`);
});

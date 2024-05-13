require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const compression = require("compression");
const { mainEvent } = require("./events/index");
const { cronInitialize } = require("./crons/primeTime");
const {
  addConnectedUser,
  removeConnectedUser,
  connections,
} = require("./socket-connections");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:8100", "http://localhost:5173"],
  },
});
global.io = io;

app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(compression());
app.use(cors({ origin: "*" }));
app.use("@", express.static(__dirname));

// initMongoDB(dbConfig.MONGO_URL)
//   .then((info) => {
//     console.log(info.message);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

io.on("connection", (socket) => {
  console.log("just a blank connection");
  socket.on("connection:init", async (data) => {
    await addConnectedUser(data);
    console.log(connections);
  });

  let disconnectedUserId = "";

  socket.on("connection:disconnect", async (data) => {
    disconnectedUserId = data.user.oneId;
    console.log(disconnectedUserId);
  });

  socket.on("disconnect", async () => {
    await removeConnectedUser(disconnectedUserId);
    if (disconnectedUserId) disconnectedUserId = "";
    console.log("Socket disconnection detected ", new Date().toISOString());
    console.log(connections);
  });
});

const initCronJob = async () => {
  const { enableSchedule, disableSchedule } = await cronInitialize();

  return { enableSchedule, disableSchedule };
};

mainEvent.on("primeTimeInit", async (data) => {
  const { disableSchedule, enableSchedule } = await initCronJob();

  const { cronJob: enable } = await enableSchedule(data);
  const { cronJob: disable } = await disableSchedule(data);

  enable.start();
  disable.start();

  console.log("Cronjob initalization added");
});

app.get("/", (req, res) => {
  res.json({ msg: "Hello from the server" });
});

app.use("/api/v1/client", require("./routes/client.route"));
app.use("/api/v1/driver", require("./routes/driver.route"));
app.use("/api/v1/geocoding", require("./routes/geocoding.route"));
app.use("/api/v1/primeTime", require("./routes/primeTime.route"));
app.use("/api/v1/routes", require("./routes/route.route"));

server.listen(process.env.PORT, async () => {
  console.log(`Server started at ${process.env.PORT}`);
});

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const compression = require("compression");
const { mainEvent } = require("./events/index");
const { cronInitialize } = require("./crons/primeTime");
const { initializeApp } = require("firebase/app");
const { firebaseConfig } = require("./configs/firebase.config");

const server = http.createServer(app);
const io = new Server(server);
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
  console.log("Socket connection set ", Date.now().toLocaleString());

  socket.on("disconnect", () => {
    console.log("Socket disconnection detected ", Date.now().toLocaleString());
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

app.listen(process.env.PORT, async () => {
  console.log(`Server started at ${process.env.PORT}`);
});

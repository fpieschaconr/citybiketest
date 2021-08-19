const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const citybikeurl = "http://api.citybik.es/v2/networks/decobike-miami-beach";
const axios = require("axios");
const cron = require("node-cron");

const port = process.env.PORT || 4001;
const index = require("./routes/index");
const app = express();

let historical = [];
let currentData = [];
const getData = async () => {
  return await axios.get(citybikeurl);
};

app.use(index);

const server = http.createServer(app);
const io = socketIo(server); // < Interesting!
let interval;

io.on("connection", (socket) => {
  var socketId = socket.id;
  var clientIp = socket.request.connection.remoteAddress;
  console.log("New connection " + socketId + " from " + clientIp);
  socket.on("ready", function () {
    getData()
      .then((res) => io.emit("getMiamiAvailability", res.data))
      .catch((err) => console.error(err));
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

cron.schedule("*/5 * * * * *", function () {
  getData()
    .then((res) => {
      currentData = res.data;
      io.emit("getMiamiAvailability", res.data);
    })
    .catch((err) => console.error(err));
});

cron.schedule("*/5 * * * *", function () {
  if (historical.length >= 2016) {
    historical.shift();
  }
  historical.push(currentData);
  io.emit("getHistoricalAvailability", historical);
});

server.listen(port, () => console.log(`Listening on port ${port}`));

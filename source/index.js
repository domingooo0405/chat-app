const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessage, generateLocation } = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUserById,
  getUsersInRoom,
} = require("./utils/user");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");
let count = 0;

app.use(express.static(publicDirectoryPath));
io.on("connection", (socket) => {
  console.log("New websocket connection");

  //   socket.emit("countUpdated", count);
  //   socket.on("increment", () => {
  //     count++;
  //     // socket.emit("countUpdated", count);
  //     io.emit("countUpdated", count);
  //   });

  socket.on("join", (options, callback) => {
    const { error, user } = addUser({
      id: socket.id,
      ...options,
    });
    if (error) {
      return callback(error);
    }
    socket.join(user.room);

    socket.emit("message", generateMessage(`Welcome ${user.username}`));
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage(`${user.username} has joined!`));
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
    // socket.emit, io.emit, socket.broadcast.emit
    // io.to.emit, socket.broadcast.to.emit
    // console.log(user);
  });
  // socket.emit("message", generateMessage("Welcome"));
  socket.broadcast.emit("message", "A new user has joined");

  socket.on("sendMessage", (message, callback) => {
    const user = getUserById(socket.id);
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed!");
    }

    io.to(user.room).emit(
      "message",
      generateMessage(`${user.username}: ${message} `)
    );
    callback();
  });
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage(`Disconnected, ${user.username} has left`)
      );
      // console.log(user.username);
      // console.log(user);
    }
  });

  socket.on("sendLocation", (coords, callback) => {
    io.emit(
      "locationMessage",
      generateLocation(
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );
    callback();
  });
});

server.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);

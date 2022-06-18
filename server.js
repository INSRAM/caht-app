const app = require("express")();
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const http = require("http");
require("dotenv").config();
const server = http.createServer(app);
const io = require("socket.io")(server);
const userRoutes = require("./routes/userRoutes.js");
const globalHandler = require("./controller/errorController.js");

let clientSocketIds = [];
let connectedUsers = [];
const Port = process.env.Port || 8080;
const mongoURl = process.env.mongo_URL;

app.use(bodyparser.json());
app.use(cookieParser());

mongoose.connect(
  mongoURl,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) throw err;
    console.log("Connected to MongoDB!!!");
  }
);

app.use("/", userRoutes);
app.use(globalHandler);

// soket functions
const getSocketByUserId = (userId) => {
  let socket = "";
  for (let i = 0; i < clientSocketIds.length; i++) {
    if (clientSocketIds[i].userId == userId) {
      socket = clientSocketIds[i].socket;
      break;
    }
  }
  return socket;
};

io.on("connection", function (socket) {
  //   for disconnecting socket
  socket.on("disconnect", () => {
    connectedUsers = connectedUsers.filter(
      (item) => item.socketId != socket.id
    );
    io.emit("updateUserList", connectedUsers);
  });

  //   user logged in
  socket.on("loggedin", function (user) {
    clientSocketIds.push({ socket: socket, userId: user.user_id });
    connectedUsers = connectedUsers.filter(
      (item) => item.user_id != user.user_id
    );
    connectedUsers.push({ ...user, socketId: socket.id });
    io.emit("updateUserList", connectedUsers);
  });

  // creating room
  socket.on("create", function (data) {
    socket.join(data.room);
    let withSocket = getSocketByUserId(data.withUserId);
    socket.broadcast.to(withSocket.id).emit("invite", { room: data });
  });

  //   joinroom
  socket.on("joinRoom", function (data) {
    socket.join(data.room.room);
  });

  // emmiting message to that spsecific room
  socket.on("message", function (data) {
    socket.broadcast.to(data.room).emit("message", data);
  });
});

server.listen(3000, () => {
  console.log("server is running on port 3000.");
});

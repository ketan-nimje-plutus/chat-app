const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const userRoutes = require("./Routes/userRoutes");
const messageRoutes = require("./Routes/messageRoutes");
const { Server } = require("socket.io");
const { createServer } = require("http");
const multer = require("multer");

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const port = process.env.PORT || 5000;
const dbURL = process.env.ATLAS_URL;

app.use(express.json());
app.use(cors());
app.use("/api/user", userRoutes);

app.use("/api/message",messageRoutes);
app.use("/public", express.static("public"));

// app.use((err, req, res, next) => {
//   if (err instanceof multer.MulterError) {
//     console.log("error ouccer");
//     return res.json({ error: "only png allow" });
//   }
// });

const connectToDatabase = async () => {
  try {
    await mongoose.connect(dbURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected successfully");
  } catch (error) {
    console.log("Database not connected", error);
  }
};

connectToDatabase();

// const onlineUser = new Map();
// let onlineUserArray = null;

// io.on("connection", (socket) => {
//   socket.on("add-user", (userID) => {
//     if (!onlineUserArray?.includes(userID)) {
//       onlineUser.set(userID, socket.id);
//     } else {
//       console.log("already added");
//     }
//     onlineUserArray = Array.from(onlineUser.keys());

//     socket.emit("online-user", onlineUserArray);
//     console.log("online user array", onlineUserArray);
//     console.log("onlineUser",onlineUser)
//   });

//   socket.on("send-msg", (data) => {
//     const receiverSocket = onlineUser.get(data.to);
//     console.log("receiversocket", receiverSocket);
//     if (receiverSocket) {
//       socket.to(receiverSocket).emit("msg-recieve", data.message);
//     }
//   });
//   socket.on("end", (data) => {

//     onlineUser.delete(data)
//     socket.emit("online-user", onlineUserArray);
//     console.log("onlineUser after log out",onlineUser)
//   });
// });

let onlineUser = [];
io.on("connection", (socket) => {
  //add new user
  socket.on("add-user", (newuserID) => {
    if (!onlineUser.some((user) => user.userID == newuserID)) {
      onlineUser.push({
        userID: newuserID,
        socketId: socket.id,
      });
    } else {
      console.log("already added");
    }
    io.emit("online-user", onlineUser);
    console.log("online user", onlineUser);
  });

  //send message
  socket.on("send-msg", (data) => {
    console.log("send-msg data", data);
    const receiver = data.to;
    const receiverSocket = onlineUser?.find((user) => user.userID == receiver);
    console.log("online user", onlineUser);
    console.log("receiverSocket", receiverSocket);
    console.log("........", data.msg_type);
    if (receiverSocket) {
      // ssocket.to(receiverSocket.socketId).emit("msg-recieve", {to:receiverSocket.userID, message:data.message});
      io.to(receiverSocket.socketId).emit("msg-recieve", {
        message: data.message,
        to: data.from,
        msg_type: data.msg_type,
      });
    }
  });
  //remove user
  socket.on("end-connection", () => {
    console.log("socket.id", socket.id);
    onlineUser = onlineUser.filter((user) => user.socketId !== socket.id);
    io.emit("online-user", onlineUser);
    console.log("online user after logout", onlineUser);
  });
});

httpServer.listen(port, () => {
  console.log(`server running on ${port}`);
});

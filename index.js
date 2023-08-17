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
   
  });

  //send message
  socket.on("send-msg", (data) => {
    const receiver = data.to;
    const receiverSocket = onlineUser?.find((user) => user.userID == receiver);
    if (receiverSocket) {
      // ssocket.to(receiverSocket.socketId).emit("msg-recieve", {to:receiverSocket.userID, message:data.message});
     if(data.message) 
     {
      io.to(receiverSocket.socketId).emit("msg-recieve", {
        message: data.message,
        to: data.from,
        msg_type: data.msg_type,
      });
     }
     else
     {
      io.to(receiverSocket.socketId).emit("msg-recieve", {
        attechment: data.attechment,
        to: data.from,
        msg_type: data.msg_type,
      });
     }
     


    }
  });
  //remove user
  socket.on("end-connection", () => {
    onlineUser = onlineUser.filter((user) => user.socketId !== socket.id);
    io.emit("online-user", onlineUser);
  });
});

httpServer.listen(port, () => {
  console.log(`server running on ${port}`);
});

const messageModel = require("../Models/messageModel");

const sendMessage = async (req, res) => {
  // const data = await messageModel.deleteMany();
  const { from, to, message, msg_type } = req.body;
  console.log("sendMessage called", req.body);
  if (!from || !to) {
    return res.json({
      status: 0,
      message: "all fields are require",
    });
  }
  try {
    const data = await messageModel.create({
      text: message ? message : "",
      to: to,
      from: from,
      msg_type: msg_type,
      isView: false,
    });
    if (data) {
      return res.json({
        status: 1,
        message: "message send successfully..",
      });
    } else {
      return res.json({
        status: 1,
        message: "can not send message",
      });
    }
  } catch (err) {
    console.log(err);
  }
};
const sendImage = async (req, res) => {
  console.log("sendImage calleddd");

  const { from, to, msg_type } = req.body;
  if (!req.file) {
    console.log("file require");
  }
  const file = req.file.filename;

  if (!from || !to) {
    return res.json({
      status: 0,
      message: "all fields are require",
    });
  }
  try {
    const data = await messageModel.create({
      attechment: file,
      to: to,
      from: from,
      isView: false,
      msg_type: msg_type,
    });
    if (data) {
      console.log("data", data);
      return res.json({
        data: data.attechment,
        status: 1,
        message: "image send successfully..",
      });
    } else {
      return res.json({
        status: 1,
        message: "can not send message",
      });
    }
  } catch (err) {
    console.log(err);
  }
};
const getAllMessage = async (req, res) => {
  try {
    const { from, to } = req.body;
    // console.log("from, to", from, to);
    const data = await messageModel.find({
      $or: [
        { $and: [{ to: to, from: from }] },
        { $and: [{ to: from, from: to }] },
      ],
    });
    const projectMsg = data.map((msg) => {
      return {
        fromSelf: msg.from.toString() === from,
        message: msg.text,
        msg_type: msg.msg_type,
        attechment: msg.attechment,
        createdAt: msg.createdAt,
        attechment: msg.attechment,
      };
    });
    return res.json({
      status: 1,
      message: projectMsg,
    });
  } catch (error) {
    console.log("error", error);
  }
};
const viewMessage = async (req, res) => {
  const { to } = req.body;
  if (!to) {
    return res.json({
      status: 0,
      message: "all fields are require",
    });
  }
  try {
    const data = await messageModel.find({
      $and: [{ to: to, isView: false }],
    });
    return res.json({
      status: 1,
      message: data,
    });
  } catch (err) {
    console.log("error", err);
  }
};
const changeStatus = async (req, res) => {
  const { to, from } = req.body;
  if (!to || !from) {
    return res.json({
      status: 0,
      message: "all fields are require",
    });
  }
  try {
    const data = await messageModel.updateMany(
      {
        $and: [{ to: to }, { from: from }],
      },
      {
        $set: { isView: true },
      }
    );
    return res.json({
      status: 1,
      message: "updated sucussfully",
    });
  } catch (err) {
    console.log("error", err);
  }
};

module.exports = {
  sendMessage,
  getAllMessage,
  viewMessage,
  changeStatus,
  sendImage,
};

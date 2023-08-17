const userModel = require("../Models/userModel");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.json({
      status: 0,
      message: "all fildes are required.",
    });
  }
  if (!validator.isEmail(email)) {
    return res.json({
      status: 0,
      message: "invalid email",
    });
  }
  const existUser = await userModel.findOne({ email });
  if (existUser) {
    return res.json({
      status: 0,
      message: "user Already exist...",
    });
  }
  if (!validator.isStrongPassword(password)) {
    return res.json({
      status: 0,
      message: "storng password required",
    });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new userModel({ name, email, password: hashedPassword });
  await user.save();

  res.json({
    status: 1,
    message: "Done",
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      status: 0,
      message: "all fildes are required.",
    });
  }
  const existUser = await userModel.findOne({ email });
  if (!existUser) {
    return res.json({
      status: 0,
      message: "user does not exist with this email",
    });
  }
  bcrypt.compare(password, existUser.password, (err, result) => {
    if (err) {
      return res.json({
        status: 0,
        message: "Something Wrong occured",
      });
    }
    if (!result) {
      return res.json({
        status: 0,
        message: "Invalid Password ! ",
      });
    }
    const payload = {
      id: existUser._id,
      name: existUser.name,
      email: existUser.email,
      password: existUser.password,
    };
    const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: "7d" });

    return res.json({
      status: 1,
      message: "login sucessfully",
      token: token,
      user: payload,
    });
  });
};

const getUser = async (req, res) => {
  const users = await userModel.find();
  return res.json({
    status: 1,
    users: users,
  });
};

const searchUser = async (req, res) => {
  const { search } = req.body;
  if(!search)
  {
    return res.json({
      status: 0,
      message: "all fildes are required.",
    });
  }
  try {
    const data = await userModel.find({
      $or: [
        {
          name: { $regex: `^${search}`, $options: 'm' } ,
        },
        { email: { $regex: `^${search}`, $options: 'm' } },
      ],
    });
    if(data.length>0)
    {
      return res.json({
        status: 1,
        user:data,
        message: "search successfully.",
        
      });
    }
    else
    {
      return res.json({
        status: 0,
        message: "No result Found ",
      });

    }
  } catch (error) {
    console.log("error");
  }
};


module.exports = { register, login, getUser ,searchUser };

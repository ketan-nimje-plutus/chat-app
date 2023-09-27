const userModel = require("../Models/userModel");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  const { fullName, email, contactNumber } = req.body;
  if (!fullName || !email || !contactNumber) {
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
  // if (!validator.isStrongPassword(password)) {
  //   return res.json({
  //     status: 0,
  //     message: "storng password required",
  //   });
  // }
  // const hashedPassword = await bcrypt.hash(password, 10);
  const user = new userModel({ fullName, email, contactNumber, socketid: '',role:"BD"});
  await user.save();

  res.json({
    status: 1,
    message: "Done",
  });
};

//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.json({
//       status: 0,
//       message: "all fildes are required.",
//     });
//   }
//   const existUser = await userModel.findOne({ email });
//   if (!existUser) {
//     return res.json({
//       status: 0,
//       message: "user does not exist with this email",
//     });
//   }
//   bcrypt.compare(password, existUser.password, (err, result) => {
//     if (err) {
//       return res.json({
//         status: 0,
//         message: "Something Wrong occured",
//       });
//     }
//     if (!result) {
//       return res.json({
//         status: 0,
//         message: "Invalid Password ! ",
//       });
//     }
//     const payload = {
//       id: existUser._id,
//       name: existUser.name,
//       email: existUser.email,
//       password: existUser.password,
//     };

//     const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: "7d" });

//     return res.json({
//       status: 1,
//       message: "login sucessfully",
//       token: token,
//       user: payload,
//     });
//   });
// };
const login = async (req, res) => {
  const { fullName, email, contactNumber } = req.body;
  if (!fullName || !email || !contactNumber) {
    return res.json({
      status: 0,
      message: "all fields are required.",
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
    const payload = {
      id: existUser._id,
      fullName: existUser.fullName,
      email: existUser.email,
      contactNumber: existUser.contactNumber,
      role:existUser.role
    };

    const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: "7d" });

    return res.json({
      status: 1,
      message: "login successfully",
      token: token,
      user: payload,
    });

  }
  const payload = {
    // _id: userModel._id, // You don't need this line
    // Include other properties you need in the payload
    fullName: fullName,
    email: email,
    contactNumber: contactNumber,
    role:""
  };

  const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: "7d" });
  const user = new userModel(payload); // Pass payload as an object

  await user.save();

  res.json({
    status: 1,
    message: "Done",
    User: user,
    Token: token,
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
  if (!search) {
    return res.json({
      status: 0,
      message: "all fildes are required.",
    });
  }
  try {
    const data = await userModel.find({
      $or: [
        {
          name: { $regex: `^${search}`, $options: 'm' },
        },
        { email: { $regex: `^${search}`, $options: 'm' } },
      ],
    });
    if (data.length > 0) {
      return res.json({
        status: 1,
        user: data,
        message: "search successfully.",
      });
    } else {
      return res.json({
        status: 0,
        message: "No result Found ",
      });
    }
  } catch (error) {
    console.log("error");
  }
};

module.exports = { register, login, getUser, searchUser };

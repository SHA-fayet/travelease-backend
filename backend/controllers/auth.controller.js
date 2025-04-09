import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

// Test controller
export const test = (req, res) => {
  return res.send("Hello From Test!");
};

// Signup controller
export const signupController = async (req, res) => {
  try {
    const { username, email, password, address, phone, user_role, agencyName, businessLicense } = req.body;

    if (!username || !email || !password || !address || !phone) {
      return res.status(400).send({
        success: false,
        message: "All fields are required!",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).send({
        success: false,
        message: "User already exists please login",
      });
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      address,
      phone,
      user_role: user_role || 0,
      agencyName: agencyName || "",
      businessLicense: businessLicense || "",
      isVerifiedAgency: user_role === 2 ? true : false,
    });

    await newUser.save();

    return res.status(201).send({
      message: "User Created Successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in server!",
    });
  }
};

// Login controller
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "All fields are required!",
      });
    }

    const validUser = await User.findOne({ email });
    if (!validUser) {
      return res.status(404).send({
        success: false,
        message: "User not found!",
      });
    }

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      return res.status(401).send({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET, {
      expiresIn: "4d",
    });
    
    const { password: pass, ...rest } = validUser._doc;
    
    res
      .cookie("X_TTMS_access_token", token, {
        httpOnly: true,
        maxAge: 4 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .send({
        success: true,
        message: "Login Success",
        user: rest,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error during login",
    });
  }
};

// Logout controller
export const logOutController = (req, res) => {
  try {
    res.clearCookie("X_TTMS_access_token");
    res.status(200).send({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.log(error);
  }
};
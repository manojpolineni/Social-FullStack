import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";

//Register User
export const register = async (req, res) => {
  try {
    const { userName, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      userName,
      email,
      phone,
      password: hashedPassword,
    });

    await newUser.save();

    res
      .status(201)
      .json({
        message: "User registered successfully",
        user: {
          id: newUser._id,
          username: newUser.userName,
          email: newUser.email,
        },
      });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//Login User
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "invalid credentials! " });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_ACCESS,
      { expiresIn: "1d" }
    );
    user.isOnline = true;

    await user.save();

    res.cookie("token", token, {
      httpOnly: true, //only accessible via Http requests not JS.
      secure: process.env.NODE_ENV === "production", //only works on https
      sameSite: true,
      maxAge: 24 * 60 * 60 * 1000, //1 day cookie
    });

    res.json({
      message: "Login successful",
      user: {id: user._id, userName: user.userName, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(400).json({ message: "No user logged in" });
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.isOnline = false;
    await user.save();
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate OTP (6-digit random number)
    const otp = Math.floor(100000 + Math.random() * 900000);
    user.resetOTP = otp;
    user.resetOTPExpiry = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
    await user.save();

    // Send Email with OTP
    await sendEmail(user.email, user.name, otp);
    res.json({ message: "OTP sent to your email" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.resetOTP !== otp || Date.now() > user.resetOTPExpiry) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOTP = null;
    user.resetOTPExpiry = null;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

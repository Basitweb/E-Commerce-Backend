import User from "../models/User.js";
import jwt from "jsonwebtoken";
import {sendEmail} from "../utils/sendEmail.js";
import { generateToken } from "../utils/generateToken.js";
// Add this at the top of authController.js
import crypto from "crypto";

// const generateToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: "7d"
//   });
// };



export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 🔍 Check existing user
    const userExists = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (userExists) {
      return res.status(400).json({
        message: "Email or Username already in use",
      });
    }

    // ✅ Create user
    const user = await User.create({
      username,
      email,
      password,
    });

    // 🔐 Generate verification token
    const verifyToken = user.generateEmailVerificationToken();
    await user.save();

    // 🔗 Verification URL
    const verifyURL = `${process.env.BASE_URL}/api/auth/verify-email/${verifyToken}`;

    // 📧 Send Email
    await sendEmail({
      email: user.email,
      subject: "Verify Your Email",
      message: `
        <h2>Email Verification</h2>
        <p>Click below to verify your email:</p>
        <a href="${verifyURL}" target="_blank">Verify Email</a>
      `,
    });

    res.status(201).json({
      message: "User registered. Please verify your email.",
      token: generateToken(user._id), // optional: you can delay token until verification
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const verifyEmail = async (req, res) => {
  try {
    const token = req.params.token;

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // ✅ Verify user
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;

    await user.save();

    res.status(200).json({ message: "Email verified successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "User already verified",
      });
    }

    const verifyToken = user.generateEmailVerificationToken();
    await user.save();

    const verifyURL = `${process.env.BASE_URL}/api/auth/verify-email/${verifyToken}`;

    await sendEmail({
      email: user.email,
      subject: "Verify Your Email",
      message: `
        <h2>Resend Verification</h2>
        <a href="${verifyURL}">Verify Email</a>
      `,
    });

    res.json({ message: "Verification email resent" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// export const register = async (req, res) => {
//   try {
//     const { username, email, password } = req.body;

//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     const user = await User.create({ username, email, password });

//     res.status(201).json({
//       user,
//       token: generateToken(user._id)
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Add this check
    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in" });
    }

    res.json({ user, token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
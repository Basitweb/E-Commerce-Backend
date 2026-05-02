import express from "express";
import {
  register,
  login,
  verifyEmail,
  resendVerificationEmail,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔐 Auth Routes
router.post("/register", register);
router.post("/login", login);

// 📧 Email Verification
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

// 🔒 Protected Test Route (optional)
router.get("/me", protect, (req, res) => {
  res.json({
    message: "User authenticated",
    user: req.user,
  });
});

export default router;
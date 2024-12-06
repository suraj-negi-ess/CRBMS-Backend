import express, { Router } from "express";
import {
  updatePassword,
  changeProfilePic,
  forgetPassword,
  getAllUsers,
  getMyProfile,
  getUserById,
  loginUser,
  logoutUser,
  registerUser,
  sendOTPAgain,
  updateMyProfile,
  verifyOTPForLogin,
  resetPassword,
  checkAuth,
  updateBlockStatus,
  updateUserProfile,
  softDeleteUser,
  permanentDeleteUser,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/check-auth").get(verifyJWT, checkAuth); //DONE

// POST Register /api/v1/auth
router.route("/register").post(upload.single("avatar"), registerUser); //DONE

// Authentication
router.route("/login").post(loginUser); //DONE

// VerifyOTP
router.route("/verify-otp").post(verifyOTPForLogin); //DONE

// Logout
router.route("/logout").post(logoutUser); //DONE

// Resend OTP
router.route("/resend-otp").post(sendOTPAgain); //DONE

// Get MyProfile
router.route("/my-profile").get(verifyJWT, getMyProfile); //DONE

// get all users
router.route("/users").get(verifyJWT, getAllUsers); //DONE

// Update my profile
router.route("/update-my-profile").put(verifyJWT, updateMyProfile);

// Get User by id
router.route("/:id").get(verifyJWT, getUserById);

// Update User Profile
router.route("/update-profile/:id").put(verifyJWT, updateUserProfile);

// Change Password by user manually
router.route("/update-password").put(verifyJWT, updatePassword);

// Change Profile Pictures
router
  .route("/change-profile-picture")
  .put(verifyJWT, upload.single("avatar"), changeProfilePic);

// Forgot Password
router.route("/forgot-password").post(forgetPassword); //DONE

// reset-password
router.route("/reset-password/:token").post(resetPassword); //DONE

router.route("/block-status").post(updateBlockStatus);

// Soft-Delete User Profile
router.route("/soft-delete/:id").delete(softDeleteUser);

// Permanent-Delete User Profile
router.route("/permanent-delete/:id").delete(permanentDeleteUser);

export default router;

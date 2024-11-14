import User from "../models/User.models.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { generateOTP } from "../helpers/sendAndVerifyOTP.helper.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import generateAccessAndRefreshToken from "../helpers/generateTokens.helpers.js";
import { verifyOTPHelper } from "../helpers/verifyOTP.helper.js";
import {
  sendOTP,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
} from "../nodemailer/email.js";
import { Op } from "sequelize";
import fs from "fs";
import path from "path";

// COOKIE OPTIONS
const options = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// REGISTER USER OR ADD USER
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, fullname, phoneNumber } = req.body;

  if (
    [username, email, password, fullname, phoneNumber].some(
      (field) => field?.trim() === ("" || undefined)
    )
  ) {
    throw new ApiError(400, "All Fields Are Required");
  }

  const existingUser = await User.findOne({ where: { email, phoneNumber } });

  if (existingUser) {
    throw new ApiError(400, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const avatarPath = req.file ? `avatars/${req.file.filename}` : null;

  try {
    const newUser = await User.create({
      email,
      password: hashedPassword,
      fullname,
      phoneNumber,
      avatarPath,
    });

    const createdUser = await User.findByPk(newUser.id, {
      attributes: { exclude: ["password", "refreshToken"] },
    });

    return res
      .status(201)
      .json(new ApiResponse(200, { createdUser }, "User Created Successfully"));
  } catch (error) {
    if (avatarPath) {
      fs.unlink(`public/${avatarPath}`, (err) => {
        if (err) console.error("Error deleting the avatar:", err);
      });
    }
    console.log(error);
    throw new ApiError(500, "Failed to create user");
  }
});

// LOGIN USER
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if ([email, password].some((field) => field?.trim() === ("" || undefined))) {
    throw new ApiError(400, "All Fields Are Required");
  }

  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new ApiError(401, "User Not Found");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Password");
  }

  // is this correct?
  if (user.isBlocked === true) {
    throw new ApiError(403, "User Is Blocked");
  }

  const OTP = generateOTP();

  user.tempOTP = OTP;
  user.otpExpiresAt = new Date(Date.now() + 0.5 * 60 * 60 * 1000);
  await user.save();

  await sendOTP(user.email, OTP);

  return res
    .status(201)
    .json(
      new ApiResponse(200, { OTP }, "OTP Sent. Please Verify your OTP to Login")
    );
});

// VERIFY OTP
const verifyOTPForLogin = asyncHandler(async (req, res) => {
  const { verifyLoginEmail, verificationCode } = req.body;

  const user = await verifyOTPHelper(verifyLoginEmail, verificationCode);

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user.id
  );

  const loggedInUser = await User.findByPk(user.id, {
    attributes: { exclude: ["password", "refreshToken"] },
  });

  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, { user: loggedInUser }, "LoggedIN"));
});

// SendOTPAgain
const sendOTPAgain = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email?.trim()) {
    throw new ApiError(400, "Email is required");
  }

  // Find user in the database
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Generate a new OTP
  const newOTP = generateOTP();

  // Send OTP to user's phone number
  const otpSent = await sendOTP(user.email, newOTP);
  if (!otpSent) {
    throw new ApiError(500, "Failed to send OTP");
  }

  // Store OTP temporarily (In a real-world scenario, this should be done using Redis or another cache)
  user.tempOTP = newOTP;
  await user.save();

  // Send response indicating OTP was sent successfully
  return res
    .status(200)
    .json(new ApiResponse(200, { newOTP }, "OTP sent successfully"));
});

// LogOut
const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("accessToken");
  res.status(200).json({ message: "Logout successful" });
});

// Check If User Is Already Logged in or not
const checkAuth = asyncHandler(async (req, res) => {
  if (req.user) {
    return res.status(200).json(new ApiResponse(200, {}, "Authenticated"));
  } else {
    throw new ApiError(401, "Not authenticated");
  }
});

// Get My Profile
const getMyProfile = asyncHandler(async (req, res) => {
  try {
    return res
      .status(200)
      .json(new ApiResponse(200, req.user, "Profile retrieved successfully"));
  } catch (error) {
    throw new ApiError(400, "Something went wrong");
  }
});

// get user by id(For Admin)
const getUserById = asyncHandler(async (req, res) => {
  console.log("Working");
  const { id } = req.params;
  console.log(id);

  if (!id) {
    throw new ApiError(400, "Please provide a valid user id");
  }

  const user = await User.findByPk(id, {
    attributes: { exclude: ["password", "refreshToken"] },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User retrieved successfully"));
});

// get ALL user(For Admin)
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const loggedInUser = await User.findByPk(req.user.id);
  if (!loggedInUser) {
    throw new ApiError(400, "Please Log In");
  }

  if (!loggedInUser.isAdmin) {
    throw new ApiError(403, "Access denied. Admins only.");
  }

  const users = await User.findAndCountAll({
    attributes: { exclude: ["password", "refreshToken"] },
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  if (!users) {
    throw new ApiError(500, "No User Found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        totalUsers: users.count,
        totalPages: Math.ceil(users.count / limit),
        currentPage: page,
      },
      "Users retrieved successfully"
    )
  );
});

// Update profile
const updateMyProfile = asyncHandler(async (req, res) => {
  const { fullname, email, phoneNumber } = req.body;

  if (!req.user.id) {
    throw new ApiError(401, "Not authenticated");
  }

  const user = await User.findByPk(req.user.id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.fullname = fullname || user.fullname;
  user.email = email || user.email;
  user.phoneNumber = phoneNumber || user.phoneNumber;

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile updated successfully"));
});

// Update User (Admin)
const updateUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { fullname, email, phoneNumber } = req.body;

  const loggedInUser = await User.findByPk(req.user.id);

  if (!loggedInUser) {
    throw new ApiError(400, "Please log in");
  }

  const user = await User.findByPk(id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!loggedInUser.isAdmin && loggedInUser.id !== user.id) {
    throw new ApiError(
      403,
      "Access denied. Only admins can update other users' profiles."
    );
  }

  user.fullname = fullname || user.fullname;
  user.email = email || user.email;
  user.phoneNumber = phoneNumber || user.phoneNumber;

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User profile updated successfully"));
});

// Change Password from User Profile
const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, " Old Password are required");
  }

  const user = await User.findByPk(req.user.id);

  if (!user) {
    throw new ApiError(404, "User Not Found");
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Incorrect Old Password");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password Updated Successfully"));
});

// Change Profile Picture
const changeProfilePic = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "New Profile Pic is Required");
  }

  // Find the user in the database
  const user = await User.findByPk(req.user.id);
  if (!user) {
    throw new ApiError(404, "User Not Found");
  }

  // Update the user's avatar path in the database
  const newAvatarPath = path.join("public/avatars", req.file.filename);
  user.avatarPath = newAvatarPath;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Profile Pic Updated Successfully"));
});

// forgot password
const forgetPassword = asyncHandler(async (req, res) => {
  // take email from users req.body.email
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is Required");
  }

  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new ApiError(404, "User Not Found");
  }

  // const otp = generateOTP();
  // GENERATE RESET TOKEN
  // await sendOTP(user.email, otp);

  // user.tempOTP = otp;
  // await user.save();

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000);

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpiresAt = resetTokenExpiresAt;

  await user.save();

  await sendPasswordResetEmail(
    user.email,
    `${process.env.CLIENT_URL}/reset-password/${resetToken}`
  );

  res
    .status(200)
    .json(new ApiResponse(200, { resetToken }, "Reset Link Send To Your Mail"));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    where: {
      resetPasswordToken: token,
      resetPasswordExpiresAt: {
        [Op.gt]: new Date(),
      },
    },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  user.password = hashedPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpiresAt = null;
  await user.save();

  // Send reset success email
  await sendResetSuccessEmail(user.email);

  res.status(200).json(new ApiResponse(200, {}, "Password reset successful"));
});

const updateBlockStatus = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const { isBlocked } = req.body;

  console.log(userId, isBlocked);

  const user = await User.findOne({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.isBlocked = isBlocked;

  user.resetPasswordToken = null;
  user.resetPasswordExpiresAt = null;

  await user.save();

  // Optionally, send an email notification about the block/unblock status change
  // await sendBlockStatusChangeEmail(user.email, isBlocked);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        `User ${isBlocked ? "blocked" : "unblocked"} successfully`
      )
    );
});

export {
  registerUser,
  loginUser,
  verifyOTPForLogin,
  sendOTPAgain,
  logoutUser,
  getMyProfile,
  checkAuth,
  getUserById,
  getAllUsers,
  updateMyProfile,
  updateUserProfile,
  updatePassword,
  changeProfilePic,
  forgetPassword,
  resetPassword,
  updateBlockStatus,
};

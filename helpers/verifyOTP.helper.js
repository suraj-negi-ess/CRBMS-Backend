import { Op } from "sequelize";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/User.models.js";

export const verifyOTPHelper = async (email, otp) => {
  if ([otp].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "OTP are required");
  }

  const user = await User.findOne({
    where: {
      email,
      otpExpiresAt: {
        [Op.gt]: new Date(),
      },
    },
  });
  // If user not found, either email is invalid or OTP expired
  if (!user) {
    throw new ApiError(404, "Invalid OTP or OTP expired");
  }

  // Check if the provided OTP matches the user's OTP
  if (otp !== user.tempOTP) {
    throw new ApiError(400, "Invalid OTP");
  }

  // Clear OTP after successful verification
  user.tempOTP = null;
  user.otpExpiresAt = null; // Optionally clear expiration time
  await user.save();

  return user;
};

import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/User.models.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized Request: No token provided");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Find the user based on the token
    const user = await User.findByPk(decodedToken.id, {
      attributes: { exclude: ["password", "refreshToken"] },
    });

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    // if (user.avatar) {
    //   // Directly convert the buffer to Base64
    //   const base64Avatar = user.avatar.toString("base64");
    //   user.avatar = `data:image/webp;base64,${base64Avatar}`;
    //   // console.log("Converted Base64 Avatar:", user.avatar);
    // } else {
    //   console.warn("User avatar is not available.");
    // }

    req.user = user;

    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Unauthorized Request");
  }
});

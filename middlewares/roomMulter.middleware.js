import multer from "multer";
import path from "path";
import fs from "fs";
import { ApiError } from "../utils/ApiError.js";

const roomStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "public/room-images";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const { name } = req.body;
    if (!name) {
      return cb(
        new ApiError(400, "Room name is required to generate filename")
      );
    }
    const sanitized_name = name.replace(/\s+/g, "_");
    const fileExt = path.extname(file.originalname).toLowerCase();
    const newFileName = `${sanitized_name}${fileExt}`;
    cb(null, newFileName);
  },
});

const roomFileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(
      new ApiError(400, "Only image files (jpeg, jpg, png, webp) are allowed")
    );
  }
};

// Create multer instance for room images with custom storage and file filter
const uploadRoomImage = multer({
  storage: roomStorage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB file size limit
  fileFilter: roomFileFilter,
});

export default uploadRoomImage;

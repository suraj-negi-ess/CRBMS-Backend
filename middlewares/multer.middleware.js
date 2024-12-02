import multer from "multer";
import path from "path";
import fs from "fs";
import { ApiError } from "../utils/ApiError.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "public/avatars";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const { phoneNumber, fullname, email } = req.body;
    const uniqueName = `${email}_${phoneNumber}_${fullname}`.replace(
      /\s+/g,
      "_"
    );
    const fileExt = path.extname(file.originalname).toLowerCase();
    const newFileName = `${uniqueName}${fileExt}`;
    cb(null, newFileName);
  },
});

const fileFilter = (req, file, cb) => {
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

// Create multer instance with our custom storage and file filter
const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB file size limit
  fileFilter,
});

export default upload;

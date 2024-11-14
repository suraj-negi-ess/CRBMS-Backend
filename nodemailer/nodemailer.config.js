// nodemailer.config.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const transporter = nodemailer.createTransport({
  service: "gmail", // Or "Yahoo", "Outlook", or another provider
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Define your sender's information
export const sender = {
  email: process.env.SMTP_EMAIL,
  name: "Suraj Singh Negi",
};

// helpers/otpHelper.js
import crypto from "crypto";

export const generateOTP = (length = 6) => {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, digits.length); // Secure random index
    otp += digits[randomIndex];
  }
  return otp;  
};

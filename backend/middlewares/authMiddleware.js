import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => { 
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({success:false,  message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }
    next();

  } catch (error) {
    const isExpired = error.name === "TokenExpiredError";

    return res.status(401).json({
      success: false,
      message: isExpired ? "Session expired" : "Unauthorized",
      expired: isExpired,
    });
  }
}

export default authMiddleware;

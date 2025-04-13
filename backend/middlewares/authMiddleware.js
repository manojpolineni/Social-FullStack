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


// const authMiddleware = (roles = []) => {
//   return (req, res, next) => {
//     try {
//       // ✅ Corrected cookie key name
//       const token = req.cookies.accessToken;
//       if (!token) return res.status(401).json({ message: "Unauthorized!" });

//       // ✅ Verify JWT Token
//       const decoded = jwt.verify(token, process.env.JWT_ACCESS);
//       req.user = decoded;

//       // ✅ Role-based access control (if roles are defined)
//       if (roles.length) {
//         const userRoles = Array.isArray(req.user.roles)
//           ? req.user.roles
//           : [req.user.roles];
//         const hasAccess = roles.some((role) => userRoles.includes(role));

//         if (!hasAccess) {
//           return res
//             .status(403)
//             .json({ message: "Forbidden: Insufficient permissions" });
//         }
//       }

//       next();
//     } catch (error) {
//       console.error("Auth Middleware Error:", error);
//       res.status(401).json({ message: "Invalid token" });
//     }
//   };
// };
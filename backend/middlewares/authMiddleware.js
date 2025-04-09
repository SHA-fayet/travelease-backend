import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const requireSignIn = async (req, res, next) => {
  const token = req?.cookies?.X_TTMS_access_token || req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).send({
      success: false,
      message: "Unauthorized: Token not provided!",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).send({
        success: false,
        message: "Forbidden",
      });
    }

    req.user = user;
    next();
  });
};

// Admin access
export const isAdmin = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = await User.findById(userId);
    
    if (user && user.user_role === 1) {
      next();
    } else {
      return res.status(401).send({
        success: false,
        message: "Unauthorized Access: Admin privileges required",
      });
    }
  } catch (error) {
    console.log("Admin middleware error:", error);
    res.status(401).send({
      success: false,
      message: "Error in admin middleware",
      error,
    });
  }
};
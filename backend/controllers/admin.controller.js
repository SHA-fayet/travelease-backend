import User from "../models/user.model.js";
import Package from "../models/package.model.js";

// Get all users for admin oversight
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).send({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send({ success: false, message: "Failed to fetch users" });
  }
};

// Update user role (e.g., make someone an agency or admin)
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { user_role } = req.body; // 0, 1, or 2

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { user_role },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).send({ success: false, message: "User not found" });
    }

    res.status(200).send({
      success: true,
      message: "User role updated successfully",
      updatedUser,
    });
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).send({ success: false, message: "Failed to update user role" });
  }
};

// Get admin stats (total users, total packages, etc.)
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPackages = await Package.countDocuments();
    const agenciesCount = await User.countDocuments({ user_role: 2 });

    res.status(200).send({
      success: true,
      stats: {
        totalUsers,
        totalPackages,
        agenciesCount,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).send({ success: false, message: "Failed to fetch dashboard statistics" });
  }
};
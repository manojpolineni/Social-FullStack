import User from "../models/User.js";

//Get All users
export const getAllUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const users = await User.find({ _id: { $ne: currentUserId } }).select("_id userName profilePic isOnline ").sort({ createdAt: -1 }).populate('messages');

    return res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

//Get User
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password").populate("followers", "userName profilePic").populate("following", "userName profilePic");

    if (!user) return res.status(404).json({ message: "User not found!" });
    
    res.status(200).json({success:true, user});
  } catch (error) {
    console.log("error in userinfo", error.message);
    res.status(500).json({ message: error.message });
  }
}

//Update User
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found!" });

    const updatedFields = {};

    const updatableFields = ["userName", "email", "gender", "age", "bio", "phone", "nickName", "village", "city", "state", "country", "pincode", "language"];
    
    // Add updated fields from request body
    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updatedFields[field] = req.body[field];
      }
    });

    if (req.body.profilePic) {
      updatedFields.profilePic = req.body.profilePic;
    }

    if (Object.keys(updatedFields).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatedFields, {
      new: true,
    }).select("-password");

    res.json({ message: "Profile updated successfully", updatedUser });


  } catch (error) {
    console.log("error in backend", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



//Delete User
export const deleteUser = async (req, res) => { 
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found!" });

    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

//follow users
export const followUser = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const userId = await User.findById(req.params.id);

    if (!userId) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (!currentUser.following.includes(userId._id)) {
      currentUser.following.push(userId._id);
      userId.followers.push(currentUser._id);

      await currentUser.save();
      await userId.save();
    }

    res.status(200).json({ success: true, message: "Followed successfully!", user: await User.findById(req.user.id).select('-password') });
  } catch (error) {
    console.error("Error in followUser:", error.message);
    res.status(500).json({ message: error.message });
  }
};



//unfollow user
export const unfollowUser = async (req, res) => {
  try {
    const currentUserId = req.user?.id; 
    const { userId } = req.params; 

    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized request! No user ID found." });
    }

    if (!userId) {
      return res.status(400).json({ message: "Invalid request! No target user ID provided." });
    }

    const userToUnfollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToUnfollow) {
      return res.status(404).json({ message: "User to unfollow not found!" });
    }

    if (!currentUser) {
      return res.status(404).json({ message: "Current user not found!" });
    }

    // Remove userId from currentUser.following
    currentUser.following = currentUser.following.filter((id) => id.toString() !== userId);

    // Remove currentUserId from userToUnfollow.followers
    userToUnfollow.followers = userToUnfollow.followers.filter((id) => id.toString() !== currentUserId);

    await currentUser.save();
    await userToUnfollow.save();

    console.log("✅ Successfully unfollowed user.");

    return res.status(200).json({
      success: true,
      message: "Unfollowed successfully",
      user: await User.findById(currentUserId).select("-password"),
    });
  } catch (error) {
    console.error("❌ Error in unfollowUser:", error.message);
    res.status(500).json({ message: error.message });
  }
};

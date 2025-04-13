import Chat from "../models/Chat.js";

// Create or get existing Chat
import mongoose from "mongoose";

export const createOrGetChat = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id; // Authenticated user

    // ✅ Validate `receiverId` and `senderId`
    if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid receiver ID format!" });
    }
    if (!mongoose.Types.ObjectId.isValid(senderId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid sender ID format!" });
    }

    console.log(
      "🔍 Checking existing chat between",
      senderId,
      "and",
      receiverId
    );

    let chat = await Chat.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!chat) {
      console.log("🆕 No existing chat found, creating new chat...");
      chat = new Chat({ participants: [senderId, receiverId] });
      await chat.save();
    }

    console.log("✅ Chat found/created:", chat._id);
    return res.status(200).json({ success: true, chat });
  } catch (error) {
    console.error("❌ Error creating/getting chat:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user.id }).populate(
      "participants",
      "userName profilePic"
    );

    return res.status(200).json({ success: true, chats });
  } catch (error) {
    console.error("❌ Error getting user chats:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export default { createOrGetChat, getUserChats };
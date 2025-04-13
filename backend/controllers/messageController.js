// import Message from "../models/Message.js";
import Message from "../models/Message.js";
import Chat from "../models/Chat.js";
import mongoose from "mongoose";

/** ✅ Get Messages by Chat ID */
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ success: false, message: "Invalid chat ID" });
    }

    const messages = await Message.find({ chatId }).sort({ createdAt: 1 })
      .populate("senderId", "userName profilePic") // optional
      .populate("receiverId", "userName profilePic");;

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("❌ Error fetching messages:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/messages/last-messages
export const getLastMessages = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: new mongoose.Types.ObjectId(currentUserId) },
            { receiverId: new mongoose.Types.ObjectId(currentUserId) }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", new mongoose.Types.ObjectId(currentUserId)] },
              "$receiverId",
              "$senderId"
            ]
          },
          message: { $first: "$$ROOT" }
        }
      },
      {
        $replaceRoot: { newRoot: "$message" }
      },
      {
        $lookup: {
          from: "users",
          localField: "senderId",
          foreignField: "_id",
          as: "senderId"
        }
      },
      {
        $unwind: "$senderId"
      },
      {
        $lookup: {
          from: "users",
          localField: "receiverId",
          foreignField: "_id",
          as: "receiverId"
        }
      },
      {
        $unwind: "$receiverId"
      }
    ]);

    res.status(200).json({ result: messages });
  } catch (error) {
    console.error("❌ Error in getLastMessages:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


/** ✅ Send a Message */
export const sendMessage = async (req, res) => {
  try {
    // const { chatId, message, messageType } = req.body;

    const chatId = req.body.chatId;
    const message = req.body.message;
    const messageType = req.body.messageType || "text";
    const file = req.files && req.files.length > 0 ? req.files[0] : null;
    const fileUrl = file ? `uploads/${file.originalname}` : "";

    if (!chatId || !message) {
      return res.status(400).json({ success: false, message: "chatId and message are required fields!" });
    }

    const chatExists = await Chat.findById(chatId);

    if (!chatExists) {
      return res.status(404).json({ success: false, message: "Chat not found!" });
    }
    // Extract participants from the chat model
    const participants = chatExists.participants;

    if (!participants || participants.length !== 2) {
      return res.status(400).json({ success: false, message: "Chat must have exactly two participants" });
    }

    // Find the receiver (the other participant)
    const receiverId = participants.find((user) => user.toString() !== req.user.id);

    if (!receiverId) {
      return res.status(400).json({ success: false, message: "Receiver not found in this chat!" });
    }

    // Create and save new message
    const newMessage = new Message({
      chatId,
      senderId: req.user.id,
      receiverId: receiverId,
      message,
      fileUrl: fileUrl || "",
      messageType,
      status: "sent",
    });

    const savedMessage = await newMessage.save();

    // Update chat with last message
    await Chat.findByIdAndUpdate(chatId, { lastMessage: savedMessage._id });

    console.log("📨 Saved Message:", savedMessage);

    // Emit message instantly via Socket.io
    req.io.to(chatId).emit("messageStatusUpdate", { chatId, status: "seen" });
    // req.io.to(chatId).emit("receiveMessage", { ...savedMessage.toObject(), status: "delivered" });

    res.status(200).json({ success: true, message: "Message sent", savedMessage });
  } catch (error) {
    console.error("❌ Error sending message:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/** ✅ Mark Messages as Delivered */
export const updateMessageStatus = async (req, res) => {
  try {
    const { chatId, receiverId } = req.body;

    if (!chatId || !receiverId) {
      return res.status(400).json({ success: false, message: "Chat ID & Receiver ID are required" });
    }

    const updatedMessages = await Message.updateMany(
      { chatId, receiverId, status: "sent" },
      { $set: { status: "delivered" } }
    );

    const updated = await Message.find({ chatId, receiverId, status: "delivered" });

    req.io.to(chatId).emit("messageStatusUpdate", {
      status: "delivered",
      updatedMessages,
    });

    res.status(200).json({ success: true, updatedMessages });
  } catch (error) {
    console.error("❌ Error updating to delivered:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


/** ✅ Mark Messages as Seen */
export const markMessagesAsSeen = async (req, res) => {
  try {
    const { chatId } = req.body;
    const receiverId = req.user._id;

    if (!chatId) {
      return res.status(400).json({ success: false, message: "Chat ID is required" });
    }

    await Message.updateMany(
      {
        chatId,
        receiverId,
        status: { $in: ["sent", "delivered"] },
      },
      { $set: { status: "seen" } }
    );

    const updated = await Message.find({
      chatId,
      receiverId,
      status: "seen",
    }).select("_id");

    req.io.to(chatId).emit("messageStatusUpdate", {
      status: "seen",
      updatedMessageIds: updated.map((msg) => msg._id),
      updatedBy: receiverId,
    });

    res.status(200).json({ success: true, updatedMessageIds: updated.map((msg) => msg._id) });
  } catch (error) {
    console.error("❌ Error updating to seen:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

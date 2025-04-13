import { Server } from "socket.io";
import Message from "./models/Message.js";

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL, // Update with the actual frontend URL
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("⚡ New user connected:", socket.id);

    // User joins a chat room
    socket.on("joinChat", (chatId) => {
      socket.join(chatId);
      console.log(`User joined chat: ${chatId}`);
    });

    // Send message
    socket.on("sendMessage", (message) => {
      io.to(message.chatId).emit("receiveMessage", message);
    });

    // ✅ Message Delivered Event
    socket.on("messageDelivered", async ({ chatId, messageId, receiverId }) => {
      try {
        // Update message status to "delivered"
        const updatedMessage = await Message.findByIdAndUpdate(messageId, {
          status: "delivered",
        });

        // Emit only the updated message to prevent unnecessary updates on frontend
        io.to(chatId).emit("messageStatusUpdate", {
          status: "delivered",
          messageId: updatedMessage._id,
        });
      } catch (err) {
        console.error("❌ Error updating delivered status:", err.message);
      }
    });

    // ✅ Mark Messages As Seen
    socket.on("markAsSeen", async ({ chatId, userId }) => {
      try {
        const updatedMessages = await Message.updateMany(
          {
            chatId,
            receiverId: userId,
            status: { $in: ["sent", "delivered"] },
          },
          { $set: { status: "seen" } }
        );

        // Emit the updated messages' IDs to the client
        io.to(chatId).emit("messageStatusUpdate", {
          status: "seen",
          updatedMessageIds: updatedMessages.map((msg) => msg._id),
          updatedBy: userId,
        });
      } catch (err) {
        console.error("❌ Error marking as seen:", err.message);
      }
    });

    // Disconnect event
    socket.on("disconnect", () => {
      console.log("❌ User disconnected");
    });
  });

  return io;
};

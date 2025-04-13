import axios from "axios";
const API_URL = "http://localhost:9999/api";

export const sendMessage = async (messageData) => {
  const formattedMessageData = {
    chatId: messageData.chatId,
    sender: messageData.senderId,
    message: messageData.message,
    messageType: messageData.messageType || "text",
    fileUrl: messageData.fileUrl || "",
  };

  try {
    const res = await axios.post(
      `${API_URL}/messages/send`,
      formattedMessageData,
      {
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error sending message:", error.response?.data || error);
    return { error: error.response?.data || "Message send failed" };
  }
};

export const MessageStatus = async (messageId) => {
  try {
    const res = await axios.put(
      `${API_URL}/messages/status`,
      { messageId },
      { withCredentials: true }
    );
    return res.data;
  } catch (error) {
    console.error(
      "Error updating Message status:",
      error.response?.data || error
    );
  }
};

export const createOrGetChat = async (receiverId) => {
  try {
    console.log(
      "📤 Sending request to create/get chat with receiverId:",
      receiverId
    );

    const res = await axios.post(
      `${API_URL}/chat/chats`,
      { receiverId: receiverId.toString() }, // Ensure it's a string
      { withCredentials: true }
    );

    console.log("✅ Chat created/found:", res.data);

    // ✅ Make sure to return chat._id
    return res.data.chat ? res.data.chat._id : null;
  } catch (error) {
    console.error(
      "❌ Error creating/getting chat:",
      error.response?.data || error
    );
    return null;
  }
};

export const getUserChats = async () => {
  try {
    const res = await axios.get(`${API_URL}/chat/chats`, {
      withCredentials: true,
    });
    console.log("✅ Fetched user chats:", res.data);
    return res.data.chats;
  } catch (error) {
    console.error(
      "❌ Error fetching user chats:",
      error.response?.data || error
    );
    return [];
  }
};

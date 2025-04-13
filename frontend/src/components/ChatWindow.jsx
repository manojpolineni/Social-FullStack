import { useContext, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { Check, CheckCheck } from "lucide-react";
import moment from "moment";
import AuthContext from "../context/AuthContext";
import SocketContext from "../context/SocketContext";
import MessageInput from "./MessageInput";
import { createOrGetChat } from "../utils/chatApi";
import { playSound } from "../utils/playSound";
import man from "../assets/man.jpg";

const ChatWindow = ({ selectedUser }) => {
  const { user } = useContext(AuthContext);
  const { socket, socketReady } = useContext(SocketContext);
  const { profilePic, userName } = selectedUser || {};
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);
  const chatIdRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatDateLabel = (dateStr) => {
    const today = moment().startOf("day");
    const yesterday = moment().subtract(1, "days").startOf("day");
    const msgDate = moment(dateStr, "YYYY-MM-DD").startOf("day");

    if (msgDate.isSame(today)) return "Today";
    if (msgDate.isSame(yesterday)) return "Yesterday";
    return msgDate.format("MMM D, YYYY");
  };

  // Group messages by date
  const groupMessagesByDate = (msgs) =>
    msgs.reduce((acc, msg) => {
      const date = moment(msg.createdAt).format("YYYY-MM-DD");
      acc[date] = acc[date] || [];
      acc[date].push(msg);
      return acc;
    }, {});

  const groupedMessages = groupMessagesByDate(messages);

  // Fetch messages
  const fetchMessages = async (chatId) => {
    try {
      const res = await axios.get(
        `https://social-fullstack-backend.onrender.com/api/messages/${chatId}`,
        { withCredentials: true }
      );
      console.log('userchats', res?.data?.messages);
      setMessages(res?.data?.messages);
    } catch (err) {
      console.error(" Fetch error:", err);
    }
  };

  // Handle socket events
  useEffect(() => {
    if (!selectedUser || !socket || !socketReady) return;

    const initializeChat = async () => {
      try {
        const chatId = await createOrGetChat(selectedUser._id);
        if (!chatId) return;
        setChatId(chatId);
        chatIdRef.current = chatId;
        console.log("✅ Chat ID:", chatId);
        fetchMessages(chatId);

        // Join the chat room and update message status
        socket.emit("joinChat", chatId);

        setTimeout(() => {
          socket.emit("updateMessageStatus", {
            chatId,
            userId: user._id,
          });
        }, 500);
      } catch (err) {
        console.error("❌ Chat init error:", err);
      }
    };

    // Initialize the chat
    initializeChat();

    const handleReceiveMessage = (msg) => {
      if (!msg?._id) return;
      const senderId =
        typeof msg.senderId === "string" ? msg.senderId : msg.senderId?._id;
      if (senderId === user._id) return;

      // Avoid duplicates in the message list
      setMessages((prev) => {
        const exists = prev.some((m) => m._id === msg._id);
        return exists ? prev : [...prev, msg];
      });

      // Play the sound for receiving a message
      playSound("receive");

      // Emit the message delivered event to backend
      socket.emit("messageDelivered", {
        chatId: msg.chatId,
        messageId: msg._id,
        receiverId: user._id,
      });

      // Scroll to the bottom after receiving a new message
      setTimeout(scrollToBottom, 100);
    };

    const handleMessageSent = (msg) => {
      // Update the sent message status
      setMessages((prev) =>
        prev.map((m) => (m.createdAt === msg.createdAt ? msg : m))
      );
      // Scroll to the bottom after message is sent
      setTimeout(scrollToBottom, 100);
    };

    const handleMessageStatusUpdate = ({
      chatId,
      messageId,
      status,
      updatedMessageIds,
    }) => {
      // Check if the message is part of the current chat
      if (chatId === chatIdRef.current) {
        // If the status is updated for a single message
        if (messageId) {
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg._id === messageId ? { ...msg, status } : msg
            )
          );
        }

        // If the status is updated for multiple messages
        if (updatedMessageIds && updatedMessageIds.length) {
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              updatedMessageIds.includes(msg._id) ? { ...msg, status } : msg
            )
          );
        }
      }
    };

    // Add event listeners for socket events
    socket.off("receiveMessage").on("receiveMessage", handleReceiveMessage);
    socket.off("messageSent").on("messageSent", handleMessageSent);
    socket.off("messageStatusUpdate").on("messageStatusUpdate", handleMessageStatusUpdate);

    // Cleanup on component unmount
    return () => {
      if (socket) {
        socket.off("receiveMessage", handleReceiveMessage);
        socket.off("messageSent", handleMessageSent);
        socket.off("messageStatusUpdate", handleMessageStatusUpdate);
      }
    };
  }, [socket, user._id, selectedUser, socketReady]);

  // Send message
  const sendMessage = async ({ message, messageType, fileUrl }) => {
    while (!chatIdRef.current) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    const newMessage = {
      chatId,
      senderId: user._id,
      receiverId: selectedUser._id,
      message,
      messageType,
      fileUrl: fileUrl || "",
      status: "sent",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    playSound("send");

    try {
      const res = await axios.post(
        "https://social-fullstack-backend.onrender.com/api/messages/send",
        newMessage,
        { withCredentials: true }
      );

      const savedMessage = res.data.savedMessage;

      if (socketReady) {
        socket.emit("sendMessage", savedMessage);
      } else {
        console.warn("⚠️ Socket not ready to emit message.");
      }
      setMessages((prev) =>
        prev.map((msg) =>
          msg.createdAt === newMessage.createdAt ? savedMessage : msg
        )
      );
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error("❌ Send error:", err);
    }
  };

  return (
    <div className="w-full h-[650px] flex flex-col shadow-xl">
      <div className="p-3 flex items-center shadow-lg dark:shadow-xl text-xl font-bold capitalize">
        <img
          src={
            profilePic && profilePic.startsWith("http")
              ? profilePic
              : profilePic
              ? `https://social-fullstack-backend.onrender.com${profilePic}`
              : man
          }
          alt="Profile"
          className={`w-11 h-11 rounded-full object-cover ${
            user.isOnline ? " p-0.5 border-green-600 " : ""
          }`}
        />
        <p className="capitalize pl-1 text-xl font-semibold">{userName}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.keys(groupedMessages).map((date) => (
          <div key={date}>
            <div className="text-center w-[100px] mx-auto text-sm border border-gray-600 my-2 rounded-xl px-2 py-0.5 flex justify-center items-center">
              {formatDateLabel(date)}
            </div>

            {groupedMessages[date].map((msg, idx) => {
              let senderId =
                typeof msg.senderId === "string"
                  ? msg.senderId
                  : msg.senderId?._id;

              const isSender = senderId === user._id;
              const uniqueKey = `${msg._id || msg.createdAt}-${idx}`;
              const time = moment(msg.createdAt).format("h:mm A");

              return (
                <div
                  key={uniqueKey}
                  className={`chat ${isSender ? "chat-end" : "chat-start"}`}
                >
                  <div className="chat-image avatar">
                    <div className="w-10 rounded-full">
                      <img
                        src={
                          isSender
                            ? user.profilePic
                              ? user.profilePic.startsWith("http")
                                ? user.profilePic
                                : `https://social-fullstack-backend.onrender.com${user.profilePic}`
                              : man
                            : msg.senderId?.profilePic
                            ? msg.senderId.profilePic.startsWith("http")
                              ? msg.senderId.profilePic
                              : `https://social-fullstack-backend.onrender.com${msg.senderId.profilePic}`
                            : man
                        }
                        alt="User"
                      />
                    </div>
                  </div>

                  <div className="chat-header">
                    {/* {isSender ? "You" : msg?.senderId?.name || "User"} */}
                  </div>

                  <div
                    className={`chat-bubble ${
                      isSender
                        ? "bg-blue-500 text-white"
                        : "bg-gray-500 text-white"
                    }`}
                  >
                    {msg.message}
                  </div>

                  <div className="chat-footer flex justify-end py-1">
                    <time className="text-xs ml-2">{time}</time>
                    {isSender && (
                      <span className="text-sm flex items-center gap-1">
                        {msg.status === "seen" ? (
                          <CheckCheck size={18} className="text-blue-900" />
                        ) : msg.status === "delivered" ? (
                          <CheckCheck size={18} className="text-blue-500" />
                        ) : msg.status === "sent" ? (
                          <Check size={18} className="" />
                        ) : null}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        onSendMessage={sendMessage}
        chatId={chatId}
        senderId={user?._id}
      />
    </div>
  );
};

ChatWindow.propTypes = {
  selectedUser: PropTypes.object.isRequired,
};

export default ChatWindow;

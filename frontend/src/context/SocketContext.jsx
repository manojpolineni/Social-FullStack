import { createContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import PropTypes from "prop-types";

const SocketContext = createContext();

export const SocketProvider = ({ children, user }) => {
  const [notifications, setNotifications] = useState([]);
  const [socketReady, setSocketReady] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const socket = io("https://social-fullstack-backend.onrender.com", {
      transports: ["websocket"], // Force WebSocket only
      withCredentials: true,
      reconnection:true,
      reconnectionAttempts: 5, // Try reconnecting 5 times
      reconnectionDelay: 1000, // Wait 1 second between attempts
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      socket.emit("userOnline", user._id);
      setSocketReady(true);
    });

    socket.on("disconnect", (reason) => {
      console.log("🛑 Socket disconnected:", reason);
      setSocketReady(false);
    });

    socket.on("connect_error", (err) => {
      console.error("⚠️ Connection error:", err.message);
    });

    socket.on("newNotification", (notification) => {
      console.log("🔔 Received notification:", notification);
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      socket.off();
      socket.disconnect();
      setSocketReady(false);
    };
  }, [user]);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        socketReady,
        notifications,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
  user: PropTypes.object.isRequired,
};

export default SocketContext;

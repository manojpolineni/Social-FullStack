import { useState, useEffect } from "react";
import axios from "axios";

const useChat = (socket, userId) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (!userId) return;
    const fetchUsers = async () => {
      try {
        const res = await axios.get(
          "https://social-fullstack-backend.onrender.com/api/users",
          {
            withCredentials: true,
          }
        );
        console.log("respo", res.data.users);
        setUsers(res.data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [userId]);

  useEffect(() => {
    if (!socket || !userId) return;
    socket.emit("userOnline", userId);
    return () => {
      socket.emit("userOffline", userId);
    };
  }, [socket, userId]);
  return { users, selectedUser, setSelectedUser };
};

export default useChat;

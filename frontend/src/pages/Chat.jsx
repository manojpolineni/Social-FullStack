import { useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import useChat from "../components/useChat";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import AuthContext from "../context/AuthContext";
import axios from "axios";

const ChatPage = ({ socket }) => {
  const { user } = useContext(AuthContext);
  const { users, messages, sendUserMessage, selectedUser, setSelectedUser } =
    useChat(socket, user?._id);

  const [lastMessages, setLastMessages] = useState([]); 

  useEffect(() => {
    const savedUser = localStorage.getItem("selectedUser");
    if (savedUser && users.length > 0 && !selectedUser) {
      const parsedUser = JSON.parse(savedUser);
      const matchedUser = users.find((u) => u._id === parsedUser._id);
      if (matchedUser) {
        setSelectedUser(matchedUser);
      }
    }
  }, [users, selectedUser, setSelectedUser]);

  useEffect(() => {
    const fetchLastMessages = async () => {
      try {
        const res = await axios.get(
          "http://localhost:9999/api/messages/last-messages",
          {
            withCredentials: true,
          }
        );
        // console.log("last result", res.data.result);
        setLastMessages(res.data.result); 
      } catch (err) {
        console.error("❌ Error fetching last messages:", err);
      }
    };

    if (user?._id) fetchLastMessages();
  }, [user]);

  // console.log("last-messages", lastMessages);

  return (
    <div className="flex min-h-[650px] overflow-scroll">
      {!user ? (
        <div className="text-center p-4">Loading...</div>
      ) : (
        <>
          <ChatList
            users={users}
            lastMessages={lastMessages} // ✅ use this instead of calculating from messages
            currentUserId={user?._id}
            onSelectUser={(u) => {
              localStorage.setItem("selectedUser", JSON.stringify(u));
              setSelectedUser(u);
            }}
            selectedUser={selectedUser}
          />
          <div className="flex-1">
            {selectedUser ? (
              <ChatWindow
                messages={messages}
                sendMessage={sendUserMessage}
                selectedUser={selectedUser}
              />
            ) : (
              <div className="flex items-center justify-center h-full ">
                Select a user to start messaging
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

ChatPage.propTypes = {
  socket: PropTypes.object.isRequired,
};

export default ChatPage;

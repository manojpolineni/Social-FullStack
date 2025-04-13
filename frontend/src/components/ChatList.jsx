import PropTypes from "prop-types";

const ChatList = ({
  users,
  messages,
  lastMessages,
  onSelectUser,
  selectedUser,
  currentUserId,
}) => {
  const baseUrl = "https://social-fullstack-backend.onrender.com/";

  const getLastMessage = (userId) => {
    if (!lastMessages || !Array.isArray(lastMessages)) return null;

    return lastMessages.find((msg) => {
      const senderId = msg?.senderId?._id || msg?.senderId;
      const receiverId = msg?.receiverId?._id || msg?.receiverId;

      return (
        (senderId === currentUserId && receiverId === userId) ||
        (receiverId === currentUserId && senderId === userId)
      );
    });
  };

  const formatLastMessageTime = (dateString) => {
    const messageDate = new Date(dateString);
    const now = new Date();

    const isToday = messageDate.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = messageDate.toDateString() === yesterday.toDateString();

    if (isToday) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } else if (isYesterday) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString("en-GB"); // DD/MM/YYYY
    }
  };

  const getUnreadCount = (userId) => {
    if (!messages || messages.length === 0) return 0;

    return messages.filter(
      (msg) =>
        msg.senderId === userId &&
        msg.receiverId === currentUserId &&
        msg.status !== "seen"
    ).length;
  };

  return (
    <div className="w-[300px] p-3 inset-shadow-2xs">
      <h2 className="text-lg font-bold mb-4 pl-1">Users</h2>

      {!users || users.length === 0 ? (
        <p className=" animate-pulse">Loading users...</p>
      ) : (
        <ul>
          {users.map((user, index) => {
            const profilePic = user?.profilePic
              ? baseUrl + user.profilePic
              : null;

            const lastMsg = getLastMessage(user?._id);
            const unreadCount = getUnreadCount(user._id);
            const lastMsgTime = lastMsg?.createdAt
              ? formatLastMessageTime(lastMsg.createdAt)
              : "";

            return (
              <li
                key={index}
                className={`p-2 cursor-pointer flex gap-3 my-2 rounded-lg ${
                  selectedUser?._id === user._id ? " " : "hover:bg-gray-600 "
                }`}
                onClick={() => onSelectUser(user)}
              >
                <div className="relative w-12 h-12 rounded-full flex-shrink-0">
                  {profilePic ? (
                    <img
                      src={profilePic}
                      alt="Profile"
                      className="w-12 h-12 object-cover rounded-full"
                    />
                  ) : (
                    <span />
                  )}

                  {user.isOnline && (
                    <span className="absolute -top-0.5 right-1 w-3 h-3 bg-green-500 border rounded-full" />
                  )}
                </div>

                <div className="flex flex-col justify-center w-full">
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold capitalize truncate">
                      {user?.userName}
                    </p>
                    <div className="flex items-center gap-2">
                      {lastMsgTime && (
                        <p className="text-xs uppercase">
                          {lastMsgTime}
                        </p>
                      )}
                      {unreadCount > 0 && (
                        <div className="bg-red-500 text-xs font-semibold px-2 py-0.5 rounded-full">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 truncate max-w-[220px]">
                    {lastMsg?.messageType === "text" && lastMsg.message?.trim()
                      ? lastMsg.message
                      : lastMsg
                      ? ""
                      : ""}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

ChatList.propTypes = {
  users: PropTypes.array.isRequired,
  messages: PropTypes.array.isRequired,
  selectedUser: PropTypes.object,
  onSelectUser: PropTypes.func.isRequired,
  currentUserId: PropTypes.string.isRequired,
  lastMessages: PropTypes.array.isRequired,
};

export default ChatList;

// import { useSocket } from "../context/SocketContext";
import SocketContext from "../context/SocketContext";
import { X } from "lucide-react";
import PropTypes from 'prop-types';
import { useContext } from "react";

const Notifications = ({ toggleNotification }) => {
      const { notifications } = useContext(SocketContext);
      console.log("📢 Current Notifications:", notifications);

  return (
    <div className="w-80 bg-white shadow-md rounded-md p-4 text-black">
      {/* Close Button */}
      <button
        onClick={toggleNotification}
        className="absolute top-2 right-2 cursor-pointer text-gray-600 hover:text-red-500"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          🔔 Notifications ({notifications.length})
        </h2>
      </div>

      {/* Notification List */}
      <ul className="mt-3 space-y-2">
        {notifications.length === 0 ? (
          <li className="text-center text-gray-500">No notifications</li>
        ) : (
          notifications.map((notif, index) => (
            <li
              key={index}
              className="flex items-center p-2 bg-gray-100 rounded-md"
            >
              <img
                src={notif.userName}
                alt="User"
                className="w-8 h-8 rounded-full mr-3"
              />
              <div>
                <p className="text-sm">{notif.commentText}</p>
                <p className="text-xs text-gray-500">
                  {new Date(notif.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};
Notifications.propTypes = {
  toggleNotification: PropTypes.func.isRequired,
};

export default Notifications;

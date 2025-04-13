import PropTypes from "prop-types";
import {
  Menu,
  Sun,
  Moon,
  Bell,
  User,
  Image,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import man from "../assets/man.jpg";
import Notifications from "./Notification";
import { ThemeContext } from "../context/ThemeContext";

const Navbar = ({ toggleSidebar, username = "manoj chowdary" }) => {
  const { user } = useContext(AuthContext);
  const { userName, profilePic } = user || {};
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header
      className={`sticky shadow-md z-20 py-3 md:px-6 flex justify-between items-center md:transform md:duration-800 md:ease-in-out md:top-0 `}
    >
      {/* Menu button for mobile */}
      <button className="md:hidden" onClick={toggleSidebar}>
        <Menu size={30} />
      </button>

      {/* Welcome text with gradient username */}
      <h1 className="text-lg md:text-xl font-semibold capitalize">
        Welcome,
        <span className="pl-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
          {userName ? userName : username}
        </span>
      </h1>

      {/* Right Section */}
      <div className="flex justify-end items-center md:space-x-4">
        {/* Notification Icon */}
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 rounded-full border border-gray-300 cursor-pointer hover:scale-110 duration-150 ease-in-out transition flex justify-end "
        >
          <Bell size={22} />
        </button>

        {showNotifications && (
          <div className="absolute right-0 top-10 bg-white shadow-md rounded-md">
            <Notifications
              toggleNotification={() => setShowNotifications(false)}
            />
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="cursor-pointer border border-gray-300 p-2 rounded-full"
        >
          {theme === "light" ? <Moon size={22} /> : <Sun size={22} />}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative z-10 flex justify-center items-center">
          <button className={`w-11 h-11 cursor-pointer bg-white rounded-full `}>
            <img
              src={
                profilePic && profilePic.startsWith("http")
                  ? profilePic
                  : profilePic
                  ? `https://social-fullstack-backend.onrender.com${profilePic}`
                  : man
              }
              alt="Profile"
              className={`w-full h-full rounded-full object-cover ${
                user.isOnline ? " p-0.5 border-green-600 bg-gray-300 " : ""
              }`}
            />
            {user.isOnline && (
              <span className="top-0 start-8 absolute w-3 h-3 bg-green-500 rounded-full"></span>
            )}
          </button>
          <p className="capitalize pl-2 ">{user?.userName}</p>
          <span
            // onClick={() => setDropdownOpen(false)}
            className="cursor-pointer"
          >
            {!dropdownOpen ? (
              <ChevronDown
                size={20}
                className=" cursor-pointer transition-transform duration-500 ease-in-out  "
                onClick={() => setDropdownOpen(true)}
              />
            ) : (
              <ChevronUp
                size={20}
                className="cursor-pointer transition-transform duration-500 ease-in-out "
                onClick={() => setDropdownOpen(false)}
              />
            )}
          </span>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute top-14 right-0 md:py-5 lg:z-100 md:z-100 overflow-visible w-46 shadow-theme-lg rounded-md p-2 bg-gray-600 ">
              <Link
                to="/profile"
                className="flex items-center px-4 py-2  rounded hover:bg-gray-400 "
                onClick={toggleSidebar}
              >
                <User size={20} className="mr-2" /> Profile
              </Link>
              <Link
                to="/mypost"
                className="flex items-center px-4 py-2 hover:bg-gray-400"
              >
                <Image size={20} className="mr-2" /> My Posts
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

Navbar.propTypes = {
  toggleSidebar: PropTypes.func.isRequired,
  username: PropTypes.string,
};

export default Navbar;

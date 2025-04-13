import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import {
  X,
  LogOut,
  House,
  User,
  PlusCircle,
  MessageCircle,
  Settings,
} from "lucide-react";
import AuthContext from "../context/AuthContext";
import { useContext } from "react";

const Sidebar = ({ isOpen, toggleSidebar, onCreatePostClick }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/"); 
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Overlay (only visible when sidebar is open on mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black z-10 bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed inset-y-0 border-r px-2 border-gray-50 rounded-none pt-4 left-0 w-54 md:h-screen transition-transform duration-300 ease-in-out z-50
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:relative md:rounded-r md:border-gray-300`}
      >
        {/* Sidebar Header */}
        <div className="p-3 pt-2 flex justify-between items-center">
          <h2 className="text-2xl font-bold px-10 text-center">Social-X</h2>
          <button className="md:hidden text-white" onClick={toggleSidebar}>
            <X size={30} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="mt-4">
          <ul>
            <li className="p-4  cursor-pointer flex">
              <Link
                to="/"
                className="flex items-center cursor-pointer text-lg"
                onClick={toggleSidebar}
              >
                <House size={25} className="mr-2" /> Dashboard
              </Link>
            </li>
            <li className="p-4 cursor-pointer flex">
              <button
                onClick={() => navigate("/profile")} // ✅ Fixed navigate issue
                className="flex items-center cursor-pointer text-lg"
              >
                <User size={25} className="mr-2" /> Profile
              </button>
            </li>
            <li className="p-4  cursor-pointer flex">
              <button
                onClick={onCreatePostClick}
                className="flex items-center cursor-pointer text-lg"
              >
                <PlusCircle size={25} className="mr-3" /> Create Post
              </button>
            </li>
            <li className="p-4  cursor-pointer flex">
              <Link
                to="/chat"
                className="flex items-center cursor-pointer text-lg"
                onClick={toggleSidebar}
              >
                <MessageCircle size={25} className="mr-3" /> Messages
              </Link>
            </li>
            <li className="p-4 cursor-pointer flex">
              <Link
                to="/settings"
                className="flex items-center cursor-pointer text-lg"
                onClick={toggleSidebar}
              >
                <Settings size={25} className="mr-2" /> Settings
              </Link>
            </li>
          </ul>
        </nav>

        {/* Logout Button */}
        <button
          className="absolute bottom-5 cursor-pointer left-2 flex items-center px-10 py-2 "
          onClick={handleLogout}
        >
          <LogOut size={30} className="pr-2 " /> Logout
        </button>
      </div>
    </>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
  onCreatePostClick: PropTypes.func.isRequired,
};

export default Sidebar;

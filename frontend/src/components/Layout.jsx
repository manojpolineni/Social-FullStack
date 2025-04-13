import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useState } from "react";
import CreatePost from "./CreatePost";

const Layout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPostOpen, setIsPostOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={`flex h-screen overflow-hidden `}
    >
      {/* Sidebar should always be visible on desktop */}
      <div
        className={`transition-transform duration-300 ease-in-out ${
          isOpen ? "w-64" : "w-0"
        } md:w-54`}
      >
        <Sidebar
          isOpen={isOpen}
          toggleSidebar={toggleSidebar}
          onCreatePostClick={() => setIsPostOpen(true)}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        <Navbar toggleSidebar={toggleSidebar} />
        <main
          className={`overflow-y-auto md:overflow-x-hidden w-full `}
        >
          <Outlet />
        </main>
      </div>
      {/* Create Post Popup */}
      <CreatePost
        isOpen={isPostOpen}
        onClose={() => setIsPostOpen(false)}
        onPostCreated={(post) => console.log("New post:", post)}
      />
    </div>
  );
};

export default Layout;

import { useState, createContext, useEffect } from "react";
import Auth from "../services/api";
import PropTypes from "prop-types";
import { io } from "socket.io-client";

const UsePostContext = createContext();

export const socket = io("https://social-fullstack-backend.onrender.com", {
  autoConnect: false,
});

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [userPosts, setUsersPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user"))
  );
  const [notifications, setNotifications] = useState([]);

  const fetchPosts = async () => {
    if (posts.length > 0) return;
    try {
      const res = await Auth.get("/post");
      setPosts([...res.data].sort((a, b) => b.createdAt - a.createdAt));
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("❌ Error fetching posts:", error);
    }
  };

  const fetchMyPosts = async () => {
    try {
      setLoading(true);
      const res = await Auth.get("/post/user");
      setUsersPosts(res.data.posts);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPosts();
      fetchMyPosts();
    }
  }, [user]);

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(JSON.parse(localStorage.getItem("user")));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    socket.on("newPost", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      if (notification.post) {
        setPosts((prevPosts) => [notification.post, ...prevPosts]);
      }
    });

    return () => {
      socket.off("newPost");
    };
  }, []);

  const updatePost = (updatedPost) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === updatedPost._id
          ? { ...post, comments: updatedPost.comments }
          : post
      )
    );
  };

  const handleDeletePost = (postId) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
  };

  useEffect(() => {
    if (user) {
      socket.connect();
    }

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return (
    <UsePostContext.Provider
      value={{
        posts,
        loading,
        userPosts,
        setUsersPosts,
        setPosts,
        updatePost,
        fetchPosts,
        notifications,
        handleDeletePost,
      }}
    >
      {children}
    </UsePostContext.Provider>
  );
};

PostProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default UsePostContext;

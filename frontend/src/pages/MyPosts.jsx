import { useContext } from "react";
import axios from "axios";
import PostCard from "../components/PostCard";
import UsePostContext from "../context/PostContext";

const MyPosts = () => {
  const { userPosts, loading, setUsersPosts } = useContext(UsePostContext);

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`http://localhost:9999/api/post/${postId}`, {
        withCredentials: true,
      });
      setUsersPosts((prev) => prev.filter((post) => post._id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  return (
    <div className="ml-5 pt-5">
      <h2 className="text-2xl font-bold mb-4">My Posts</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 lg:mx-5 gap-4 items-start">
        {userPosts.length > 0 ? (
          userPosts.map((post, index) => (
            <PostCard
              key={index}
              post={post}
              onDelete={handleDelete}
              isMyPost={true}
            />
          ))
        ) : loading ? (
          <p className="text-gray-500 animate-pulse duration-100 ease-in-out ">
            Loading....
          </p>
        ) : (
          <p className="text-gray-500">No posts available Please Create Post</p>
        )}
      </div>
    </div>
  );
};

export default MyPosts;

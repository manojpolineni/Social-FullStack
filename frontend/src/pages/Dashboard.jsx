import { useContext, useState, useEffect } from "react";
import CreatePostPopup from "../components/CreatePost";
import PostCard from "../components/PostCard";
import UsePostContext from "../context/PostContext";
import AllUsers from "../components/AllUsers";

const Dashboard = () => {
  const { posts = [],fetchPosts, loading, handleDeletePost } = useContext(UsePostContext);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (posts.length === 0) {
      fetchPosts();
    }
  }, [posts, fetchPosts]);

  if(loading) return <h4 className="flex justify-center mt-20 items-center text-xl animate-pulse ">Loading....</h4>

  return (
    <>
     
      <div className=" flex">
        <h1 className="text-2xl font-bold  px-6 pt-5">Dashboard</h1>
        <div className="my-2">
          <AllUsers/>
        </div>
        {isOpen && (
          <CreatePostPopup isOpen={isOpen} onClose={() => setIsOpen(false)} />
        )}
      </div>
      <div className="flex flex-col md:flex-row md:flex-wrap justify-center md:justify-evenly items-start gap-6 p-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post._id} post={post} onDelete={handleDeletePost} loading={loading} isMyPost={false}/>
          ))
        ) : (
          <p className="text-gray-500 text-center w-full">No posts available</p>
        )}
      </div>
    </>
  );
};

export default Dashboard;

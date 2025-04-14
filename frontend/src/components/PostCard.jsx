import { useContext, useEffect, useRef, useState } from "react";
import { Heart, MessageCircle, Send, Ellipsis } from "lucide-react";
import PropTypes from "prop-types";
import Auth from "../services/api";
import moment from "moment";
import CommentSection from "./Comment";
import UsePostContext from "../context/PostContext";
import AuthContext from "../context/AuthContext.jsx";
import { followUser, unfollowUser } from "../services/api";

const PostCard = ({ post, isMyPost, onDelete, loading }) => {
  const { updatePost } = useContext(UsePostContext);
  const [likes, setLikes] = useState(post?.likes?.length || 0);
  const [liked, setLiked] = useState(false);
  const [timeAgo, setTimeAgo] = useState("");
  const [isMuted, setIsMuted] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const { user, fetchUser } = useContext(AuthContext);
  const [isFollowing, setIsFollowing] = useState(false);
  const [hover, setHover] = useState(false);

  const id = post._id;

  useEffect(() => {
    if (user?.following && post?.user?._id) {
      const isUserFollowing = user.following.some(
        (followedUser) =>
          followedUser._id?.toString() === post.user._id?.toString()
      );
      setIsFollowing(isUserFollowing);
    }
  }, [user, post]);

  const handleFollowUnfollow = async (userId) => {
    if (!userId) return;

    setIsFollowing((prev) => !prev);

    try {
      if (isFollowing) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }

      fetchUser();
    } catch (error) {
      console.error("❌ Error updating follow status:", error);
    }
  };

  const handleCommentAdded = (newComment) => {
    const updatedComments = [newComment, ...comments];
    setComments(updatedComments);
    updatePost({ ...post, comments: [newComment, ...post.comments] });
  };

  const baseUrl = "https://social-fullstack-backend.onrender.com";
  const userPic = baseUrl + post.user.profilePic;

  const videoRef = useRef(null);
  const observerRef = useRef(null);

  const handleLike = async () => {
    if (liked) {
      setLikes((prev) => prev - 1);
    } else {
      setLikes((prev) => prev + 1);
    }
    setLiked(!liked);
    try {
      const response = await Auth.post(`/post/like/${post._id}`);
      if (response.data.success) {
        setLikes(liked ? likes - 1 : likes + 1);
        setLiked(!liked);
        updatePost({ ...post, likes: response.data.likes });
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  useEffect(() => {
    const updateTime = () => {
      let duration = moment.duration(moment().diff(moment(post.createdAt)));

      if (duration.asMinutes() < 60) {
        setTimeAgo(`${Math.floor(duration.asMinutes())} minutes ago`);
      } else if (duration.asHours() < 24) {
        setTimeAgo(`${Math.floor(duration.asHours())} hours ago`);
      } else {
        setTimeAgo(`${Math.floor(duration.asDays())} days ago`);
      }
    };
    updateTime();

    const interval = setInterval(updateTime, 600000);
    return () => clearInterval(interval);
  }, [post.createdAt]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoElement
            .play()
            .catch((err) => console.log("Autoplay Blocked", err));
        } else {
          videoElement.pause();
        }
      },
      { threshold: 0.7 }
    );

    observer.observe(videoElement);
    observerRef.current = observer;

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  const toggleSound = () => {
    if (videoRef.current) {
      setIsMuted(!isMuted);
      videoRef.current.muted = isMuted;
    }
  };
  useEffect(() => { }, [post]);
  
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";

    const backendBase = "https://social-fullstack-backend.onrender.com";

    if (imagePath.startsWith("http")) {
      return imagePath.replace("http://localhost:9999", backendBase);
    }

    return `${backendBase}/postUploads/${imagePath}`;
  };

  if (loading)
    return <h4 className="text-xl font-semibold">Loading posts...</h4>;

  return (
    <div className=" border-gray-200 shadow-xl rounded-lg mb-4 w-full max-w-md relative ">
      {/* Title */}

      {/* Image or Video */}
      {post.image && (
        <img
          src={getImageUrl(post.image)}
          alt="Post"
          className="w-full rounded-lg"
        />
      )}
      {post.video && (
        <div className="relative">
          <video
            ref={videoRef}
            src={post.video}
            className="w-full h-auto object-cover rounded-lg my-2"
            muted={isMuted}
            playsInline
            loop
            preload="auto"
          />
          <button
            onClick={toggleSound}
            className="absolute bottom-2 right-2 bg-opacity-50 p-1 rounded-full"
          >
            {isMuted ? "🔇" : "🔊"}
          </button>
        </div>
      )}
      <div className="flex justify-start items-center py-3 px-3 ">
        <div className="flex items-center space-x-1 absolute left-2 top-3">
          <img
            src={userPic}
            alt="Profile"
            className={`w-9 h-9 border-2 p-0.5 object-cover cursor-pointer rounded-full ${
              post.user.isOnline ? " border-green-600" : "border-amber-700"
            }`}
          />
          <div
            className="flex flex-col justify-between text-base font-semibold
          "
          >
            <span className="text-base capitalize hover:text-red-400 cursor-pointer">
              {post?.user?.userName}
            </span>
          </div>
        </div>
        {!isMyPost && (
          <div className="absolute top-3 right-3">
            {user?._id !== post.user._id && (
              <button
                onClick={() => handleFollowUnfollow(post.user._id)}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                className={`px-3 py-1.5 rounded-lg text-sm w-24 cursor-pointer ease-in-out transition-all duration-500 tracking-wider
                  ${
                    isFollowing
                      ? "bg-blue-400 text-white border"
                      : "bg-blue-400 text-white border-none"
                  }
                    ${
                      hover && isFollowing
                        ? "bg-gray-600 text-white border-none "
                        : ""
                    }
                  `}
              >
                {isFollowing ? (hover ? "Unfollow" : "Following") : "Follow"}
              </button>
            )}
          </div>
        )}
        <div className="flex justify-start items-center space-x-2 md:space-x-3 relative">
          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={user._id === post.user._id}
            className="flex items-center cursor-pointer space-x-1"
          >
            <Heart size={23} className={liked ? "text-red-500" : ""} />
            <span>
              {likes} {post.likes.includes(user._id) ? "Unlike" : "Like"}
            </span>
          </button>

          {/* Comment Button */}
          <div className="flex justify-start items-center px-3 py-2">
            <button
              onClick={() => setShowComments(true)}
              className="flex items-center space-x-1 cursor-pointer"
            >
              <MessageCircle size={23} className="text-gray" />
              <span>{comments.length}</span>
            </button>
          </div>

          {showComments && (
            <CommentSection
              postId={post._id}
              comments={comments}
              setComments={setComments}
              onClose={() => setShowComments(false)}
              onCommentAdded={handleCommentAdded}
            />
          )}

          {/* Share Button */}
          <button className="flex items-center space-x-1 cursor-pointer">
            <Send size={23} className="" />
          </button>
        </div>
        <div className="absolute right-3 bottom-46.5 ">
          {/* Ellipsis Dropdown Button */}
          {isMyPost && (
            <div
              className=" absolute right-0"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button className="flex items-center">
                <Ellipsis size={26} className=" cursor-pointer rotate-90" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-6 bg-white shadow-lg rounded-md w-28 cursor-pointer ">
                  <button
                    onClick={() => onDelete(id)}
                    className="text-sm px-4 py-2 w-full text-left hover:bg-gray-100 cursor-pointer "
                  >
                    Delete Post
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* </div> */}
      <div className="flex flex-col px-3 pb-5 overflow-ellipsis ">
        <p className="text-sm text-gray capitalize">
          {post.likes.length > 0 ? (
            <>
              {post.likes.length > 2 ? (
                <>
                  Liked by <b>{post.likes[0]?.userName}</b>,{" "}
                  <b>{post.likes[1]?.userName}</b> and {post.likes.length - 2}{" "}
                  others
                </>
              ) : (
                <>
                  Liked by{" "}
                  {post.likes.map((user, index) => (
                    <b key={index}>
                      {user?.userName}
                      {index !== post.likes.length - 1 ? ", " : ""}
                    </b>
                  ))}
                </>
              )}
            </>
          ) : (
            "No likes yet"
          )}
        </p>
        <h2 className="font-bold text-gray text-lg mb-1 capitalize ">
          {post.title}
        </h2>
        <p className="text-gray ">{post.text}</p>
        <p className=" text-gray text-sm my-1">{post.caption}</p>
        <span className="text-gray text-sm ">{timeAgo}</span>
      </div>
    </div>
  );
};

PostCard.propTypes = {
  post: PropTypes.shape({
    title: PropTypes.string,
    image: PropTypes.string,
    video: PropTypes.string,
    caption: PropTypes.string,
    likes: PropTypes.array,
    comments: PropTypes.array,
    _id: PropTypes.string,
    createdAt: PropTypes.string,
    text: PropTypes.string,
    user: PropTypes.shape({
      userName: PropTypes.string,
      profilePic: PropTypes.string,
      isOnline: PropTypes.Boolean,
      followers: PropTypes.arrayOf(PropTypes.string),
      _id: PropTypes.string,
    }),
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  isMyPost: PropTypes.Boolean,
  loading: PropTypes.Boolean,
};

export default PostCard;

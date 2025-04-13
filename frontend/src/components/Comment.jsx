import { useState, useEffect, useRef, useContext } from "react";
import PropTypes from "prop-types";
import { X, Trash, SendHorizontal, Send } from "lucide-react";
import moment from "moment";
import Auth from "../services/api";
import EmojiPicker from "emoji-picker-react";
import AuthContext from '../context/AuthContext';

const CommentSection = ({
  postId,
  comments = [],
  setComments,
  onClose,
  onCommentAdded,
}) => {
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const inputRef = useRef(null);
  const { user } = useContext(AuthContext);

  const handleEmojiSelect = (emoji) => {
    setNewComment((prev) => prev + emoji.emoji);
    setShowPicker(false);
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || loading) return;
    setLoading(true);

    try {
      const res = await Auth.post(`/post/comment/${postId}`, {
        text: newComment,
      });

      const newCommentData = {
        _id: res.data.comment._id,
        text: res.data.comment.text,
        createdAt: res.data.comment.createdAt || new Date().toISOString(),
        user: res.data.comment.user,
      };

      setComments((prevComments) => [newCommentData, ...prevComments]); 
      onCommentAdded(newCommentData); 
      setNewComment("");

    } catch (error) {
      console.error("Error adding comment:", error);
    }
    setLoading(false);

  };

  // Handle deleting a comment
  const handleDeleteComment = async (commentId) => {
    try {
      await Auth.delete(`/post/${postId}/comments/${commentId}`);
      setComments((prev) =>
        prev.filter((comment) => comment._id !== commentId)
      );
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  useEffect(() => {
    inputRef.current.focus();
  }, [comments]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-5 bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-[450px] h-1/2 left-33.5 rounded-lg p-4 shadow-lg relative transform transition-all duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-1 right-1 text-black text-2xl"
        >
          <X size={25} className="cursor-pointer " />
        </button>

        {/* Comments List */}
        <div className="overflow-y-auto h-3/4 px-2">
          {comments.length > 0 ? (
            comments
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((comment, index) => (
                <div
                  key={index}
                  className="bg-gray-100 px-3 py-3 rounded-md shadow-sm mb-2 flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm text-gray-800 capitalize font-semibold">
                      {comment?.text || "No text available"}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {moment(comment.createdAt)
                        .local()
                        .format("DD-MM-YY hh:mm A")}
                    </p>
                  </div>
                  {comment?.user?._id === user?._id && (
                    <button onClick={() => handleDeleteComment(comment._id)}>
                      <Trash
                        size={16}
                        className="text-red-500 cursor-pointer"
                      />
                    </button>
                  )}
                </div>
              ))
          ) : (
            <p className="text-gray-500 text-sm text-center mt-4">
              No comments yet
            </p>
          )}
        </div>

        {/* Input Field */}
        <div className="flex items-center p-2 border-t w-full absolute bottom-2 left-0">
          <input
            type="text"
            ref={inputRef}
            className="flex-1 p-2 border border-gray-300 rounded-full w-full"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !loading && handleCommentSubmit()
            }
          />
          <button
            className="ml-2 cursor-pointer text-xl"
            onClick={() => setShowPicker(!showPicker)}
          >
            😀
          </button>
          {showPicker && (
            <div className="absolute bottom-10 right-10 bg-white border shadow-lg z-10">
              <EmojiPicker onEmojiClick={handleEmojiSelect} />
            </div>
          )}
          {newComment.trim("").length > 0 && (
            <button
              onClick={handleCommentSubmit}
              className={`bg-blue-500 text-white rounded-full duration-300 ease-in-out px-2 py-2 cursor-pointer ml-2 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? <Send size={20} className=" animate-pulse duration-300 ease-linear "/> : <SendHorizontal size={20} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

CommentSection.propTypes = {
  postId: PropTypes.string.isRequired,
  comments: PropTypes.array.isRequired,
  setComments: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onCommentAdded: PropTypes.func.isRequired,
};

export default CommentSection;

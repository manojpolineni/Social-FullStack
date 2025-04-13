import { useState, useContext } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import AuthContext from "../context/AuthContext";
// import Auth from "../services/api";

const CreatePost = ({ isOpen, onClose, onPostCreated }) => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    title: "",
    text: "",
    caption: "",
  });
  const [imageFile, setImage] = useState(null);
  const [videoFile, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null; 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (e.target.name === "image") setImage(file);
    if (e.target.name === "video") setVideo(file);
    console.log("files", file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to create a post.");
      return;
    }

    setLoading(true);
    setError(null);

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("caption", formData.caption);
    formDataToSend.append("text", formData.text);
    if (imageFile) formDataToSend.append("image", imageFile);
    if (videoFile) formDataToSend.append("video", videoFile);

    // console.log("postdata", formData.text);
    
    try {
      const res = await axios.post(
        "http://localhost:9999/api/post",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true, 
        }
      );
      console.log("post res", res.data);

      setFormData({ title: "", text: "", caption: "" });
      setImage(null);
      setVideo(null);
      setLoading(false);
      onPostCreated(res.data.post);
      onClose();
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create post.");
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-50"
      onClick={onClose} // Close when clicking outside
    >
      <div
        className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-2xl border border-white/20 w-full max-w-lg relative text-white"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute cursor-pointer text-4xl top-3 right-3 text-gray-100"
        >
          ✖
        </button>

        <h2 className="text-xl font-semibold mb-4">Create a Post</h2>
        {error && <p className="text-red-500">{error}</p>}

        <form
          onSubmit={handleSubmit}
          className="space-y-3"
          encType="multipart/form-data"
        >
          <input
            type="text"
            name="title"
            placeholder="Title"
            className="w-full p-2 border rounded"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <textarea
            name="text"
            placeholder="What's on your mind?"
            className="w-full p-2 border rounded"
            value={formData.text}
            onChange={handleChange}
          ></textarea>
          <input
            type="text"
            name="caption"
            placeholder="Caption (optional)"
            className="w-full p-2 border rounded"
            value={formData.caption}
            onChange={handleChange}
          />
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
          />
          <input
            type="file"
            name="video"
            accept="video/*"
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
          />

          {/* Buttons */}
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 cursor-pointer rounded mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white cursor-pointer rounded"
              disabled={loading}
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

CreatePost.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onPostCreated: PropTypes.func.isRequired,
};

export default CreatePost;

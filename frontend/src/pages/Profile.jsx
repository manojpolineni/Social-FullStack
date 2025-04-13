import { useContext, useState, useEffect } from "react";
import AuthContext from "../context/AuthContext";
import { useForm } from "react-hook-form";
import uploadProfilePic from "../components/UploadProfilePic.jsx";
import Auth from "../services/api.js";
import man from "../assets/man.jpg";
import UsePostContext from "../context/PostContext.jsx";

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const { register, handleSubmit, setValue, watch } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isChanged, setIsChanged] = useState(false);
  const { userPosts } = useContext(UsePostContext);

  const { followers, following } = user;
  let { _id } = user;
  let id = _id;

  const watchedFields = watch();

  useEffect(() => {
    const isDataChanged = Object.keys(watchedFields).some(
      (key) => watchedFields[key] !== user[key]
    );
    setIsChanged(isDataChanged);
  }, [watchedFields, user]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      console.log("No file selected");
      return;
    }
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleUpload = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const updatedUser = await uploadProfilePic(file);
      setUser(updatedUser);
      setSuccess("Profile picture uploaded successfully!");
      setPreview(null);
    } catch (err) {
      setError(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      Object.keys(user).forEach((key) => setValue(key, user[key]));
    }
  }, [user, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    setSuccess("");

    const isDataChanged = Object.keys(data).some(
      (key) => data[key] !== user[key]
    );

    if (!isDataChanged) {
      setLoading(false);
      setError("No changes detected.");
      return;
    }

    try {
      const response = await Auth.patch(`/users/${id}`, data, {
        withCredentials: true,
      });
      setUser(response.data.updatedUser);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex justify-center lg:w-[97.5%] rounded-2xl shadow-2xl items-center min-h-screen md:m-4 lg:m-4 ">
      <div className="p-8 rounded-2xl w-full max-w-full shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Profile</h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          encType="multipart/form-data"
        >
          <div className="flex justify-center mb-6 hover:bg-border-effect ">
            <img
              src={
                preview ||
                (user.profilePic
                  ? `https://social-fullstack-backend.onrender.com${user.profilePic}`
                  : man)
              }
              alt="Profile"
              className="w-32 h-32 rounded-full border hover:bg-border-effect object-cover"
            />
          </div>
          <div className="flex justify-center mb-6">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="fileInput"
            />
            <label
              htmlFor="fileInput"
              className="mt-2 bg-blue-500 mr-5 text-white py-1 px-4 cursor-pointer rounded-lg hover:bg-blue-600 transition duration-200"
            >
              {file ? "File Selected" : "Add File"}
            </label>

            {error && <p className="text-red-500 mt-2">{error}</p>}
            {success && <p className="text-green-500 mt-2">{success}</p>}
            {file && (
              <button
                onClick={handleUpload}
                className="mt-2 bg-green-500 text-white py-1 px-4 cursor-pointer rounded-lg hover:bg-green-600 transition duration-200"
                disabled={loading}
              >
                {loading ? "Uploading..." : "Upload"}
              </button>
            )}
          </div>
          <div className="flex flex-col justify-between items-center border-gray-100 border-1 rounded-xl ">
            <div className="flex my-3">
              <p className="flex flex-col justify-between items-center text-base font-medium mx-5 ">
                {userPosts?.length} <span>Posts</span>
              </p>
              <p className="flex flex-col justify-between items-center text-base font-medium mx-5 ">
                {followers?.length} <span>followers</span>
              </p>
              <p className="flex flex-col justify-between items-center text-base font-medium mx-5">
                {following?.length} <span>followings</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block ">User Name</label>
              <input
                type="text"
                {...register("userName", { required: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg capitalize focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block ">Nickname</label>
              <input
                type="text"
                {...register("nickName")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block ">Age</label>
              <input
                type="number"
                {...register("age")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block ">Phone</label>
              <input
                type="text"
                {...register("phone")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block ">Email</label>
              <input
                type="email"
                {...register("email", { required: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block ">Gender</label>
              <select
                {...register("gender")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block ">Bio</label>
              <textarea
                {...register("bio")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block ">Village</label>
              <input
                type="text"
                {...register("village")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block ">City</label>
              <input
                type="text"
                {...register("city")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block ">State</label>
              <input
                type="text"
                {...register("state")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block ">Country</label>
              <input
                type="text"
                {...register("country")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block ">Pincode</label>
              <input
                type="text"
                {...register("pincode")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block ">Language</label>
              <input
                type="text"
                {...register("language")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          {isChanged && (
            <div className="group relative inline-block rounded-xl p-[2px] transition-all duration-300 border-effect">
              <button
                type="submit"
                className="w-auto lg:w-full mx-auto lg:justify-center flex justify-between items-center  hover:bg-border-effect py-2 px-4 hover:bg-gray-900 hover:text-gray-100 rounded-lg cursor-pointer transition duration-200 group-hover:shadow-md"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Profile"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;

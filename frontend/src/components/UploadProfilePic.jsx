import Auth from "../services/api";

const uploadProfilePic = async (file) => {
  if (!file) {
    console.error(" No file selected!");
    throw new Error("Please select a file before uploading.");
  }
  const formData = new FormData();
  formData.append("profilePic", file);

  for (let pair of formData.entries()) {
    console.log("FormData:", pair[0], pair[1]);
  }
  try {
    const response = await Auth.post(`/uploads/profile`,formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data.updatedUser;
  } catch (err) {
    console.error(" Upload Error:", err);
    throw new Error(err.response?.data?.message || "Something went wrong");
  }
};

export default uploadProfilePic;

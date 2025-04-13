import User from "../models/User.js";

export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const fileUrl = `/uploads/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: fileUrl },
      { new: true }
    );

    res.status(200).json({ message: "Profile pic updated!", updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const uploadVideo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.videos.push(`/uploads/${req.file.filename}`);
    await user.save();

    res.json({ videoUrl: `/uploads/${req.file.filename}` });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteVideo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.videos = user.videos.filter(
      (v) => v !== `/uploads/${req.params.filename}`
    );
    await user.save();

    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

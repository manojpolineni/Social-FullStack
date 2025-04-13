import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    nickName: { type: String },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    age: { type: Number },
    gender: {
      type: String,
      enum: ["male", "female", "other"], 
    },
    bio: { type: String, default: "" },
    profilePic: { type: String, default: "" },
    videos: [{ type: String }],
    isOnline: { type: Boolean, default: false },
    village: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    pincode: { type: Number },
    language: { type: [String], default: ["Telugu", "Hindi", "English"] },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }]
  },
  { timestamps: true }
);

// 🔹 Indexing for Faster Queries
UserSchema.index({ email: 1 }, { unique: true }); // Ensure email uniqueness
UserSchema.index({ role: 1 });

export default mongoose.model("User", UserSchema);

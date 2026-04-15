import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true // ✅ ADD
    },

    email: {
      type: String,
      required: true, // ✅ ADD
      unique: true,   // ✅ ADD (duplicate users avoid)
      lowercase: true // ✅ ADD
    },

    password: {
      type: String,
      required: true // ✅ ADD
    }
  },
  {
    timestamps: true // ✅ ADD (optional but useful)
  }
);

// prevent overwrite error (same pattern as others) ✅
const User =
  mongoose.models.User ||
  mongoose.model("User", userSchema);

export default User;
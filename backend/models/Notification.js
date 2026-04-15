import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true // ✅ ADD (VERY IMPORTANT)
    }, // owner ki

    message: {
      type: String,
      required: true // ✅ ADD
    },

    read: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// prevent overwrite error (important for dev reloads) ✅
const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

export default Notification;
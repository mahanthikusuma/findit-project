import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true // ✅ ADD (important for validation)
    },
    category: String,
    place: String,
    img: {
      type: String,
      default: "" // ✅ ADD (avoid undefined issues)
    },
    loc: String,
    date: String,
    type: {
      type: String,
      required: true // ✅ ADD (important)
    },
    phone: String,

    // IMPORTANT (unchanged but fixed usage)
    postedBy: String,

    userId: {
      type: String,
      required: true // ✅ ADD (VERY IMPORTANT)
    },

    // ✅ ADD (needed for claim accept flow)
    status: {
      type: String,
      default: "active"
    }
  },
  {
    timestamps: true
  }
);

// prevent overwrite error (unchanged ✅)
const Item = mongoose.models.Item || mongoose.model("Item", itemSchema);

export default Item;
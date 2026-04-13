import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    name: String,
    category: String,
    place: String,
    img: String,
    loc: String,
    date: String,
    type: String,
    phone: String,

    // IMPORTANT
    postedBy: String,
    userId: String
  },
  {
    timestamps: true
  }
);

// prevent overwrite error
const Item = mongoose.models.Item || mongoose.model("Item", itemSchema);

export default Item;
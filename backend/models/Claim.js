import mongoose from "mongoose";

const claimSchema = new mongoose.Schema(
  {
    itemId: {
      type: String,
      required: true // ✅ ADD (important)
    },
    itemName: String,

    ownerId: {
      type: String,
      required: true // ✅ ADD
    },

    userId: {
      type: String,
      required: true // ✅ ADD
    },

    name: {
      type: String,
      required: true // ✅ ADD
    },

    phone: String,
    proof: String,

    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending"
    }
  },
  {
    timestamps: true
  }
);

// prevent overwrite error (unchanged ✅)
const Claim = mongoose.models.Claim || mongoose.model("Claim", claimSchema);

export default Claim;
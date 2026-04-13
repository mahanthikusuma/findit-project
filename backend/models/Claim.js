import mongoose from "mongoose";

const claimSchema = new mongoose.Schema(
  {
    itemId: String,
    itemName: String,
    ownerId: String,
    userId: String,

    name: String,
    phone: String,
    proof: String,

    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"], // 👈 added
      default: "Pending"
    }
  },
  {
    timestamps: true
  }
);

const Claim = mongoose.models.Claim || mongoose.model("Claim", claimSchema);

export default Claim;
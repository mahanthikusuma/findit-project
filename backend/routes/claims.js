import express from "express";
import Claim from "../models/Claim.js";
import Item from "../models/Item.js";
import Notification from "../models/Notification.js";

const router = express.Router();

// ================= CREATE CLAIM =================
router.post("/", async (req, res) => {
  try {
    console.log("BODY 👉", req.body);

    const {
      itemId,
      userId,
      claimantName,
      claimantPhone,
      proof
    } = req.body;

    if (!itemId || !userId) {
      return res.status(400).json({
        error: "Missing required fields"
      });
    }

    const item = await Item.findById(itemId);

    console.log("FOUND ITEM 👉", item);

    if (!item) {
      return res.status(404).json({
        error: "Item not found"
      });
    }

    const claim = new Claim({
      itemId: item._id,
      itemName: item.name,
      ownerId: String(item.userId), // ✅ FIX
      userId: String(userId),       // ✅ FIX
      name: claimantName,
      phone: claimantPhone,
      proof,
      status: "Pending"
    });

    await claim.save();

    console.log("✅ CLAIM SAVED");

    // 🔔 NOTIFICATION FIX
    await Notification.create({
      userId: String(item.userId), // ✅ MAIN FIX
      message: `📩 New claim for "${item.name}"`
    });

    console.log("🔔 NOTIFICATION CREATED");

    res.status(201).json({
      message: "Claim submitted successfully",
      claim
    });

  } catch (err) {
    console.log("❌ CLAIM ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


// ================= GET CLAIMS BY OWNER =================
router.get("/:ownerId", async (req, res) => {
  try {
    const claims = await Claim.find({
      ownerId: String(req.params.ownerId) // ✅ FIX
    }).sort({ createdAt: -1 });

    res.json(claims);

  } catch (err) {
    console.log("❌ GET CLAIM ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


// ================= ACCEPT CLAIM =================
router.put("/accept/:id", async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({ error: "Claim not found" });
    }

    // ✅ Update claim status
    claim.status = "Accepted";
    await claim.save();

    const updatedItem = await Item.findByIdAndUpdate(
      claim.itemId,
      { status: "returned" },
      { new: true }
    );

    console.log("UPDATED ITEM 👉", updatedItem);

    // 🔔 notify claimant
    await Notification.create({
      userId: String(claim.userId), // ✅ FIX
      message: `🎉 Your claim for "${claim.itemName}" is accepted`
    });

    res.json({
      message: "Accepted & Item Returned",
      item: updatedItem
    });

  } catch (err) {
    console.log("❌ ACCEPT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


// ================= REJECT CLAIM =================
router.put("/reject/:id", async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({ error: "Claim not found" });
    }

    claim.status = "Rejected";
    await claim.save();

    await Notification.create({
      userId: String(claim.userId), // ✅ FIX
      message: `❌ Your claim for "${claim.itemName}" was rejected`
    });

    res.json({ message: "Rejected" });

  } catch (err) {
    console.log("❌ REJECT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
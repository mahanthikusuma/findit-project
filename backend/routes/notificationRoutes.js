import express from "express";
import Notification from "../models/Notification.js";

const router = express.Router();

// ✅ GET notifications
router.get("/:userId", async (req, res) => {
  try {
    console.log("🔍 FETCH NOTIFICATIONS FOR:", req.params.userId); // ✅ DEBUG

    const data = await Notification.find({
      userId: String(req.params.userId) // ✅ MAIN FIX
    }).sort({ createdAt: -1 });

    console.log("🔔 NOTIFICATIONS FOUND:", data); // ✅ DEBUG

    res.json(data || []);

  } catch (err) {
    console.log("❌ GET NOTIFICATION ERROR:", err);
    res.status(500).json([]);
  }
});

// ✅ MARK AS READ
router.put("/read/:id", async (req, res) => {
  try {
    const updated = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    console.log("✅ MARKED AS READ:", updated); // ✅ DEBUG

    res.json({ message: "Marked as read" });

  } catch (err) {
    console.log("❌ READ ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE ALL
router.delete("/:userId", async (req, res) => {
  try {
    const result = await Notification.deleteMany({
      userId: String(req.params.userId) // ✅ FIX
    });

    console.log("🗑️ DELETED COUNT:", result.deletedCount); // ✅ DEBUG

    res.json({ message: "All cleared" });

  } catch (err) {
    console.log("❌ DELETE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
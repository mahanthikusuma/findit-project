import express from "express";
import Notification from "../models/Notification.js";

const router = express.Router();

// ✅ GET notifications
router.get("/:userId", async (req, res) => {
  try {
    const data = await Notification.find({
      userId: req.params.userId
    }).sort({ createdAt: -1 });

    res.json(data || []);

  } catch (err) {
    console.log(err);
    res.status(500).json([]);
  }
});

// ✅ MARK AS READ
router.put("/read/:id", async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, {
      read: true
    });

    res.json({ message: "Marked as read" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE ALL
router.delete("/:userId", async (req, res) => {
  try {
    await Notification.deleteMany({
      userId: req.params.userId
    });

    res.json({ message: "All cleared" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
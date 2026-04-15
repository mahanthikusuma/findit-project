import express from "express";
import Item from "../models/Item.js";

const router = express.Router();

// ================= CREATE ITEM =================
router.post("/", async (req, res) => {
  try {
    console.log("📦 ITEM BODY:", req.body); // ✅ DEBUG

    // ✅ BASIC VALIDATION ADD (without removing your logic)
    if (!req.body.name || !req.body.userId) {
      return res.status(400).json({
        error: "Name and userId are required"
      });
    }

    const item = new Item({
      ...req.body,

      userId: String(req.body.userId), // ✅ FIX
      status: "active" // ✅ ADD (important for claims)
    });

    await item.save();

    console.log("✅ ITEM SAVED");

    res.status(201).json(item);

  } catch (err) {
    console.log("❌ ITEM CREATE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= GET ITEMS =================
router.get("/", async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });

    console.log("📤 ITEMS COUNT:", items.length); // ✅ DEBUG

    res.json(items);

  } catch (err) {
    console.log("❌ FETCH ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= DELETE ITEM =================
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Item.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json({ message: "Item Deleted" });

  } catch (err) {
    console.log("❌ DELETE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
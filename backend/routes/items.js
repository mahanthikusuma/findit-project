import express from "express";
import Item from "../models/Item.js";

const router = express.Router();

// ================= CREATE ITEM =================
router.post("/", async (req, res) => {
  try {
    const item = new Item(req.body);
    await item.save();
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
    res.json(items);
  } catch (err) {
    console.log("❌ FETCH ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= DELETE ITEM =================
router.delete("/:id", async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: "Item Deleted" });
  } catch (err) {
    console.log("❌ DELETE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
import express from "express";
import Item from "../models/item.js";

const router = express.Router();

// ✅ GET all items
router.get("/", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    console.log("Error ❌", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET single item by ID 🔥 (IMPORTANT FIX)
router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found ❌" });
    }

    res.json(item);
  } catch (err) {
    console.log("Error ❌", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ POST item
router.post("/", async (req, res) => {
  try {
    console.log("Incoming 👉", req.body);

    const newItem = new Item(req.body);
    await newItem.save();

    console.log("Saved ✅");

    res.status(201).json(newItem);
  } catch (err) {
    console.log("Error ❌", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
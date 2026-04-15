import express from "express";
import Item from "../models/Item.js"; // ✅ FIX (case sensitive)

const router = express.Router();

/* ================= GET ALL ITEMS ================= */
router.get("/", async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });

    console.log("📤 ITEMS COUNT:", items.length); // ✅ DEBUG

    res.json(items);
  } catch (err) {
    console.log("GET ITEMS ERROR ❌", err);
    res.status(500).json({ error: err.message });
  }
});

/* ================= GET SINGLE ITEM ================= */
router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: "Item not found ❌" });
    }

    res.json(item);
  } catch (err) {
    console.log("GET ITEM ERROR ❌", err);
    res.status(500).json({ error: err.message });
  }
});

/* ================= CREATE ITEM ================= */
router.post("/", async (req, res) => {
  try {
    console.log("📦 ITEM RECEIVED:", req.body);

    // 🔥 BASIC VALIDATION
    if (!req.body.name || !req.body.userId) {
      return res.status(400).json({
        error: "Name and userId are required"
      });
    }

    const newItem = await Item.create({
      name: req.body.name,
      category: req.body.category || "",
      place: req.body.place || "",
      loc: req.body.loc || "",
      date: req.body.date || "",
      phone: req.body.phone || "",
      type: req.body.type || "lost",
      img: req.body.img || "",
      postedBy: req.body.postedBy || "User",

      userId: String(req.body.userId), // ✅ FIX (IMPORTANT)
      status: "active" // ✅ ADD (for claim system)
    });

    console.log("✅ ITEM SAVED");

    res.status(201).json(newItem);

  } catch (err) {
    console.log("POST ITEM ERROR ❌", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
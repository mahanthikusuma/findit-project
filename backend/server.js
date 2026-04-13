import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());

/* ================= DB ================= */
mongoose.connect("mongodb://127.0.0.1:27017/findit")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

/* ================= SCHEMAS ================= */

// 👤 USER
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});
const User = mongoose.model("User", userSchema);

// 📦 ITEM ✅ (UPDATED)
const itemSchema = new mongoose.Schema({
  name: String,
  category: String,
  place: String,
  loc: String,
  date: String,
  phone: String,
  type: String,
  img: String,
  postedBy: String,
  userId: String,

  // 🔥 ADDED FIELD (IMPORTANT)
  status: {
    type: String,
    enum: ["lost", "found", "returned"],
    default: "found"
  }

}, { timestamps: true });
const Item = mongoose.model("Item", itemSchema);

// 📩 CLAIM
const claimSchema = new mongoose.Schema({
  itemId: String,
  itemName: String,
  ownerId: String,
  userId: String,
  name: String,
  phone: String,
  proof: String,
  status: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected"], // ✅ improved
    default: "Pending"
  }
}, { timestamps: true });
const Claim = mongoose.model("Claim", claimSchema);

// 🔔 NOTIFICATION
const notificationSchema = new mongoose.Schema({
  userId: String,
  message: String,
  read: { type: Boolean, default: false }
}, { timestamps: true });
const Notification = mongoose.model("Notification", notificationSchema);

/* ================= AUTH ================= */

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email exists" });

    const user = await User.create({ name, email, password });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= ITEMS ================= */

// CREATE ITEM
app.post("/api/items", async (req, res) => {
  try {
    const item = await Item.create(req.body);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL ITEMS ✅ (FILTER ADDED)
app.get("/api/items", async (req, res) => {
  try {
    const items = await Item.find({
      status: { $ne: "returned" } // 🔥 KEY FIX
    }).sort({ createdAt: -1 });

    res.json(items || []);
  } catch (err) {
    res.status(500).json([]);
  }
});

// GET SINGLE ITEM
app.get("/api/items/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ error: "ID missing" });
    }

    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(item);

  } catch (err) {
    console.log("❌ Item fetch error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ================= CLAIMS ================= */

// CREATE CLAIM
app.post("/api/claims", async (req, res) => {
  try {
    const { itemId, itemName, ownerId, userId, name, phone, proof } = req.body;

    const existing = await Claim.findOne({ itemId, userId });
    if (existing) return res.status(400).json({ error: "Already claimed" });

    const claim = await Claim.create({
      itemId,
      itemName,
      ownerId,
      userId,
      name,
      phone,
      proof,
      status: "Pending"
    });

    await Notification.create({
      userId: ownerId,
      message: `New claim from ${name} for "${itemName}"`
    });

    res.json(claim);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET CLAIMS
app.get("/api/claims/:ownerId", async (req, res) => {
  try {
    const claims = await Claim.find({
      ownerId: req.params.ownerId,
      status: "Pending"
    }).sort({ createdAt: -1 });

    res.json(claims || []);

  } catch (err) {
    res.status(500).json([]);
  }
});

/* ================= ACCEPT ================= */

app.put("/api/claims/accept/:id", async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({ error: "Claim not found" });
    }

    claim.status = "Accepted";
    await claim.save();

    // reject others
    await Claim.updateMany(
      { itemId: claim.itemId, _id: { $ne: claim._id } },
      { status: "Rejected" }
    );

    // 🔥 MAIN FIX (instead of delete → update status)
    await Item.findByIdAndUpdate(
      claim.itemId,
      { status: "returned" }
    );

    // 🔔 notify claimer
    await Notification.create({
      userId: claim.userId,
      message: `🎉 Your claim for "${claim.itemName}" ACCEPTED`
    });

    res.json({ message: "Accepted & Item Removed" });

  } catch (err) {
    console.log("❌ Accept error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ================= REJECT ================= */

app.put("/api/claims/reject/:id", async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({ error: "Claim not found" });
    }

    claim.status = "Rejected";
    await claim.save();

    await Notification.create({
      userId: claim.userId,
      message: `❌ Claim rejected for "${claim.itemName}"`
    });

    res.json({ message: "Rejected" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= NOTIFICATIONS ================= */

// GET
app.get("/api/notifications/:userId", async (req, res) => {
  try {
    const data = await Notification.find({
      userId: req.params.userId
    }).sort({ createdAt: -1 });

    res.json(data || []);

  } catch (err) {
    res.status(500).json([]);
  }
});

// MARK READ
app.put("/api/notifications/read/:id", async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: "read" });
  } catch (err) {
    res.status(500).json({ error: "failed" });
  }
});

// DELETE ALL
app.delete("/api/notifications/:userId", async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.params.userId });
    res.json({ message: "cleared" });
  } catch (err) {
    res.status(500).json({ error: "failed" });
  }
});

/* ================= ERROR ================= */

app.use((err, req, res, next) => {
  console.log("🔥 Server Crash:", err);
  res.status(500).json({ error: "Something went wrong" });
});

/* ================= SERVER ================= */

app.listen(5001, () => {
  console.log("🔥 Server running on port 5001");
});
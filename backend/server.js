import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());

/* ================= ROOT ROUTE (ADDED) ================= */
app.get("/", (req, res) => {
  res.send("FindIT Backend Running 🚀");
});

/* ================= DB ================= */
mongoose.connect(
  "mongodb+srv://kusumamahanthi2_db_user:Findit123@cluster0.c8fyxgm.mongodb.net/finditDB"
)
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

// 📦 ITEM
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
    enum: ["Pending", "Accepted", "Rejected"],
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

app.post("/api/items", async (req, res) => {
  try {
    const item = await Item.create(req.body);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/items", async (req, res) => {
  try {
    const items = await Item.find({
      status: { $ne: "returned" }
    }).sort({ createdAt: -1 });

    res.json(items || []);
  } catch (err) {
    res.status(500).json([]);
  }
});

app.get("/api/items/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= CLAIMS ================= */

app.post("/api/claims", async (req, res) => {
  try {
    const { itemId, itemName, ownerId, userId, name, phone, proof } = req.body;

    const existing = await Claim.findOne({ itemId, userId });
    if (existing) return res.status(400).json({ error: "Already claimed" });

    const claim = await Claim.create({
      itemId, itemName, ownerId, userId, name, phone, proof
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

/* ================= SERVER ================= */

const PORT = process.env.PORT || 5001; // 🔥 IMPORTANT FIX

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
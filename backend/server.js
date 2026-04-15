import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json({ limit: "10mb" }));

/* ================= DB CONNECT ================= */
mongoose.connect(
  "mongodb+srv://kusumamahanthi2_db_user:Findit123@cluster0.c8fyxgm.mongodb.net/finditDB?retryWrites=true&w=majority"
)
.then(() => console.log("🟢 MongoDB Connected"))
.catch(err => console.log("🔴 DB Error:", err));

/* ================= MODELS ================= */

// USER
const User = mongoose.model("User", new mongoose.Schema({
  name: String,
  email: String,
  password: String
}));

// ITEM
const Item = mongoose.model("Item", new mongoose.Schema({
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
  status: { type: String, default: "active" }
}, { timestamps: true }));

// CLAIM
const Claim = mongoose.model("Claim", new mongoose.Schema({
  itemId: String,
  itemName: String,
  ownerId: String,
  userId: String,
  name: String,
  phone: String,
  proof: String,
  status: { type: String, default: "Pending" }
}, { timestamps: true }));

// NOTIFICATION
const Notification = mongoose.model("Notification", new mongoose.Schema({
  userId: String,
  message: String,
  read: { type: Boolean, default: false }
}, { timestamps: true }));

/* ================= HEALTH ================= */
app.get("/", (req, res) => {
  res.send("🔥 Backend Running");
});

/* ================= AUTH ================= */

app.post("/api/auth/register", async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.password !== password)
      return res.status(401).json({ error: "Incorrect password" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= ITEMS ================= */

// CREATE
app.post("/api/items", async (req, res) => {
  try {
    const item = await Item.create({
      ...req.body,
      userId: String(req.body.userId),
      status: "active"
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL
app.get("/api/items", async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch {
    res.json([]);
  }
});

// GET ONE
app.get("/api/items/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch {
    res.status(500).json({ error: "Error" });
  }
});

/* ================= CLAIMS ================= */

// CREATE CLAIM
app.post("/api/claims", async (req, res) => {
  try {
    const { itemId, userId, name, phone, proof } = req.body;

    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    const claim = await Claim.create({
      itemId: item._id,
      itemName: item.name,
      ownerId: String(item.userId),
      userId: String(userId),
      name,
      phone,
      proof,
      status: "Pending"
    });

    // ✅ FIXED NOTIFICATION
    await Notification.create({
      userId: String(item.userId),   // 🔥 VERY IMPORTANT
      message: `📩 New claim from ${name} for "${item.name}"`
    });

    res.status(201).json(claim);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET CLAIMS BY OWNER
app.get("/api/claims/:ownerId", async (req, res) => {
  try {
    const claims = await Claim.find({
      ownerId: String(req.params.ownerId)
    }).sort({ createdAt: -1 });

    res.json(claims);
  } catch {
    res.json([]);
  }
});

// ACCEPT
app.put("/api/claims/accept/:id", async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ error: "Not found" });

    claim.status = "Accepted";
    await claim.save();

    await Item.findByIdAndUpdate(claim.itemId, {
      status: "returned"
    });

    // 🔔 NOTIFICATION TO USER
    await Notification.create({
      userId: claim.userId,
      message: `🎉 Claim accepted for "${claim.itemName}"`
    });

    res.json({ message: "Accepted" });
  } catch {
    res.status(500).json({ error: "Error" });
  }
});

// REJECT
app.put("/api/claims/reject/:id", async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ error: "Not found" });

    claim.status = "Rejected";
    await claim.save();

    await Notification.create({
      userId: claim.userId,
      message: `❌ Claim rejected for "${claim.itemName}"`
    });

    res.json({ message: "Rejected" });
  } catch {
    res.status(500).json({ error: "Error" });
  }
});

/* ================= NOTIFICATIONS ================= */

// ✅ GET ALL (for testing)
app.get("/api/notifications", async (req, res) => {
  try {
    const data = await Notification.find().sort({ createdAt: -1 });
    res.json(data);
  } catch {
    res.json([]);
  }
});

// ✅ GET BY USER (MAIN)
app.get("/api/notifications/:userId", async (req, res) => {
  try {
    const data = await Notification.find({
      userId: String(req.params.userId)
    }).sort({ createdAt: -1 });

    res.json(data);
  } catch {
    res.json([]);
  }
});

// MARK READ
app.put("/api/notifications/read/:id", async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, {
      read: true
    });
    res.json({ message: "Read" });
  } catch {
    res.status(500).json({ error: "Error" });
  }
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log("🚀 Server running on " + PORT);
});
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect("mongodb+srv://ishan:Qwerty2002@friends.fd5yf.mongodb.net/", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Friend Schema
const friendSchema = new mongoose.Schema({
  name: String,
  image: String,
  balance: Number,
});

const Friend = mongoose.model("Friend", friendSchema);

// CRUD Routes

// Get all friends
app.get("/api/friends", async (req, res) => {
  try {
    const friends = await Friend.find();
    res.json(friends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new friend
app.post("/api/friends", async (req, res) => {
  const { name, image, balance } = req.body;
  try {
    const newFriend = new Friend({ name, image, balance });
    await newFriend.save();
    res.json(newFriend);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a friend's balance
app.put("/api/friends/:id", async (req, res) => {
  const { id } = req.params;
  const { balance } = req.body;
  try {
    const updatedFriend = await Friend.findByIdAndUpdate(id, { balance }, { new: true });
    res.json(updatedFriend);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a friend
app.delete("/api/friends/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Friend.findByIdAndDelete(id);
    res.json({ message: "Friend deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

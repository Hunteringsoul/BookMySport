require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error(err));

// Booking Schema
const BookingSchema = new mongoose.Schema({
    username: String,
    name: String,
    sport: String,
    venue: String,
    date: String,
    time: String
});
const Booking = mongoose.model("Booking", BookingSchema);

// User Schema
const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    isAdmin: Boolean
});
const User = mongoose.model("User", UserSchema);

// Middleware for Authentication
const authenticate = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Access Denied" });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: "Invalid Token" });
    }
};

// ** Routes **

// 1️⃣ User Login
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, isAdmin: user.isAdmin });
});

// 2️⃣ Get Bookings (Admin Only)
app.get("/bookings", authenticate, async (req, res) => {
    if (!req.user.isAdmin) return res.status(403).json({ message: "Access denied" });

    let { venue, sport, date } = req.query;
    let filters = {};
    
    if (venue) filters.venue = venue;
    if (sport) filters.sport = sport;
    if (date) filters.date = date;

    const bookings = await Booking.find(filters);
    res.json(bookings);
});

// 3️⃣ Delete a Booking (Admin Only)
app.delete("/bookings/:id", authenticate, async (req, res) => {
    if (!req.user.isAdmin) return res.status(403).json({ message: "Access denied" });

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking deleted" });
});

// 4️⃣ Clear All Bookings (Admin Only)
app.delete("/bookings", authenticate, async (req, res) => {
    if (!req.user.isAdmin) return res.status(403).json({ message: "Access denied" });

    await Booking.deleteMany({});
    res.json({ message: "All bookings deleted" });
});

// 5️⃣ Export Bookings as JSON
app.get("/export", authenticate, async (req, res) => {
    if (!req.user.isAdmin) return res.status(403).json({ message: "Access denied" });

    const bookings = await Booking.find({});
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", "attachment; filename=bookings.json");
    res.json(bookings);
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

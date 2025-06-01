const express = require("express");
const jwt = require("jsonwebtoken");
const Booking = require("../../bookings"); // Import Booking model
const authenticate = require("../../Login/admin/middleware/auth.js");


const router = express.Router();

// Get all bookings (Admin Only)
router.get("/bookings", authenticate, async (req, res) => {
    if (!req.user.isAdmin) return res.status(403).json({ message: "Access denied" });

    let { venue, sport, date } = req.query;
    let filters = {};
    
    if (venue) filters.venue = venue;
    if (sport) filters.sport = sport;
    if (date) filters.date = date;

    const bookings = await Booking.find(filters);
    res.json(bookings);
});

// Delete a specific booking (Admin Only)
router.delete("/bookings/:id", authenticate, async (req, res) => {
    if (!req.user.isAdmin) return res.status(403).json({ message: "Access denied" });

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking deleted" });
});

// Clear all bookings (Admin Only)
router.delete("/bookings", authenticate, async (req, res) => {
    if (!req.user.isAdmin) return res.status(403).json({ message: "Access denied" });

    await Booking.deleteMany({});
    res.json({ message: "All bookings deleted" });
});

// Export bookings as JSON (Admin Only)
router.get("/export", authenticate, async (req, res) => {
    if (!req.user.isAdmin) return res.status(403).json({ message: "Access denied" });

    const bookings = await Booking.find({});
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", "attachment; filename=bookings.json");
    res.json(bookings);
});

module.exports = router;

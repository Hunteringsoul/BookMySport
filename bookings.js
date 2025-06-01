const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
    username: String,
    name: String,
    sport: String,
    venue: String,
    date: String,
    time: String
});

module.exports = mongoose.model("Booking", BookingSchema);

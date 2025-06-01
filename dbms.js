// Simple in-memory database using localStorage
const DB = {
    // Generate a unique ID for bookings
    generateID: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // Save a booking to the database
    saveBooking: function(booking) {
        // Get current bookings from localStorage
        const bookings = this.getBookings();
        
        // Add ID and username to the booking
        booking.id = this.generateID();
        if (!booking.username && typeof currentUser !== 'undefined') {
            booking.username = currentUser;
        }
        
        // Add the new booking
        bookings.push(booking);
        
        // Save back to localStorage
        localStorage.setItem('sportsbookings', JSON.stringify(bookings));
        
        return booking;
    },
    
    // Get all bookings
    getBookings: function() {
        const bookingsJSON = localStorage.getItem('sportsbookings');
        return bookingsJSON ? JSON.parse(bookingsJSON) : [];
    },
    
    // Get bookings for a specific user
    getUserBookings: function(username) {
        const bookings = this.getBookings();
        return bookings.filter(booking => booking.username === username);
    },
    
    // Delete a booking by ID
    deleteBooking: function(id) {
        let bookings = this.getBookings();
        bookings = bookings.filter(booking => booking.id !== id);
        localStorage.setItem('sportsbookings', JSON.stringify(bookings));
    },
    
    // Clear all bookings
    clearAll: function() {
        localStorage.removeItem('sportsbookings');
    }
};

// Global variables for the current user and admin status
let currentUser = null;
let isAdmin = false;

// Logout function
function logout() {
    currentUser = null;
    isAdmin = false;
    document.getElementById('loginPage').style.display = 'block';
    document.getElementById('adminPage').style.display = 'none';
    document.getElementById('userPage').style.display = 'none';
    // Clear input fields
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}
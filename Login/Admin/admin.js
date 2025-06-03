document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("token");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (token && isAdmin) {
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("adminPage").style.display = "block";
        
        // Wait a moment for the page to fully load, then update
        setTimeout(() => {
            displayAdminBookings();
            updateBookingStatistics();
        }, 100);
    }
});

//Login Handling
document.getElementById("loginButton").addEventListener("click", function () {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (username === "admin" && password === "admin") {
        localStorage.setItem("token", "admin-token");
        localStorage.setItem("isAdmin", "true");
        location.reload();
    } else {
        alert("Invalid username or password.");
    }
});

// Logout Handling
document.getElementById("logoutTabAdmin").addEventListener("click", function () {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    location.reload();
});

// Update Booking Statistics
function updateBookingStatistics() {
    const bookings = DB.getBookings();
    console.log('Updating statistics with bookings:', bookings); // Debug log
    
    const today = new Date();
    const todayString = today.toDateString();
    
    // Total bookings
    const totalCount = bookings.length;
    document.getElementById("totalBookings").textContent = totalCount;
    console.log('Total bookings count:', totalCount); // Debug log
    
    // Today's bookings
    const todayBookings = bookings.filter(booking => {
        if (!booking.date) return false;
        const bookingDate = new Date(booking.date);
        return bookingDate.toDateString() === todayString;
    });
    document.getElementById("todayBookings").textContent = todayBookings.length;
    console.log('Today bookings count:', todayBookings.length); // Debug log
    
    // Upcoming bookings (from today onwards)
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Reset time to start of day
    
    const upcomingBookings = bookings.filter(booking => {
        if (!booking.date) return false;
        const bookingDate = new Date(booking.date);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate >= currentDate;
    });
    document.getElementById("upcomingBookings").textContent = upcomingBookings.length;
    console.log('Upcoming bookings count:', upcomingBookings.length); // Debug log
    
    // Most popular venue
    if (bookings.length > 0) {
        const venueCount = {};
        bookings.forEach(booking => {
            if (booking.venue) {
                venueCount[booking.venue] = (venueCount[booking.venue] || 0) + 1;
            }
        });
        
        if (Object.keys(venueCount).length > 0) {
            const mostPopular = Object.keys(venueCount).reduce((a, b) => 
                venueCount[a] > venueCount[b] ? a : b
            );
            document.getElementById("mostPopularVenue").textContent = mostPopular;
        } else {
            document.getElementById("mostPopularVenue").textContent = "-";
        }
    } else {
        document.getElementById("mostPopularVenue").textContent = "-";
    }
}

// Display Admin Bookings
async function displayAdminBookings() {
    const bookings = DB.getBookings();
    const tableDiv = document.getElementById("adminBookingsTable");

    // Always update statistics first
    updateBookingStatistics();

    if (bookings.length === 0) {
        tableDiv.innerHTML = `<div class="no-bookings">No bookings found.</div>`;
        return;
    }

    let html = `<table><thead><tr>
        <th>Username</th><th>Name</th><th>Sport</th><th>Venue</th><th>Date</th><th>Time</th><th>Action</th></tr></thead><tbody>`;

    bookings.forEach((booking) => {
        html += `<tr>
            <td>${booking.username || 'N/A'}</td>
            <td>${booking.name || 'N/A'}</td>
            <td>${booking.sport || 'N/A'}</td>
            <td>${booking.venue || 'N/A'}</td>
            <td>${booking.date ? new Date(booking.date).toLocaleDateString() : 'N/A'}</td>
            <td>${booking.time || 'N/A'}</td>
            <td><button class="delete-btn" data-id="${booking.id || booking._id}">Delete</button></td>
        </tr>`;
    });

    html += `</tbody></table>`;
    tableDiv.innerHTML = html;

    document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", function () {
            const id = this.dataset.id;
            if (confirm("Are you sure?")) {
                DB.deleteBooking(id);
                displayAdminBookings(); // This will also update statistics
            }
        });
    });
}

// Clear All Bookings
document.getElementById("clearDatabase").addEventListener("click", function () {
    if (confirm("Are you sure you want to delete ALL bookings? This cannot be undone.")) {
        DB.clearAll();
        displayAdminBookings(); // This will also update statistics
    }
});

// Export Bookings
document.getElementById("exportJSON").addEventListener("click", function () {
    const bookings = DB.getBookings();

    if (bookings.length === 0) {
        alert("No bookings available to export.");
        return;
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bookings, null, 2));
    
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "bookings.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
});

// Add manual refresh function for debugging
function manualRefresh() {
    console.log('Manual refresh triggered');
    updateBookingStatistics();
    displayAdminBookings();
}

// You can call this from browser console: manualRefresh()
window.manualRefresh = manualRefresh;

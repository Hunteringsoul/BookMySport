window.addEventListener('load', function() {
    const savedUser = localStorage.getItem('currentUser');
    const isAdmin = localStorage.getItem('isAdmin') === 'false';

    if (savedUser && !isAdmin) {
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('userPage').style.display = 'block';
        updateUserStats();
        displayUserBookings();
    }
});

// Login handling
document.getElementById('loginButton').addEventListener('click', function() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === 'user' && password === 'user') {
        localStorage.setItem('currentUser', 'user');
        localStorage.setItem('isAdmin', 'false');

        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('userPage').style.display = 'block';
        updateUserStats();
        displayUserBookings();
    } else {
        alert('Invalid username or password');
    }
});

// Logout handler
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');

    document.getElementById('loginPage').style.display = 'block';
    document.getElementById('userPage').style.display = 'none';
    location.reload();
}

document.getElementById('logoutTabUser').addEventListener('click', logout);

// Display user's bookings
function displayUserBookings() {
    const bookings = DB.getUserBookings(currentUser);
    const tableDiv = document.getElementById('userBookingsTable');
    
    if (bookings.length === 0) {
        tableDiv.innerHTML = '<div class="no-bookings">You have no bookings. Book a venue to get started!</div>';
        return;
    }
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Sport</th>
                    <th>Venue</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    bookings.forEach(booking => {
        // Format the date for display
        const bookingDate = new Date(booking.date);
        const formattedDate = bookingDate.toLocaleDateString();
        
        html += `
            <tr>
                <td>${booking.name}</td>
                <td>${booking.sport}</td>
                <td>${booking.venue}</td>
                <td>${formattedDate}</td>
                <td>${booking.time}</td>
                <td>
                    <button class="delete-btn" data-id="${booking.id}">Cancel</button>
                </td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    tableDiv.innerHTML = html;
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            if (confirm('Are you sure you want to cancel this booking?')) {
                DB.deleteBooking(id);
                displayUserBookings();
            }
        });
    });
}

// Form submission handler
document.getElementById('bookingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Check for double booking
    const bookings = DB.getBookings();
    const venue = document.getElementById('venue').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    
    const existingBooking = bookings.find(booking => 
        booking.venue === venue && 
        booking.date === date && 
        booking.time === time
    );
    
    if (existingBooking) {
        alert(`Sorry, ${venue} is already booked for ${time} on ${new Date(date).toLocaleDateString()}. Please choose another time or venue.`);
        return;
    }
    
    // Get form values
    const booking = {
        name: document.getElementById('name').value,
        sport: document.getElementById('sport').value,
        venue: venue,
        date: date,
        time: time
    };
    
    // Save to database
    DB.saveBooking(booking);
    
    // Show success message
    document.getElementById('successMessage').style.display = 'block';
    
    // Hide the form
    this.style.display = 'none';
    
    // Update the bookings table
    displayUserBookings();
});

// "Make Another Booking" button handler
document.getElementById('newBookingBtn').addEventListener('click', function() {
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('bookingForm').style.display = 'block';
    document.getElementById('bookingForm').reset();
});
document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("token");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (token && isAdmin) {
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("adminPage").style.display = "block";
        displayAdminBookings();
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
    location.reload(); v
});

// Display Admin Bookings
async function displayAdminBookings() {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/admin/bookings", {
        headers: { Authorization: token },
    });

    const bookings = await res.json();
    const tableDiv = document.getElementById("adminBookingsTable");

    if (bookings.length === 0) {
        tableDiv.innerHTML = `<div class="no-bookings">No bookings found.</div>`;
        return;
    }

    let html = `<table><thead><tr>
        <th>Username</th><th>Name</th><th>Sport</th><th>Venue</th><th>Date</th><th>Time</th><th>Action</th></tr></thead><tbody>`;

    bookings.forEach((booking) => {
        html += `<tr>
            <td>${booking.username}</td>
            <td>${booking.name}</td>
            <td>${booking.sport}</td>
            <td>${booking.venue}</td>
            <td>${new Date(booking.date).toLocaleDateString()}</td>
            <td>${booking.time}</td>
            <td><button class="delete-btn" data-id="${booking._id}">Delete</button></td>
        </tr>`;
    });

    html += `</tbody></table>`;
    tableDiv.innerHTML = html;

    document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", async function () {
            const id = this.dataset.id;
            if (confirm("Are you sure?")) {
                await fetch(`http://localhost:5000/admin/bookings/${id}`, {
                    method: "DELETE",
                    headers: { Authorization: token },
                });
                displayAdminBookings();
            }
        });
    });
}

// Clear All Bookings
document.getElementById("clearDatabase").addEventListener("click", async function () {
    const token = localStorage.getItem("token");

    if (confirm("Are you sure you want to delete ALL bookings? This cannot be undone.")) {
        await fetch("http://localhost:5000/admin/bookings", {
            method: "DELETE",
            headers: { Authorization: token },
        });
        displayAdminBookings();
    }
});

// Export Bookings
document.getElementById("exportJSON").addEventListener("click", async function () {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/admin/export", {
        headers: { Authorization: token },
    });

    const data = await res.json();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "bookings.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
});

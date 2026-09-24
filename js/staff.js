// Get the authentication token
const token = localStorage.getItem("queuelessToken");

// Redirect to login if the user is not logged in
if (!token) {
    window.location.href = "busi_login.html";
}

// Get HTML elements
const staffForm = document.getElementById("staffForm");
const staffName = document.getElementById("staffName");
const staffList = document.getElementById("staffList");
const staffMessage = document.getElementById("staffMessage");

// =====================================
// LOAD STAFF MEMBERS
// =====================================

function loadStaff() {

    fetch("http://localhost:3000/my-staff", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to load staff members.");
        }

        return response.json();
    })

    .then(data => {

        const staff = data.staff || [];

        staffList.innerHTML = "";

        if (staff.length === 0) {
            staffList.innerHTML = `
                <tr>
                    <td colspan="2">
                        No staff members found.
                    </td>
                </tr>
            `;
            return;
        }

        staff.forEach(member => {

            const row = document.createElement("tr");

            const nameCell = document.createElement("td");
            nameCell.textContent = member.staff_name;

            const availabilityCell = document.createElement("td");

            const badge = document.createElement("span");

            badge.textContent = member.available
                ? "Available"
                : "Busy";

            badge.className = member.available
                ? "status-badge available"
                : "status-badge busy";

            availabilityCell.appendChild(badge);

            row.appendChild(nameCell);
            row.appendChild(availabilityCell);

            staffList.appendChild(row);

        });

    })

    .catch(error => {
        console.error("Error loading staff:", error);

        staffList.innerHTML = `
            <tr>
                <td colspan="2">
                    Failed to load staff members.
                </td>
            </tr>
        `;
    });
}

// =====================================
// ADD A STAFF MEMBER
// =====================================

staffForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const name = staffName.value.trim();

    if (name === "") {
        staffMessage.textContent = "Please enter a staff member's name.";
        return;
    }

    fetch("http://localhost:3000/staff", {

        method: "POST",

        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },

        body: JSON.stringify({
            staff_name: name
        })

    })

    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to add staff member.");
        }

        return response.json();
    })

    .then(data => {

        staffMessage.textContent = "Staff member added successfully!";

        staffForm.reset();

        loadStaff();

    })

    .catch(error => {

        console.error("Error adding staff:", error);

        staffMessage.textContent = "Could not add staff member.";

    });

});

// =====================================
// INITIAL LOAD
// =====================================

loadStaff();
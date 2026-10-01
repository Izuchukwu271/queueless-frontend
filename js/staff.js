// Get the authentication token
const token = localStorage.getItem("queuelessToken");

// Redirect to login if the user is not logged in
if (!token) {
    window.location.href = "busi_login.html";
}


// =====================================
// QUEUELESS THEME
// =====================================

const savedTheme =
    localStorage.getItem("queuelessTheme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
}


// =====================================
// GET HTML ELEMENTS
// =====================================

const staffForm =
    document.getElementById("staffForm");

const staffName =
    document.getElementById("staffName");

const staffList =
    document.getElementById("staffList");

const staffMessage =
    document.getElementById("staffMessage");


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
            throw new Error(
                "Failed to load staff members."
            );
        }

        return response.json();
    })

    .then(data => {

        const staff =
            data.staff || [];

        staffList.innerHTML = "";


        // ==============================
        // NO STAFF MEMBERS
        // ==============================

        if (staff.length === 0) {

            staffList.innerHTML = `
                <tr>
                    <td
                        colspan="2"
                        class="staff-empty-cell"
                    >
                        <div class="staff-empty-state">
                            <div class="staff-empty-icon">
                                👥
                            </div>

                            <strong>
                                No staff members yet
                            </strong>

                            <p>
                                Add your first staff member
                                to start managing your team.
                            </p>
                        </div>
                    </td>
                </tr>
            `;

            return;
        }


        // ==============================
        // DISPLAY STAFF MEMBERS
        // ==============================

        staff.forEach(member => {

            const row =
                document.createElement("tr");


            // STAFF NAME

            const nameCell =
                document.createElement("td");

            nameCell.innerHTML = `
                <div class="staff-name-cell">

                    <div class="staff-table-avatar">
                        ${member.staff_name
                            .charAt(0)
                            .toUpperCase()}
                    </div>

                    <strong>
                        ${member.staff_name}
                    </strong>

                </div>
            `;


            // AVAILABILITY

            const availabilityCell =
                document.createElement("td");


            const badge =
                document.createElement("span");


            if (member.available) {

                badge.textContent =
                    "Available";

                badge.className =
                    "status-badge available";

            } else {

                badge.textContent =
                    "Busy";

                badge.className =
                    "status-badge busy";

            }


            availabilityCell.appendChild(
                badge
            );


            // ADD CELLS

            row.appendChild(
                nameCell
            );

            row.appendChild(
                availabilityCell
            );


            staffList.appendChild(
                row
            );

        });

    })

    .catch(error => {

        console.error(
            "Error loading staff:",
            error
        );

        staffList.innerHTML = `
            <tr>
                <td
                    colspan="2"
                    class="staff-error-cell"
                >
                    <div class="staff-empty-state">

                        <div class="staff-empty-icon">
                            ⚠
                        </div>

                        <strong>
                            Unable to load staff
                        </strong>

                        <p>
                            Please check your connection
                            and try again.
                        </p>

                    </div>
                </td>
            </tr>
        `;

    });

}


// =====================================
// ADD A STAFF MEMBER
// =====================================

staffForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const name =
            staffName.value.trim();


        // ==============================
        // VALIDATION
        // ==============================

        if (name === "") {

            staffMessage.textContent =
                "Please enter a staff member's name.";

            staffMessage.className =
                "staff-message error";

            return;
        }


        // ==============================
        // DISABLE BUTTON WHILE SAVING
        // ==============================

        const submitButton =
            staffForm.querySelector(
                "button[type='submit']"
            );


        if (submitButton) {

            submitButton.disabled =
                true;

            submitButton.textContent =
                "Adding...";
        }


        // ==============================
        // SEND STAFF TO BACKEND
        // ==============================

        fetch(
            "http://localhost:3000/staff",
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    Authorization:
                        `Bearer ${token}`
                },

                body: JSON.stringify({
                    staff_name: name
                })

            }
        )

        .then(response => {

            if (!response.ok) {

                throw new Error(
                    "Failed to add staff member."
                );

            }

            return response.json();

        })

        .then(data => {

            console.log(
                "Staff added:",
                data
            );


            staffMessage.textContent =
                "Staff member added successfully!";

            staffMessage.className =
                "staff-message success";


            staffForm.reset();


            loadStaff();

        })

        .catch(error => {

            console.error(
                "Error adding staff:",
                error
            );


            staffMessage.textContent =
                "Could not add staff member.";

            staffMessage.className =
                "staff-message error";

        })

        .finally(() => {

            if (submitButton) {

                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "+ Add Staff";

            }

        });

    }
);


// =====================================
// INITIAL LOAD
// =====================================

loadStaff();
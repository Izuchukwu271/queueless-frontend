const token = localStorage.getItem("queuelessToken");

let businessId = null;
let businessSlug = null;

let knownQueueIds = new Set();
let notifications = [];
let unreadNotificationCount = 0;
let notificationsInitialized = false;

// Check if the user is logged in
if (!token) {
    window.location.href = "busi_login.html";
}


// =====================================
// DASHBOARD ELEMENTS
// =====================================

const sidebarBusinessName =
    document.getElementById("sidebarBusinessName");

const topbarBusinessName =
    document.getElementById("topbarBusinessName");

const waitingCount =
    document.getElementById("waitingCount");

const servingCount =
    document.getElementById("servingCount");

const completedCount =
    document.getElementById("completedCount");

const activeStaffCount =
    document.getElementById("activeStaffCount");

const queueList =
    document.getElementById("queueList");

const currentlyServingList =
    document.getElementById("currentlyServingList");

const servingStaffCount =
    document.getElementById("servingStaffCount");

    const businessQrBtn =
    document.getElementById("businessQrBtn");

    const sidebarQrBtn =
    document.getElementById("sidebarQrBtn");

const qrModal =
    document.getElementById("qrModal");

const qrModalClose =
    document.getElementById("qrModalClose");

const qrCodeContainer =
    document.getElementById("qrCodeContainer");

const qrBusinessName =
    document.getElementById("qrBusinessName");

const qrBusinessLocation =
    document.getElementById("qrBusinessLocation");

const qrCustomerUrl =
    document.getElementById("qrCustomerUrl");


// =====================================
// STAFF STATUS ELEMENTS
// =====================================

const staffStatusList =
    document.getElementById("staffStatusList");

const staffStatusCount =
    document.getElementById("staffStatusCount");


// =====================================
// LOAD BUSINESS INFORMATION
// =====================================

function loadBusinessInformation() {

    fetch("http://localhost:3000/my-business", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })

    .then(response => {

        if (!response.ok) {
            throw new Error("Failed to load business information.");
        }

        return response.json();

    })

    .then(data => {

        console.log("Business information:", data);

        const business = data.business;

        businessId = business.id;
        businessSlug = business.slug;

        sidebarBusinessName.textContent =
            business.business_name;

        topbarBusinessName.textContent =
            business.business_name;

        // Fill Business Settings form

      settingsBusinessName.value =
       business.business_name || "";

     settingsPhone.value =
     business.phone || "";

     settingsLocation.value =
      business.location || "";    

    })

    .catch(error => {

        console.error("Business loading error:", error);

    });

}


// =====================================
// LOAD QUEUE DATA
// =====================================

function loadQueueData() {

    fetch("http://localhost:3000/my-queues", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })

    .then(response => {

        if (!response.ok) {
            throw new Error("Failed to load queue data.");
        }

        return response.json();

    })

    .then(data => {

        console.log("Queue records:", data.queues);

        const queues = data.queues || [];

        // Detect newly joined customers
if (!notificationsInitialized) {

    queues.forEach(customer => {
        knownQueueIds.add(customer.id);
    });

    notificationsInitialized = true;

} else {

    queues.forEach(customer => {

        if (
            !knownQueueIds.has(customer.id) &&
            customer.status === "waiting"
        ) {

            addNotification(customer);

        }

        knownQueueIds.add(customer.id);

    });

}


        // =====================================
        // FILTER CUSTOMERS BY STATUS
        // =====================================

        const waiting = queues.filter(
            customer => customer.status === "waiting"
        );

        const serving = queues.filter(
            customer => customer.status === "serving"
        );

        const completed = queues.filter(
            customer => customer.status === "completed"
        );


        // =====================================
        // UPDATE DASHBOARD STATISTICS
        // =====================================

        waitingCount.textContent = waiting.length;

        servingCount.textContent = serving.length;

        completedCount.textContent = completed.length;

        // Number of staff currently serving
        activeStaffCount.textContent = serving.length;


        // =====================================
        // UPDATE CURRENTLY SERVING PANEL
        // =====================================

        renderCurrentlyServing(serving);


        // =====================================
        // UPDATE STAFF STATUS
        // =====================================

        loadStaffStatus(queues);


        // =====================================
        // UPDATE QUEUE TABLE
        // =====================================

        renderQueueTable(queues);

    })

    .catch(error => {

        console.error("Queue loading error:", error);

    });

}


// =====================================
// LOAD STAFF STATUS
// =====================================

function loadStaffStatus(queues) {

    fetch("http://localhost:3000/my-staff", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })

    .then(response => {

        if (!response.ok) {
            throw new Error("Failed to load staff.");
        }

        return response.json();

    })

    .then(data => {

        console.log("Staff records:", data.staff);

        const staff = data.staff || [];


        // =====================================
        // UPDATE STAFF COUNT
        // =====================================

        staffStatusCount.textContent =
            staff.length;


        // =====================================
        // NO STAFF
        // =====================================

        if (staff.length === 0) {

            staffStatusList.innerHTML = `
                <div class="staff-status-empty">

                    <div class="staff-status-empty-icon">
                        👤
                    </div>

                    <strong>
                        No staff members
                    </strong>

                    <p>
                        Add staff members to see their status here.
                    </p>

                </div>
            `;

            return;
        }


        // =====================================
        // CLEAR OLD STAFF STATUS
        // =====================================

        staffStatusList.innerHTML = "";


        // =====================================
        // DISPLAY EACH STAFF MEMBER
        // =====================================

        staff.forEach(member => {


            // Find a customer currently being
            // served by this staff member

            const servingCustomer = queues.find(
                customer =>
                    customer.status === "serving" &&
                    customer.staff_id === member.id
            );


            // =====================================
            // DETERMINE STAFF STATUS
            // =====================================

            let statusBadge;

            let statusDescription;


            if (servingCustomer) {

                statusBadge = `
                    <span class="staff-status-badge serving">
                        🔴 Serving ${servingCustomer.ticket}
                    </span>
                `;

                statusDescription =
                    `Currently serving ${servingCustomer.ticket}`;

            } else {

                statusBadge = `
                    <span class="staff-status-badge available">
                        🟢 Available
                    </span>
                `;

                statusDescription =
                    "Ready for next customer";

            }


            // =====================================
            // STAFF CARD
            // =====================================

            const staffCard =
                document.createElement("div");

            staffCard.className =
                "staff-status-card";


            staffCard.innerHTML = `

                <div class="staff-status-info">

                    <div class="staff-avatar">
                        ${member.staff_name
                            .charAt(0)
                            .toUpperCase()}
                    </div>

                    <div class="staff-details">

                        <strong>
                            ${member.staff_name}
                        </strong>

                        <span>
                            ${statusDescription}
                        </span>

                    </div>

                </div>

                ${statusBadge}

            `;


            staffStatusList.appendChild(
                staffCard
            );

        });

    })

    .catch(error => {

        console.error(
            "Staff status loading error:",
            error
        );

    });

}


// =====================================
// RENDER CURRENTLY SERVING
// =====================================

function renderCurrentlyServing(serving) {

    currentlyServingList.innerHTML = "";

    servingStaffCount.textContent =
        serving.length;


    // No customers currently being served
    if (serving.length === 0) {

        currentlyServingList.innerHTML = `
            <div class="serving-empty-state">

                <div class="serving-empty-icon">
                    ✓
                </div>

                <strong>
                    No customers being served
                </strong>

                <p>
                    Customers assigned to staff will appear here.
                </p>

            </div>
        `;

        return;
    }


    // Create a card for EVERY serving customer
    serving.forEach(customer => {

        const card =
            document.createElement("div");

        card.className =
            "serving-customer-card";


        // =====================================
        // TICKET
        // =====================================

        const ticket =
            document.createElement("div");

        ticket.className =
            "serving-ticket";

        ticket.textContent =
            customer.ticket;


        // =====================================
        // CUSTOMER INFORMATION
        // =====================================

        const customerInfo =
            document.createElement("div");

        customerInfo.className =
            "serving-customer-info";

        customerInfo.innerHTML = `
            <strong>
                ${customer.customer_name}
            </strong>

            <span>
                People: ${customer.people ?? "—"}
            </span>

            <span>
                Staff: ${customer.staff_name ?? "Unassigned"}
            </span>
        `;


        // =====================================
        // STATUS
        // =====================================

        const status =
            document.createElement("span");

        status.className =
            "serving-status";

        status.textContent =
            "Serving";


        // =====================================
        // COMPLETE BUTTON
        // =====================================

        const completeBtn =
            document.createElement("button");

        completeBtn.className =
            "serving-complete-btn";

        completeBtn.textContent =
            "Complete";

        completeBtn.dataset.queueId =
            customer.id;


        // =====================================
        // CARD TOP
        // =====================================

        const cardTop =
            document.createElement("div");

        cardTop.className =
            "serving-card-top";

        cardTop.appendChild(ticket);

        cardTop.appendChild(status);


        // =====================================
        // CARD BOTTOM
        // =====================================

        const cardBottom =
            document.createElement("div");

        cardBottom.className =
            "serving-card-bottom";

        cardBottom.appendChild(customerInfo);

        cardBottom.appendChild(completeBtn);


        // =====================================
        // BUILD CARD
        // =====================================

        card.appendChild(cardTop);

        card.appendChild(cardBottom);

        currentlyServingList.appendChild(card);

    });

}


// =====================================
// RENDER QUEUE TABLE
// =====================================

function renderQueueTable(queues) {

    queueList.innerHTML = "";


    if (queues.length === 0) {

        queueList.innerHTML = `
            <tr>
                <td colspan="5" class="empty-queue">
                    No customers in the queue yet.
                </td>
            </tr>
        `;

        return;
    }


    queues.forEach(customer => {

        const row =
            document.createElement("tr");

         row.dataset.queueId =
         customer.id;    


        // =====================================
        // TICKET
        // =====================================

        const ticketCell =
            document.createElement("td");

        ticketCell.textContent =
            customer.ticket;


        // =====================================
        // CUSTOMER NAME
        // =====================================

        const nameCell =
            document.createElement("td");

        nameCell.textContent =
            customer.customer_name;


        // =====================================
        // NUMBER OF PEOPLE
        // =====================================

        const peopleCell =
            document.createElement("td");

        peopleCell.textContent =
            customer.people ?? "—";


        // =====================================
        // STATUS
        // =====================================

        const statusCell =
            document.createElement("td");

        const statusBadge =
            document.createElement("span");

        statusBadge.textContent =
            customer.status;

        statusBadge.className =
            "status-badge " +
            customer.status;

        statusCell.appendChild(
            statusBadge
        );


        // =====================================
        // ACTIONS
        // =====================================

        const actionCell =
            document.createElement("td");


        // =====================================
        // WAITING → CANCEL
        // =====================================

        if (customer.status === "waiting") {

            const cancelBtn =
                document.createElement("button");

            cancelBtn.textContent =
                "Cancel";

            cancelBtn.className =
                "dashboard-cancel-btn cancel-queue-btn";

            cancelBtn.dataset.queueId =
                customer.id;

            actionCell.appendChild(
                cancelBtn
            );

        }


        // =====================================
        // SERVING → COMPLETE
        // =====================================

        else if (customer.status === "serving") {

            const completeBtn =
                document.createElement("button");

            completeBtn.textContent =
                "Complete";

            completeBtn.className =
                "complete-queue-btn";

            completeBtn.dataset.queueId =
                customer.id;

            actionCell.appendChild(
                completeBtn
            );

        }


        // =====================================
        // COMPLETED / CANCELLED
        // =====================================

        else {

            actionCell.textContent =
                "—";

        }


        row.appendChild(ticketCell);

        row.appendChild(nameCell);

        row.appendChild(peopleCell);

        row.appendChild(statusCell);

        row.appendChild(actionCell);

        queueList.appendChild(row);

    });

}


// =====================================
// START DASHBOARD
// =====================================

loadBusinessInformation();

loadQueueData();


// =====================================
// REFRESH DASHBOARD EVERY 5 SECONDS
// =====================================

setInterval(function () {

    loadQueueData();

}, 5000);


// =====================================
// SERVE NEXT CUSTOMER
// =====================================

const serveNextBtn =
    document.getElementById("serveNextBtn");


serveNextBtn.addEventListener(
    "click",
    function () {

        if (!businessId) {

            alert(
                "Business information is still loading."
            );

            return;
        }


        serveNextBtn.disabled = true;

        serveNextBtn.textContent =
            "Serving...";


        fetch(
            `http://localhost:3000/queues/${businessId}/next`,
            {
                method: "PATCH",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        )

        .then(response => {

            return response.json()
                .then(data => {

                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            "Failed to serve customer."
                        );

                    }

                    return data;

                });

        })

        .then(data => {

            console.log(
                "Customer is now being served:",
                data
            );


            alert(
                `${data.queue.customer_name} is now being served!`
            );


            loadQueueData();

        })

        .catch(error => {

            console.error(
                "Serve next error:",
                error
            );

            alert(error.message);

        })

        .finally(() => {

            serveNextBtn.disabled = false;

            serveNextBtn.textContent =
                "+ Serve next customer";

        });

    }
);


// =====================================
// COMPLETE SERVING CUSTOMER
// =====================================

currentlyServingList.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                ".serving-complete-btn"
            );


        if (!button) {
            return;
        }


        const queueId =
            button.dataset.queueId;


        button.disabled = true;

        button.textContent =
            "Completing...";


        fetch(
            `http://localhost:3000/queues/${queueId}/complete`,
            {
                method: "PATCH",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        )

        .then(async response => {

            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to complete customer."
                );

            }


            return data;

        })

        .then(() => {

            alert(
                "Customer completed successfully!"
            );


            loadQueueData();

        })

        .catch(error => {

            console.error(
                "Error completing customer:",
                error
            );


            alert(
                error.message ||
                "Could not complete customer."
            );


            button.disabled = false;

            button.textContent =
                "Complete";

        });

    }
);


// =====================================
// COMPLETE CUSTOMER FROM QUEUE TABLE
// =====================================

queueList.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                ".complete-queue-btn"
            );


        if (!button) {
            return;
        }


        const queueId =
            button.dataset.queueId;


        button.disabled = true;

        button.textContent =
            "Completing...";


        fetch(
            `http://localhost:3000/queues/${queueId}/complete`,
            {
                method: "PATCH",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        )

        .then(async response => {

            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to complete customer."
                );

            }


            return data;

        })

        .then(() => {

            alert(
                "Customer completed successfully!"
            );


            loadQueueData();

        })

        .catch(error => {

            console.error(
                "Error completing customer:",
                error
            );


            alert(
                error.message ||
                "Could not complete customer."
            );


            button.disabled = false;

            button.textContent =
                "Complete";

        });

    }
);


// =====================================
// CANCEL WAITING CUSTOMER
// =====================================

queueList.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                ".cancel-queue-btn"
            );


        if (!button) {
            return;
        }


        const queueId =
            button.dataset.queueId;


        const confirmCancel =
            confirm(
                "Are you sure you want to cancel this waiting customer?"
            );


        if (!confirmCancel) {
            return;
        }


        button.disabled = true;

        button.textContent =
            "Cancelling...";


        fetch(
            `http://localhost:3000/queues/${queueId}/cancel`,
            {
                method: "PATCH",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        )

        .then(async response => {

            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to cancel customer."
                );

            }


            return data;

        })

        .then(() => {

            alert(
                "Customer cancelled successfully!"
            );


            loadQueueData();

        })

        .catch(error => {

            console.error(
                "Cancellation error:",
                error
            );


            alert(error.message);


            button.disabled = false;

            button.textContent =
                "Cancel";

        });

    }
);

businessQrBtn.addEventListener(
    "click",
    function () {

        if (!businessSlug) {
            alert(
                "Business information is still loading."
            );
            return;
        }

        const customerUrl =
            `${window.location.origin}/frontend/customer.html?business=${businessSlug}`;

        qrCodeContainer.innerHTML = `
            <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(customerUrl)}"
                alt="Business QR Code"
            >
        `;

        const business =
            JSON.parse(
                localStorage.getItem("queuelessBusiness")
            );

        if (business) {
            qrBusinessName.textContent =
                business.business_name;

            qrBusinessLocation.textContent =
                business.location || "Location not provided";
        }

        qrCustomerUrl.textContent =
            customerUrl;

        qrModal.classList.add("show");
    }
);

sidebarQrBtn.addEventListener(
    "click",
    function (event) {

        event.preventDefault();

        businessQrBtn.click();

    }
);
qrModalClose.addEventListener(
    "click",
    function () {
        qrModal.classList.remove("show");
    }
);

qrModal.addEventListener(
    "click",
    function (event) {

        if (event.target === qrModal) {
            qrModal.classList.remove("show");
        }

    }
);

const manageStaffBtn =
    document.getElementById("manageStaffBtn");

manageStaffBtn.addEventListener(
    "click",
    function () {
        window.location.href = "staff.html";
    }
);

// =========================
// BUSINESS SETTINGS
// =========================

const businessSettingsBtn =
    document.getElementById("businessSettingsBtn");

const settingsModal =
    document.getElementById("settingsModal");

const settingsModalClose =
    document.getElementById("settingsModalClose");

const darkModeToggle =
    document.getElementById("darkModeToggle");

    const businessSettingsForm =
    document.getElementById(
        "businessSettingsForm"
    );

const settingsBusinessName =
    document.getElementById(
        "settingsBusinessName"
    );

const settingsPhone =
    document.getElementById(
        "settingsPhone"
    );

const settingsLocation =
    document.getElementById(
        "settingsLocation"
    );

const settingsMessage =
    document.getElementById(
        "settingsMessage"
    );

const settingsSaveBtn =
    document.getElementById(
        "settingsSaveBtn"
    );


// Open settings modal

businessSettingsBtn.addEventListener(
    "click",
    function () {

        settingsModal.classList.add("show");

    }
);


// Close settings modal

settingsModalClose.addEventListener(
    "click",
    function () {

        settingsModal.classList.remove("show");

    }
);


// Close when clicking outside the modal

settingsModal.addEventListener(
    "click",
    function (event) {

        if (event.target === settingsModal) {

            settingsModal.classList.remove("show");

        }

    }
);


// Apply saved theme

const savedTheme =
    localStorage.getItem("queuelessTheme");

if (savedTheme === "dark") {

    document.body.classList.add("dark-mode");

    darkModeToggle.checked = true;

}


// Toggle dark mode

darkModeToggle.addEventListener(
    "change",
    function () {

        if (darkModeToggle.checked) {

            document.body.classList.add("dark-mode");

            localStorage.setItem(
                "queuelessTheme",
                "dark"
            );

        } else {

            document.body.classList.remove("dark-mode");

            localStorage.setItem(
                "queuelessTheme",
                "light"
            );

        }

    }
);

const sidebarSettingsBtn =
    document.getElementById("sidebarSettingsBtn");

sidebarSettingsBtn.addEventListener(
    "click",
    function (event) {

        event.preventDefault();

        settingsModal.classList.add("show");

    }
);

// =========================
// SAVE BUSINESS SETTINGS
// =========================

businessSettingsForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const businessName =
            settingsBusinessName.value.trim();

        const phone =
            settingsPhone.value.trim();

        const location =
            settingsLocation.value.trim();


        // =========================
        // VALIDATION
        // =========================

        if (
            businessName === "" ||
            phone === "" ||
            location === ""
        ) {

            settingsMessage.textContent =
                "Please fill in all business information.";

            settingsMessage.className =
                "settings-message error";

            return;
        }


        // =========================
        // DISABLE BUTTON
        // =========================

        settingsSaveBtn.disabled = true;

        settingsSaveBtn.textContent =
            "Saving...";

        settingsMessage.textContent =
            "";


        // =========================
        // SEND UPDATE TO BACKEND
        // =========================

        fetch(
            "http://localhost:3000/my-business",
            {

                method: "PATCH",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${token}`

                },

                body: JSON.stringify({

                    business_name:
                        businessName,

                    phone:
                        phone,

                    location:
                        location

                })

            }
        )

        .then(async response => {

            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to update business information."
                );

            }


            return data;

        })

        .then(data => {

            console.log(
                "Business information updated:",
                data
            );


            const updatedBusiness =
                data.business;


            // =========================
            // UPDATE DASHBOARD NAME
            // =========================

            sidebarBusinessName.textContent =
                updatedBusiness.business_name;

            topbarBusinessName.textContent =
                updatedBusiness.business_name;


            // =========================
            // UPDATE LOCAL STORAGE
            // =========================

            localStorage.setItem(
                "queuelessBusiness",
                JSON.stringify(
                    updatedBusiness
                )
            );


            // =========================
            // SUCCESS MESSAGE
            // =========================

            settingsMessage.textContent =
                "Business information updated successfully!";

            settingsMessage.className =
                "settings-message success";


            // =========================
            // KEEP FORM UPDATED
            // =========================

            settingsBusinessName.value =
                updatedBusiness.business_name;

            settingsPhone.value =
                updatedBusiness.phone;

            settingsLocation.value =
                updatedBusiness.location;

        })

        .catch(error => {

            console.error(
                "Business settings error:",
                error
            );


            settingsMessage.textContent =
                error.message ||
                "Could not update business information.";

            settingsMessage.className =
                "settings-message error";

        })

        .finally(() => {

            settingsSaveBtn.disabled =
                false;

            settingsSaveBtn.textContent =
                "Save Changes";

        });

    }
);

// =========================
// SIGN OUT
// =========================

const signOutBtn =
    document.getElementById(
        "signOutBtn"
    );

signOutBtn.addEventListener(
    "click",
    function (event) {

        event.preventDefault();

        const confirmLogout =
            confirm(
                "Are you sure you want to sign out?"
            );

        if (!confirmLogout) {
            return;
        }


        // Remove login session

        localStorage.removeItem(
            "queuelessToken"
        );

        localStorage.removeItem(
            "queuelessBusiness"
        );


        // Return to login page

        window.location.href =
            "busi_login.html";

    }
);

// =========================
// NOTIFICATIONS
// =========================

const notificationBtn =
    document.getElementById("notificationBtn");

const notificationPanel =
    document.getElementById("notificationPanel");

const notificationBadge =
    document.getElementById("notificationBadge");

const notificationList =
    document.getElementById("notificationList");

const markNotificationsRead =
    document.getElementById("markNotificationsRead");


// Add a new notification
function addNotification(customer) {

    notifications.unshift({
    id: Date.now(),
    type: "new_customer",

    queueId: customer.id,

    title: "New customer joined",

    message:
        `${customer.customer_name} joined the queue with ticket ${customer.ticket}.`,

    time: "Just now"
});

    unreadNotificationCount++;

    updateNotificationBadge();

    renderNotifications();

    // Automatically open the notification panel
    notificationPanel.classList.add("show");
}


// Update notification badge
function updateNotificationBadge() {

    if (unreadNotificationCount > 0) {

        notificationBadge.textContent =
            unreadNotificationCount;

    } else {

        notificationBadge.textContent = "";

    }
}


// Render notifications
function renderNotifications() {

    if (notifications.length === 0) {

        notificationList.innerHTML = `
            <div class="notification-empty">
                <div class="notification-empty-icon">✓</div>

                <strong>You're all caught up</strong>

                <p>
                    New queue activity will appear here.
                </p>
            </div>
        `;

        return;
    }


    notificationList.innerHTML = "";


    notifications.forEach(notification => {

        const item =
            document.createElement("div");

        item.className =
      "notification-item";

      item.dataset.queueId =
      notification.queueId;

      item.style.cursor =
       "pointer";


        item.innerHTML = `
            <div class="notification-icon">
                👤
            </div>

            <div class="notification-content">

                <strong>
                    ${notification.title}
                </strong>

                <p>
                    ${notification.message}
                </p>

                <span class="notification-time">
                    ${notification.time}
                </span>

            </div>
        `;


        notificationList.appendChild(item);

    });
}

// Click a notification to find the customer
notificationList.addEventListener(
    "click",
    function (event) {

        const notification =
            event.target.closest(".notification-item");

        if (!notification) {
            return;
        }

        const queueId =
            notification.dataset.queueId;

        if (!queueId) {
            return;
        }

        // Close notification panel
        notificationPanel.classList.remove("show");

        // Scroll to the queue section
        const queueSection =
            document.getElementById("queueSection");

        if (queueSection) {

            queueSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

        // Find the corresponding queue row
        const queueRow =
            document.querySelector(
                `[data-queue-id="${queueId}"]`
            );

        if (queueRow) {

            queueRow.classList.add(
                "queue-notification-highlight"
            );

            setTimeout(function () {

                queueRow.classList.remove(
                    "queue-notification-highlight"
                );

            }, 3000);

        }

    }
);


// Open / close notification panel
notificationBtn.addEventListener(
    "click",
    function (event) {

        event.stopPropagation();

        notificationPanel.classList.toggle("show");

    }
);


// Prevent clicks inside panel from closing it
notificationPanel.addEventListener(
    "click",
    function (event) {

        event.stopPropagation();

    }
);


// Close when clicking outside
document.addEventListener(
    "click",
    function () {

        notificationPanel.classList.remove("show");

    }
);


// Mark all notifications as read
markNotificationsRead.addEventListener(
    "click",
    function () {

        unreadNotificationCount = 0;

        updateNotificationBadge();

        notificationPanel.classList.remove("show");

    }
);


// Start with an empty notification badge
updateNotificationBadge();
const token = localStorage.getItem("queuelessToken");

let businessId = null;

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

        sidebarBusinessName.textContent =
            business.business_name;

        topbarBusinessName.textContent =
            business.business_name;

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
        // UPDATE QUEUE TABLE
        // =====================================

        renderQueueTable(queues);

    })

    .catch(error => {

        console.error("Queue loading error:", error);

    });

}


// =====================================
// RENDER CURRENTLY SERVING
// =====================================

function renderCurrentlyServing(serving) {

    currentlyServingList.innerHTML = "";

    servingStaffCount.textContent = serving.length;


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

        const card = document.createElement("div");

        card.className = "serving-customer-card";


        // Ticket
        const ticket = document.createElement("div");

        ticket.className = "serving-ticket";

        ticket.textContent = customer.ticket;


        // Customer information
        const customerInfo = document.createElement("div");

        customerInfo.className = "serving-customer-info";

        customerInfo.innerHTML = `
            <strong>${customer.customer_name}</strong>

            <span>
                People: ${customer.people ?? "—"}
            </span>

           <span>Staff: ${customer.staff_name ?? "Unassigned"}</span>
        `;


        // Status
        const status = document.createElement("span");

        status.className = "serving-status";

        status.textContent = "Serving";


        // Complete button
        const completeBtn = document.createElement("button");

        completeBtn.className = "serving-complete-btn";

        completeBtn.textContent = "Complete";

        completeBtn.dataset.queueId = customer.id;


        // Card top
        const cardTop = document.createElement("div");

        cardTop.className = "serving-card-top";

        cardTop.appendChild(ticket);
        cardTop.appendChild(status);


        // Card bottom
        const cardBottom = document.createElement("div");

        cardBottom.className = "serving-card-bottom";

        cardBottom.appendChild(customerInfo);
        cardBottom.appendChild(completeBtn);


        // Build card
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

        const row = document.createElement("tr");


        // Ticket
        const ticketCell = document.createElement("td");

        ticketCell.textContent = customer.ticket;


        // Customer name
        const nameCell = document.createElement("td");

        nameCell.textContent = customer.customer_name;


        // Number of people
        const peopleCell = document.createElement("td");

        peopleCell.textContent =
            customer.people ?? "—";


        // Status
        const statusCell = document.createElement("td");

        const statusBadge = document.createElement("span");

        statusBadge.textContent =
            customer.status;

        statusBadge.className =
            "status-badge " + customer.status;

        statusCell.appendChild(statusBadge);


        // Actions
        const actionCell = document.createElement("td");


        // WAITING → Cancel
        if (customer.status === "waiting") {

            const cancelBtn =
                document.createElement("button");

            cancelBtn.textContent = "Cancel";

            cancelBtn.className =
                "dashboard-cancel-btn cancel-queue-btn";

            cancelBtn.dataset.queueId =
                customer.id;

            actionCell.appendChild(cancelBtn);

        }


        // SERVING → Complete
        else if (customer.status === "serving") {

            const completeBtn =
                document.createElement("button");

            completeBtn.textContent = "Complete";

            completeBtn.className =
                "complete-queue-btn";

            completeBtn.dataset.queueId =
                customer.id;

            actionCell.appendChild(completeBtn);

        }


        // COMPLETED / CANCELLED
        else {

            actionCell.textContent = "—";

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


// Refresh queue every 5 seconds
setInterval(function () {

    loadQueueData();

}, 5000);


// =====================================
// SERVE NEXT CUSTOMER
// =====================================

const serveNextBtn =
    document.getElementById("serveNextBtn");


serveNextBtn.addEventListener("click", function () {

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
                "Authorization": `Bearer ${token}`
            }
        }
    )

    .then(response => {

        return response.json().then(data => {

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

});


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
                    "Authorization": `Bearer ${token}`
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
                    "Authorization": `Bearer ${token}`
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
                    "Authorization": `Bearer ${token}`
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
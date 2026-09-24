const token = localStorage.getItem("queuelessToken");

// Check if the user is logged in
if (!token) {
    window.location.href = "busi_login.html";
}


// DASHBOARD ELEMENTS

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

const currentTicket =
    document.getElementById("currentTicket");

const queueList =
    document.getElementById("queueList");

const currentCustomerTicket =
    document.getElementById("currentCustomerTicket");

const currentCustomerName =
    document.getElementById("currentCustomerName");

const currentCustomerPeople =
    document.getElementById("currentCustomerPeople");

const currentCustomerStatus =
    document.getElementById("currentCustomerStatus");


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

        // Count customers by status
        const waiting = queues.filter(
            customer => customer.status === "waiting"
        );

        const serving = queues.filter(
            customer => customer.status === "serving"
        );

        const completed = queues.filter(
            customer => customer.status === "completed"
        );

        // Update dashboard statistics
        waitingCount.textContent = waiting.length;

        servingCount.textContent = serving.length;

        completedCount.textContent = completed.length;

        // Update current customer
        updateCurrentCustomer(serving);

        // Update queue table
        renderQueueTable(queues);

    })

    .catch(error => {

        console.error("Queue loading error:", error);

    });

}


// =====================================
// UPDATE CURRENT CUSTOMER
// =====================================

function updateCurrentCustomer(serving) {

    if (serving.length === 0) {

        currentTicket.textContent = "—";

        currentCustomerTicket.textContent = "—";

        currentCustomerName.textContent = "No customer being served";

        currentCustomerPeople.textContent = "—";

        currentCustomerStatus.textContent = "Waiting for next customer";

        return;

    }

    const customer = serving[0];

    currentTicket.textContent = customer.ticket;

    currentCustomerTicket.textContent = customer.ticket;

    currentCustomerName.textContent =
        customer.customer_name;

    currentCustomerPeople.textContent =
        customer.people ?? "—";

    currentCustomerStatus.textContent =
        customer.status;

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

        const ticketCell = document.createElement("td");
        ticketCell.textContent = customer.ticket;

        const nameCell = document.createElement("td");
        nameCell.textContent = customer.customer_name;

        const peopleCell = document.createElement("td");
        peopleCell.textContent = customer.people ?? "—";

        const statusCell = document.createElement("td");

        const statusBadge = document.createElement("span");

        statusBadge.textContent = customer.status;

        statusBadge.className =
            "status-badge " + customer.status;

        statusCell.appendChild(statusBadge);

        const actionCell = document.createElement("td");
        actionCell.textContent = "—";

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


// Refresh queue data every 5 seconds

setInterval(function () {

    loadQueueData();

}, 5000);
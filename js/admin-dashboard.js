
const API_URL = "http://localhost:3000";

const token = sessionStorage.getItem("queuelessAdminToken");

const message = document.getElementById("adminDashboardMessage");
const tableBody = document.getElementById("recoveryRequestsTableBody");

const pendingCount = document.getElementById("pendingRequestsCount");
const approvedCount = document.getElementById("approvedRequestsCount");
const rejectedCount = document.getElementById("rejectedRequestsCount");
const sidebarPendingCount = document.getElementById("sidebarPendingCount");

const refreshButton = document.getElementById("refreshRequestsButton");
const logoutButton = document.getElementById("adminLogoutButton");

let recoveryRequests = [];

// Protect the dashboard from users without an admin session.
if (!token) {
    window.location.replace("admin.html");
} else {
    loadRecoveryRequests();
}

// Load pending recovery requests from the protected backend.
async function loadRecoveryRequests() {
    message.textContent = "Loading recovery requests...";
    tableBody.innerHTML = `
        <tr>
            <td colspan="5" class="admin-table-empty">
                Loading requests...
            </td>
        </tr>
    `;

    refreshButton.disabled = true;

    try {
        const response = await fetch(`${API_URL}/admin/recovery-requests`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.status === 401 || response.status === 403) {
            sessionStorage.removeItem("queuelessAdminToken");
            window.location.replace("admin.html");
            return;
        }

        if (!response.ok) {
            throw new Error(data.message || "Could not load recovery requests.");
        }

        // The API returns pending requests as an array.
        recoveryRequests = Array.isArray(data) ? data : data.requests;

        if (!Array.isArray(recoveryRequests)) {
            throw new Error("Unexpected response from the server.");
        }

        renderRecoveryRequests();

        message.textContent = recoveryRequests.length
            ? "Recovery requests loaded successfully."
            : "No pending recovery requests at the moment.";

        message.style.color = "#718096";

        // This endpoint only returns pending requests.
        pendingCount.textContent = recoveryRequests.length;
        sidebarPendingCount.textContent = recoveryRequests.length;

        // These counts are not available from the pending-only endpoint.
        approvedCount.textContent = "—";
        rejectedCount.textContent = "—";

    } catch (error) {
        message.textContent = error.message;
        message.style.color = "#dc2626";

        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="admin-table-empty">
                    Unable to load requests. Check your backend connection.
                </td>
            </tr>
        `;
    } finally {
        refreshButton.disabled = false;
    }
}

// Safely display the pending requests in the table.
function renderRecoveryRequests() {
    tableBody.replaceChildren();

    if (recoveryRequests.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="admin-table-empty">
                    No pending recovery requests found.
                </td>
            </tr>
        `;
        return;
    }

    recoveryRequests.forEach((request) => {
        const row = document.createElement("tr");

        const businessCell = document.createElement("td");
        businessCell.textContent = request.business_name || "Unknown business";

        const phoneCell = document.createElement("td");
        phoneCell.textContent = request.business_phone || "Not provided";

        const dateCell = document.createElement("td");
        const requestDate = new Date(request.requested_at);
        dateCell.textContent = Number.isNaN(requestDate.getTime())
            ? "Unknown date"
            : requestDate.toLocaleString();

        const statusCell = document.createElement("td");
        statusCell.textContent = request.status || "pending";

        const actionCell = document.createElement("td");
        actionCell.textContent = "Actions will be added next";

        row.append(
            businessCell,
            phoneCell,
            dateCell,
            statusCell,
            actionCell
        );

        tableBody.appendChild(row);
    });
}

// Refresh the pending request list.
refreshButton.addEventListener("click", loadRecoveryRequests);

// Sign out and clear the current browser-tab session.
logoutButton.addEventListener("click", () => {
    sessionStorage.removeItem("queuelessAdminToken");
    window.location.replace("admin.html");
});

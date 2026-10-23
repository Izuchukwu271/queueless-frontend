
const API_URL ="https://queueless-backend-k0hq.onrender.com";

const adminLoginForm = document.getElementById("adminLoginForm");
const adminLoginMessage = document.getElementById("adminLoginMessage");
const adminLoginButton = document.getElementById("adminLoginButton");

adminLoginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("adminUsername").value.trim();
    const password = document.getElementById("adminPassword").value;

    adminLoginMessage.textContent = "";
    adminLoginButton.disabled = true;
    adminLoginButton.textContent = "Signing in...";

    try {
        const response = await fetch(`${API_URL}/admin/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Login failed. Check your credentials.");
        }

        if (!data.token) {
            throw new Error("The server did not return an admin token.");
        }

        // Keep the admin session for this browser tab.
        sessionStorage.setItem("queuelessAdminToken", data.token);

        adminLoginMessage.textContent = "Login successful! Opening dashboard...";
        adminLoginMessage.style.color = "#16803d";

        window.location.href = "admin-dashboard.html";

    } catch (error) {
        adminLoginMessage.textContent =
            error.message === "Failed to fetch"
                ? "Cannot connect to the backend. Make sure your backend is running."
                : error.message;

        adminLoginMessage.style.color = "#dc2626";
    } finally {
        adminLoginButton.disabled = false;
        adminLoginButton.textContent = "Sign In to Dashboard";
    }
});

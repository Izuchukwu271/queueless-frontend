
const businessRegisterForm =
    document.getElementById("businessRegisterForm");

// =========================================
// BUSINESS REGISTRATION
// =========================================

businessRegisterForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    // Get form values
    const businessName =
        document.getElementById("businessName").value.trim();

    const phone =
        document.getElementById("phone").value.trim();

    const email =
        document.getElementById("email").value.trim().toLowerCase();

    const location =
        document.getElementById("location").value.trim();

    const password =
        document.getElementById("password").value;

    // Basic validation
    if (!businessName || !phone || !email || !location || !password) {
        alert("Please fill in all fields.");
        return;
    }

    if (password.length < 6) {
        alert("Password must be at least 6 characters long.");
        return;
    }

    // Use your deployed backend in production.
    // Keep localhost if you are testing with your local backend.
    const API_BASE_URL = "https://queueless-backend-k0hq.onrender.com";

    try {
        const response = await fetch(`${API_BASE_URL}/businesses`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                business_name: businessName,
                phone: phone,
                email: email,
                location: location,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Registration failed."
            );
        }

        console.log("Business registration response:", data);

        alert(
            data.message ||
            "Registration received. Please check your email for verification instructions."
        );

        // Do not treat registration as email verification.
        // The backend must verify the email before allowing verified access.
        window.location.href = "busi_login.html";

    } catch (error) {
        console.error("Registration error:", error);
        alert(error.message || "Unable to register. Please try again.");
    }
});

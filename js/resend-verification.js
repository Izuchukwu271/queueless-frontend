
const resendForm = document.getElementById("resendVerificationForm");
const resendEmailInput = document.getElementById("resendEmail");
const resendButton = document.getElementById("resendVerificationButton");
const resendMessage = document.getElementById("resendVerificationMessage");

const API_URL = "https://queueless-backend-k0hq.onrender.com";

resendForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = resendEmailInput.value.trim().toLowerCase();

    if (!email) {
        resendMessage.textContent = "Please enter your business email.";
        return;
    }

    resendButton.disabled = true;
    resendButton.textContent = "Sending...";
    resendMessage.textContent = "";

    try {
        const response = await fetch(`${API_URL}/resend-verification`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Unable to request a verification email."
            );
        }

        resendMessage.textContent =
            data.message ||
            "If your account needs verification, a new email will be sent.";

    } catch (error) {
        console.error("Resend verification error:", error);

        resendMessage.textContent =
            "Could not contact the server. Make sure your backend is running and try again.";

    } finally {
        resendButton.disabled = false;
        resendButton.textContent = "Resend Verification Email";
    }
});

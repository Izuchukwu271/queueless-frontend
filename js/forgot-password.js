
const recoveryForm = document.getElementById("forgotPasswordForm");
const recoveryPhone = document.getElementById("recoveryPhone");
const recoveryMessage = document.getElementById("recoveryMessage");

const API_URL =
    "https://queueless-backend-k0hq.onrender.com/password-recovery/request";

recoveryForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const phone = recoveryPhone.value.trim();

    // Validate the phone number before sending the request.
    if (!phone) {
        recoveryMessage.textContent =
            "Please enter your registered business phone number.";
        recoveryMessage.style.color = "#dc2626";
        recoveryPhone.focus();
        return;
    }

    const submitButton = recoveryForm.querySelector(
        'button[type="submit"]'
    );

    const originalButtonText = submitButton.innerHTML;

    submitButton.disabled = true;
    submitButton.innerHTML = "Sending request...";
    recoveryMessage.textContent = "";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ phone })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Unable to submit your request."
            );
        }

        recoveryMessage.textContent = data.message;
        recoveryMessage.style.color = "#15803d";

        recoveryForm.reset();

    } catch (error) {
        console.error("Password recovery error:", error);

        recoveryMessage.textContent =
            "We couldn't connect to the recovery service. Please try again.";

        recoveryMessage.style.color = "#dc2626";

    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
});

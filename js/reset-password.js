
const resetForm = document.getElementById("resetPasswordForm");
const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");
const resetMessage = document.getElementById("resetMessage");

const API_URL =
      "http://localhost:3000/password-reset/complete";

const params = new URLSearchParams(window.location.search);
const resetToken = params.get("token");

function showResetMessage(message, color = "#dc2626") {
    resetMessage.textContent = message;
    resetMessage.style.color = color;
}

if (!resetToken || !/^[a-f0-9]{64}$/i.test(resetToken)) {
    resetForm.querySelector('button[type="submit"]').disabled = true;

    showResetMessage(
        "This reset link is missing or invalid. Please request password recovery again."
    );
}

resetForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!resetToken || !/^[a-f0-9]{64}$/i.test(resetToken)) {
        showResetMessage("Your reset link is invalid. Request a new recovery link.");
        return;
    }

    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (newPassword.length < 12 || newPassword.length > 72) {
        showResetMessage(
            "Your password must contain between 12 and 72 characters."
        );
        return;
    }

    if (newPassword !== confirmPassword) {
        showResetMessage("The passwords do not match.");
        confirmPasswordInput.focus();
        return;
    }

    const submitButton = resetForm.querySelector(
        'button[type="submit"]'
    );

    const originalButtonText = submitButton.innerHTML;

    submitButton.disabled = true;
    submitButton.innerHTML = "Resetting password...";
    showResetMessage("");

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                token: resetToken,
                newPassword,
                confirmPassword
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Unable to reset your password."
            );
        }

        resetForm.reset();
        newPasswordInput.disabled = true;
        confirmPasswordInput.disabled = true;

        showResetMessage(
            "Password reset successfully! You can now sign in.",
            "#15803d"
        );

        // Remove the token from the visible URL after success.
        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );

    } catch (error) {
        console.error("Password reset error:", error);

        showResetMessage(
            error.message ||
            "Unable to reset your password. Please try again."
        );

    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
});

const businessLoginForm =
    document.getElementById("businessLoginForm");


// =========================================
// BUSINESS LOGIN
// =========================================

businessLoginForm.addEventListener("submit", function (event) {

    event.preventDefault();


    const phone =
        document.getElementById("phone").value.trim();

    const password =
        document.getElementById("password").value;


    // Basic validation

    if (!phone || !password) {

        alert("Please enter your phone number and password.");

        return;

    }


    // Send login request to backend

    fetch("http://localhost:3000/login", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            phone: phone,

            password: password

        })

    })

        .then(response => {

            if (!response.ok) {

                throw new Error(
                    "Invalid phone number or password."
                );

            }

            return response.json();

        })

        .then(data => {

            console.log("Login successful:", data);


            // Save JWT token

            localStorage.setItem(
                "queuelessToken",
                data.token
            );


            // Save business information

            localStorage.setItem(
                "queuelessBusiness",
                JSON.stringify(data.business)
            );


            // Go to business dashboard

            window.location.href = "business.html";

        })

        .catch(error => {

            console.error("Login error:", error);

            alert(error.message);

        });

});
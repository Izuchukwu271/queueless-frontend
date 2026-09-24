const businessRegisterForm =
    document.getElementById("businessRegisterForm");


// =========================================
// BUSINESS REGISTRATION
// =========================================

businessRegisterForm.addEventListener("submit", function (event) {

    event.preventDefault();


    // Get form values

    const businessName =
        document.getElementById("businessName").value.trim();

    const phone =
        document.getElementById("phone").value.trim();

    const location =
        document.getElementById("location").value.trim();

    const password =
        document.getElementById("password").value;


    // Basic validation

    if (!businessName || !phone || !location || !password) {

        alert("Please fill in all fields.");

        return;

    }


    // Send registration request

    fetch("http://localhost:3000/businesses", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            business_name: businessName,

            phone: phone,

            location: location,

            password: password

        })

    })

        .then(response => {

            if (!response.ok) {

                return response.json().then(data => {

                    throw new Error(
                        data.message || "Registration failed."
                    );

                });

            }

            return response.json();

        })

        .then(data => {

            console.log(
                "Business registered successfully:",
                data
            );


            alert(
                "Business account created successfully!"
            );


            // Send business owner to login

            window.location.href = "busi_login.html";

        })

        .catch(error => {

            console.error(
                "Registration error:",
                error
            );


            alert(error.message);

        });

});
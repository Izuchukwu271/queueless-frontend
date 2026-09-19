const businessName = document.getElementById("businessName");

const joinQueueBtn = document.getElementById("joinQueueBtn");
const joinFormContainer = document.getElementById("joinFormContainer");
const closeFormBtn = document.getElementById("closeFormBtn");

const joinQueueForm = document.getElementById("joinQueueForm");

const ticketResult = document.getElementById("ticketResult");
const ticketNumber = document.getElementById("ticketNumber");
const peopleAhead = document.getElementById("peopleAhead");
const ticketStatus = document.getElementById("ticketStatus");

const urlParams = new URLSearchParams(window.location.search);

const slug = urlParams.get("business");


// =========================
// LOAD BUSINESS
// =========================

if (!slug) {

    businessName.textContent = "Business not found";

} else {

    fetch(`http://localhost:3000/join/${slug}`)
        .then(response => {

            if (!response.ok) {
                throw new Error("Business not found");
            }

            return response.json();

        })

        .then(data => {

            businessName.textContent =
                data.business.business_name;

        })

        .catch(error => {

            console.error(error);

            businessName.textContent =
                "Business not found";

        });

}


// =========================
// OPEN JOIN FORM
// =========================

joinQueueBtn.addEventListener("click", function () {

    joinFormContainer.style.display = "flex";

});


// =========================
// CLOSE JOIN FORM
// =========================

closeFormBtn.addEventListener("click", function () {

    joinFormContainer.style.display = "none";

});


// =========================
// JOIN QUEUE
// =========================

joinQueueForm.addEventListener("submit", function (event) {

    event.preventDefault();


    const customerName =
        document.getElementById("customerName").value.trim();

    const customerPhone =
        document.getElementById("customerPhone").value.trim();

    const people =
        Number(document.getElementById("people").value);


    if (!customerName || !customerPhone || people < 1) {

        alert("Please enter valid information.");

        return;

    }


    fetch(`http://localhost:3000/join/${slug}`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            customer_name: customerName,

            phone: customerPhone,

            people: people

        })

    })

        .then(response => {

            if (!response.ok) {
                throw new Error("Failed to join queue.");
            }

            return response.json();

        })

        .then(data => {

            console.log("Queue joined successfully:", data);


            // Hide the form

            joinQueueForm.style.display = "none";


            // Show the ticket

            ticketResult.style.display = "block";


            // Display ticket information

            ticketNumber.textContent =
                data.queue.ticket;


            peopleAhead.textContent =
                "—";


            ticketStatus.textContent =
                data.queue.status;

        })

        .catch(error => {

            console.error(error);

            alert(
                "Something went wrong while joining the queue."
            );

        });

});
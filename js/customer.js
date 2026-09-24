const businessName = document.getElementById("businessName");
const businessCardName = document.getElementById("businessCardName");
const businessLocation = document.getElementById("businessLocation");
const businessPhone = document.getElementById("businessPhone");

const joinQueueForm = document.getElementById("joinQueueForm");
const ticketResult = document.getElementById("ticketResult");

const ticketNumber = document.getElementById("ticketNumber");
const peopleAhead = document.getElementById("peopleAhead");
const ticketStatus = document.getElementById("ticketStatus");
const queueUpdateMessage = document.getElementById("queueUpdateMessage");

const urlParams = new URLSearchParams(window.location.search);
const slug = urlParams.get("business");

let queueUpdateInterval;


// LOAD BUSINESS INFORMATION

if (!slug) {

    businessName.textContent = "Business not found";
    businessCardName.textContent = "Business not found";
    businessLocation.textContent = "Unavailable";
    businessPhone.textContent = "Unavailable";

} else {

    fetch(`http://localhost:3000/join/${slug}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Business not found");
            }

            return response.json();
        })
        .then(data => {

            const business = data.business;

            businessName.textContent = business.business_name;
            businessCardName.textContent = business.business_name;

            businessLocation.textContent =
                business.location || "Location unavailable";

            businessPhone.textContent =
                business.phone || "Phone unavailable";

        })
        .catch(error => {

            console.error("Business loading error:", error);

            businessName.textContent = "Business not found";
            businessCardName.textContent = "Business not found";
            businessLocation.textContent = "Unavailable";
            businessPhone.textContent = "Unavailable";

        });

}


// JOIN QUEUE

joinQueueForm.addEventListener("submit", function (event) {

    event.preventDefault();

    if (!slug) {
        alert("Business not found.");
        return;
    }

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

    const submitButton =
        joinQueueForm.querySelector('button[type="submit"]');

    submitButton.disabled = true;
    submitButton.textContent = "Joining queue...";

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

            joinQueueForm.style.display = "none";
            ticketResult.style.display = "block";

            ticketNumber.textContent = data.queue.ticket;

            updateQueueStatus(data.queue.ticket);

            clearInterval(queueUpdateInterval);

            queueUpdateInterval = setInterval(function () {
                updateQueueStatus(data.queue.ticket);
            }, 5000);

        })

        .catch(error => {

            console.error("Queue error:", error);

            alert("Something went wrong while joining the queue.");

        })

        .finally(() => {

            submitButton.disabled = false;
            submitButton.innerHTML = "<span>▣</span> Join Queue";

        });

});


// UPDATE QUEUE STATUS

function updateQueueStatus(ticket) {

    fetch(`http://localhost:3000/join/${slug}/queue/${ticket}`)

        .then(response => {

            if (!response.ok) {
                throw new Error("Failed to get queue status.");
            }

            return response.json();

        })

        .then(data => {

            console.log("Queue status updated:", data);

            peopleAhead.textContent = data.people_ahead;

            ticketStatus.textContent = data.status;

            queueUpdateMessage.textContent = "Updated just now";

            if (
                data.status === "completed" ||
                data.status === "cancelled"
            ) {
                clearInterval(queueUpdateInterval);
            }

        })

        .catch(error => {

            console.error("Queue update error:", error);

            queueUpdateMessage.textContent =
                "Unable to update right now.";

        });

}
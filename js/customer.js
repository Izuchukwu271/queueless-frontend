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
const leaveQueueBtn = document.getElementById("leaveQueueBtn");

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
            localStorage.setItem(
            "queueLessTicket",
            JSON.stringify({
            slug: slug,
           ticket: data.queue.ticket
        })
);

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

if (data.status === "waiting") {

    ticketStatus.textContent =
        "You're in the queue";
    ticketStatus.className =
    "ticket-status waiting";    

    if (data.people_ahead === 0) {

        queueUpdateMessage.textContent =
            "You're next! Please get ready.";

    } else if (data.people_ahead === 1) {

        queueUpdateMessage.textContent =
            "1 person is ahead of you.";

    } else {

        queueUpdateMessage.textContent =
            `${data.people_ahead} people are ahead of you.`;

    }

} else if (data.status === "serving") {

    ticketStatus.textContent =
        "You're being served";
    ticketStatus.className =
    "ticket-status serving";    

    queueUpdateMessage.textContent =
        "Please proceed to the service area.";

} else if (data.status === "completed") {

    ticketStatus.textContent =
        "Service completed";
    ticketStatus.className =
    "ticket-status completed";    

    queueUpdateMessage.textContent =
        "Thank you for using QueueLess!";

} else if (data.status === "cancelled") {

    ticketStatus.textContent =
        "Queue cancelled";
    ticketStatus.className =
    "ticket-status cancelled";    

    queueUpdateMessage.textContent =
        "Your queue ticket has been cancelled.";

} else {

    ticketStatus.textContent =
        data.status;

    queueUpdateMessage.textContent =
        "Updated just now";

}
            if (
    data.status === "completed" ||
    data.status === "cancelled"
) {

    clearInterval(queueUpdateInterval);

    localStorage.removeItem("queueLessTicket");
}
        })

        .catch(error => {

            console.error("Queue update error:", error);

            queueUpdateMessage.textContent =
                "Unable to update right now.";

        });

}

// LEAVE QUEUE

leaveQueueBtn.addEventListener("click", function () {

    const ticket = ticketNumber.textContent;

    if (!ticket || ticket === "A00") {
        return;
    }

    const confirmLeave = confirm(
        "Are you sure you want to leave the queue?"
    );

    if (!confirmLeave) {
        return;
    }

    leaveQueueBtn.disabled = true;
    leaveQueueBtn.textContent = "Leaving queue...";

    fetch(
        `http://localhost:3000/join/${slug}/queue/${ticket}/cancel`,
        {
            method: "PATCH"
        }
    )
        .then(response => {

            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(
                        data.message || "Failed to leave queue."
                    );
                });
            }

            return response.json();

        })
        .then(data => {

            console.log("Queue cancelled:", data);

            clearInterval(queueUpdateInterval);

            ticketStatus.textContent = "Queue cancelled";
            ticketStatus.className = "ticket-status cancelled";

            peopleAhead.textContent = "0";

            queueUpdateMessage.textContent =
                "You have left the queue.";

            leaveQueueBtn.style.display = "none";

        })
        .catch(error => {

            console.error("Leave queue error:", error);

            alert(error.message);

            leaveQueueBtn.disabled = false;
            leaveQueueBtn.textContent = "Leave Queue";

        });

});

// RESTORE ACTIVE QUEUE TICKET

function restoreQueueTicket() {

    const savedQueue =
        localStorage.getItem("queueLessTicket");

    if (!savedQueue) {
        return;
    }

    try {

        const queueData =
            JSON.parse(savedQueue);

        if (queueData.slug !== slug) {
            return;
        }

        joinQueueForm.style.display = "none";
        ticketResult.style.display = "block";

        ticketNumber.textContent =
            queueData.ticket;

        updateQueueStatus(queueData.ticket);

        clearInterval(queueUpdateInterval);

        queueUpdateInterval = setInterval(function () {

            updateQueueStatus(queueData.ticket);

        }, 5000);

    } catch (error) {

        console.error(
            "Failed to restore queue ticket:",
            error
        );

        localStorage.removeItem("queueLessTicket");

    }
}


// RESTORE TICKET WHEN PAGE LOADS

restoreQueueTicket();
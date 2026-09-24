const token = localStorage.getItem("queuelessToken");

// Check if the user is logged in
if (!token) {
    window.location.href = "busi_login.html";
}

// Fetch the logged-in business information
fetch("http://localhost:3000/my-business", {
    method: "GET",
    headers: {
        "Authorization": `Bearer ${token}`
    }
})
.then(response => {
    if (!response.ok) {
        throw new Error("Failed to load business information.");
    }

    return response.json();
})
.then(data => {
    console.log("Business information:", data);

    // Display the business name
    document.getElementById("sidebarBusinessName").textContent =
    data.business.business_name;

document.getElementById("topbarBusinessName").textContent =
    data.business.business_name;
})
.catch(error => {
    console.error("Error loading business:", error);
});

// Fetch the business queue
fetch("http://localhost:3000/my-queues", {
    method: "GET",
    headers: {
        "Authorization": `Bearer ${token}`
    }
})
.then(response => {
    if (!response.ok) {
        throw new Error("Failed to load queue data.");
    }

    return response.json();
})
.then(data => {
    console.log("Queue data:", data);
})
.catch(error => {
    console.error("Error loading queue:", error);
});
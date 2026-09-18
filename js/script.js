const joinQueueBtn = document.getElementById("joinQueueBtn");
const joinFormContainer = document.getElementById("joinFormContainer");
const closeFormBtn = document.getElementById("closeFormBtn");


joinQueueBtn.addEventListener("click", function () {

    joinFormContainer.style.display = "flex";

});


closeFormBtn.addEventListener("click", function () {

    joinFormContainer.style.display = "none";

});
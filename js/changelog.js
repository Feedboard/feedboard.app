const changelogBtn = document.getElementById("changelogBtn");

changelogBtn.addEventListener("click", function () {
  // FETCHING DATA FROM JSON FILE
  fetch("./data/changelog.json")
    .then((response) => response.json())
    .then((data) => {
      var details = "";

      data.forEach(function (value) {
        details += `
        <div class="d-flex mb-4">
        <span class="bg-body-secondary align-self-start me-2 mt-1 p-1 rounded-circle">
        <img class="" src="./img/check-circle-dark.svg" width="28" height="28" />
        </span>
        <div>
        <p class="fw-semibold">${value.title}</p>
        <p class="small text-secondary mb-2">${value.date}</p>
        <p class="text-secondary">${value.description}</p>
        </div>
        </div>
        `;
      });
      document.getElementById("changelogBody").innerHTML = details;
    });
});

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
          <div class="d-flex flex-column align-items-center">
            <span class="bg-body-secondary align-self-start mt-1 p-1 rounded-circle">
            <img class="" src="./img/check-circle-dark.svg" width="28" height="28" alt="check icon" />
            </span>
            <div class="vr align-self-center h-100 mt-2 bg-body-secondary"></div>
          </div>
        <div class="ms-2">
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

const addNewFeedBtn = document.getElementById("addNewFeedBtn");

addNewFeedBtn.addEventListener("click", function () {
  // FETCHING DATA FROM JSON FILE
  fetch("./data/rss-news.json")
    .then((response) => response.json())
    .then((data) => {
      var details = "";

      data.forEach(function (value) {
        details += `
        <div class="d-flex flex-row px-4 py-3">
          <img class="me-3 rounded-3" src="./img/${value.icon}.svg" width="45" height="45" alt="logo-reddit" />
          <div>
            <p class="fw-semibold">${value.name}</p>
            <p class="text-secondary small">${value.sub}</p>
          </div>
        </div>
        `;
      });
      document.getElementById("tab-list-news").innerHTML = details;
    });

  fetch("./data/rss-tech.json")
    .then((response) => response.json())
    .then((data) => {
      var details = "";

      data.forEach(function (value) {
        details += `
        <div class="d-flex flex-row px-4 py-3">
          <img class="me-3 rounded-3" src="./img/${value.icon}.svg" width="45" height="45" alt="logo-reddit" />
          <div>
            <p class="fw-semibold">${value.name}</p>
            <p class="text-secondary small">${value.sub}</p>
          </div>
        </div>
        `;
      });
      document.getElementById("tab-list-tech").innerHTML = details;
    });
});

const addNewFeedBtn = document.getElementById("addNewFeedBtn");

addNewFeedBtn.addEventListener("click", function () {
  // FETCHING DATA FROM JSON FILE
  fetch("./data/rss-news.json")
    .then((response) => response.json())
    .then((data) => {
      var details = "";

      data.forEach(function (value) {
        details += `
        <div class="d-flex justify-content-between flex-row px-4 py-3 border-bottom">
        <div class="d-flex flex-row">
          <img class="me-3 rounded-3" src="./img/${value.icon}" width="45" height="45" alt="logo-reddit" />
          <div>
            <p class="fw-semibold">${value.name}</p>
            <p class="text-secondary small">${value.sub}</p>
          </div>
        </div>
          <div>
            <button class="btn btn-dark btn-sm" onclick="addNewRssByLink('${value.url}')">Add</button>
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
        <div class="d-flex justify-content-between flex-row px-4 py-3 border-bottom">
        <div class="d-flex flex-row">
          <img class="me-3 rounded-3" src="./img/${value.icon}" width="45" height="45" alt="logo-reddit" />
          <div>
            <p class="fw-semibold">${value.name}</p>
            <p class="text-secondary small">${value.sub}</p>
          </div>
        </div>
          <div>
            <button class="btn btn-dark btn-sm" onclick="addNewRssByLink('${value.url}')">Add</button>
          </div>
        </div>
        `;
      });
      document.getElementById("tab-list-tech").innerHTML = details;
    });

  fetch("./data/rss-crypto.json")
    .then((response) => response.json())
    .then((data) => {
      var details = "";

      data.forEach(function (value) {
        details += `
        <div class="d-flex justify-content-between flex-row px-4 py-3 border-bottom">
        <div class="d-flex flex-row">
          <img class="me-3 rounded-3" src="./img/${value.icon}" width="45" height="45" alt="logo-reddit" />
          <div>
            <p class="fw-semibold">${value.name}</p>
            <p class="text-secondary small">${value.sub}</p>
          </div>
        </div>
          <div>
            <button class="btn btn-dark btn-sm" onclick="addNewRssByLink('${value.url}')">Add</button>
          </div>
        </div>
        `;
      });
      document.getElementById("tab-list-crypto").innerHTML = details;
    });
});

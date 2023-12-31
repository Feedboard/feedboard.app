async function getMediumFeed(username, id) {
  console.log("Loading Medium " + username);
  const mediumUrl = "https://web-production-09ad.up.railway.app/https://www.medium.com/feed/" + username;
  const feedMedium = document.getElementById("feed-medium-" + id);

  await fetch(mediumUrl, {
    headers: {
      "Access-Control-Allow-Origin": mediumUrl,
      "Access-Control-Allow-Headers": "content-type",
    },
  })
    .then((response) => response.text())
    .then((str) => new window.DOMParser().parseFromString(str, "text/xml"))
    .then((data) => {
      const items = data.querySelectorAll("item");
      feedMedium.innerHTML = "";
      let entry = "";
      if (items.length <= 0) {
        console.log("not ok");
        entry += `
        <div class="alert alert-warning d-flex align-items-center border-0 rounded-0 p-2" role="alert">
          <img class="me-2" src="./img/warning-diamond.svg" width="20" height="20" alt="warning icon" />
          <div>
            This Medium account doesn't seem to exist.
          </div>
        </div>
              `;
        feedMedium.innerHTML = entry;
      }

      items.forEach((el) => {
        let title = el.querySelector("title").textContent;
        let link = el.querySelector("link").textContent;
        let creator = el.querySelector("creator").textContent;
        let pubDate = el.querySelector("pubDate").textContent;
        let content = el.querySelector("encoded").textContent;

        let container = document.createElement("div");
        container.innerHTML = content;
        let img = container.querySelector("img").getAttribute("src");

        entry += `
            <a href="${link}" class="list-group-item list-group-item-action" target="_blank">
              ${img ? `<img class="img-fluid rounded-3 mb-2" src="${img}" alt="${title}" loading="lazy" onError="this.onerror=null;this.src='./img/image-placeholder.png';" />` : ""}
              <p class="fw-semibold mb-2">${title}</p>
              <div class="d-flex justify-content-between">
                <p class="text-secondary small">${creator}</p>
                <p class="text-secondary small">${convertTime(pubDate)}</p>
              </div>
            </a>
              `;
      });
      feedMedium.innerHTML = entry;
    });
}

// Add new Medium
const addNewMediumBtn = document.getElementById("addNewMedium");
const newMediumName = document.getElementById("newMediumName");

newMediumName.addEventListener("input", function () {
  checkInputFill(newMediumName, addNewMediumBtn);
});

addNewMediumBtn.addEventListener("click", async function () {
  closeModal("newFeedModal");
  addNewMediumBtn.disabled = true;

  const { data, error } = await client
    .from("feeds")
    .insert([{ feed_name: "medium", feed_type: "medium", feed_options: newMediumName.value, user_id: user_id }])
    .select();

  if (data) {
    showToast(newMediumName.value + " added to your feed");
    const feedContainer = document.getElementById("feedContainer");
    const sidebarContainer = document.getElementById("feedLogoContainer");
    let feed = "";
    let sidebar = "";

    sidebar += `
         <a id="sidebarLogo-${data[0].id}" href="#${data[0].id}" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="${data[0].feed_options}" aria-label="${data[0].feed_options}">
         <img class="rounded-3 m-2 svg-icon" src="./img/logo-medium.svg" alt="medium logo" width="40" height="40" />
         </a>
        `;

    feed += `
        <div id="${data[0].id}" class="feed border-end">
          <div class="feed-header d-flex flex-row justify-content-between bg-body-tertiary border-bottom">
            <div class="d-flex align-items-center">
              <img class="me-2 svg-icon" src="./img/logo-medium.svg" width="20" height="20" alt="medium logo" />
              <p id="mediumName">${data[0].feed_options}</p>
            </div>
            <div class="btn-group">
              <button type="button" class="btn bg-body-tertiary btn-sm p-0 rounded-1 border-0" data-bs-toggle="dropdown" aria-expanded="false">
                <img class="svg-icon" src="./img/dots-three-vertical.svg" width="24" height="24" alt="dots icon" />
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li onclick="getMediumFeed('${data[0].feed_options}', ${data[0].id})"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2 svg-icon" src="./img/reload.svg" width="20" height="20" />Reload</button></li>
                <li onclick="removeMediumFeed(${data[0].id})"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2 svg-icon" src="./img/delete.svg" width="20" height="20" />Remove</button></li>
              </ul>
            </div>
          </div>
          <div id="feed-medium-${data[0].id}" class="list-group list-group-flush feed-body">
            <div class="p-2 placeholder-glow">
              <span class="placeholder placeholder-lg col-6 bg-secondary"></span>
              <span class="placeholder col-7 bg-secondary"></span>
              <span class="placeholder col-4 bg-secondary"></span>
              <span class="placeholder placeholder-sm col-2 bg-secondary"></span>
            </div>
          </div>
        </div>
        `;
    hideEmpty();
    feedContainer.innerHTML += feed;
    sidebarContainer.innerHTML += sidebar;
    scrollToPos(data[0].id);
    getMediumFeed(data[0].feed_options, data[0].id);
  }

  newMediumName.value = "";

  if (error) {
    console.log(error);
  }
  initTooltip();
});

// Remove Medium
async function removeMediumFeed(id) {
  const { error } = await client.from("feeds").delete().eq("id", id);
  if (error) {
    console.log(error);
  } else {
    console.log("Deleted");
    showToast("Feed deleted");
    let feedContainer = document.getElementById(id);
    let sidebarLogo = document.getElementById("sidebarLogo-" + id);
    feedContainer.remove();
    sidebarLogo.remove();
  }
}

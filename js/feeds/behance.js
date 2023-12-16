async function getBehanceFeed(username, id) {
  console.log("Loading Behance " + username);
  const behanceUrl = "https://web-production-09ad.up.railway.app/https://www.behance.net/feeds/user?username=" + username;
  const feedBehance = document.getElementById("feed-behance-" + id);

  await fetch(behanceUrl, {
    headers: {
      "Access-Control-Allow-Origin": behanceUrl,
      "Access-Control-Allow-Headers": "content-type",
    },
  })
    .then((response) => response.text())
    .then((str) => new window.DOMParser().parseFromString(str, "text/xml"))
    .then((data) => {
      const items = data.querySelectorAll("item");
      feedBehance.innerHTML = "";
      let entry = "";
      if (items.length <= 0) {
        console.log("not ok");
        entry += `
        <div class="alert alert-warning d-flex align-items-center border-0 rounded-0 p-2" role="alert">
          <img class="me-2" src="./img/warning-diamond.svg" width="20" height="20" alt="warning icon" />
          <div>
            This Behance account doesn't seem to exist.
          </div>
        </div>
              `;
        feedBehance.innerHTML = entry;
      }

      items.forEach((el) => {
        let title = el.querySelector("title").textContent;
        let link = el.querySelector("link").textContent;
        let pubDate = el.querySelector("pubDate").textContent;
        let content = el.querySelector("encoded").textContent;

        let container = document.createElement("div");
        container.innerHTML = content;
        let img = container.querySelector("img").getAttribute("src");

        entry += `
            <a href="${link}" class="list-group-item list-group-item-action" target="_blank">
              ${img ? `<img class="img-fluid rounded-3 mb-2" src="${img}" alt="${title}" loading="lazy" onError="this.onerror=null;this.src='./img/image-placeholder.png';" />` : ""}
              <p class="fw-semibold mb-2">${title}</p>
              <p class="text-secondary small">${convertHnDate(pubDate)}</p>
            </a>
              `;
      });
      feedBehance.innerHTML = entry;
    });
}

// Add new Behance
const addNewBehanceBtn = document.getElementById("addNewBehance");
const newBehanceName = document.getElementById("newBehanceName");

newBehanceName.addEventListener("input", function () {
  checkInputFill(newBehanceName, addNewBehanceBtn);
});

addNewBehanceBtn.addEventListener("click", async function () {
  closeModal("newFeedModal");
  addNewBehanceBtn.disabled = true;

  const { data, error } = await client
    .from("feeds")
    .insert([{ feed_name: "behance", feed_type: "behance", feed_options: newBehanceName.value, user_id: user_id }])
    .select();

  if (data) {
    showToast(newBehanceName.value + " added to your feed");
    const feedContainer = document.getElementById("feedContainer");
    const sidebarContainer = document.getElementById("feedLogoContainer");
    let feed = "";
    let sidebar = "";

    sidebar += `
         <a id="sidebarLogo-${data[0].id}" href="#${data[0].id}" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="${data[0].feed_options}" aria-label="${data[0].feed_options}">
         <img class="rounded-3 m-2" src="./img/logo-behance.svg" alt="Behance logo" width="40" height="40" />
         </a>
        `;

    feed += `
        <div id="${data[0].id}" class="feed border-end">
          <div class="feed-header d-flex flex-row justify-content-between bg-body-tertiary border-bottom">
            <div class="d-flex align-items-center">
              <img class="me-2" src="./img/logo-behance.svg" width="20" height="20" alt="Behance logo" />
              <p id="behanceName">${data[0].feed_options}</p>
            </div>
            <div class="btn-group">
              <button type="button" class="btn bg-body-tertiary btn-sm p-0 rounded-1 border-0" data-bs-toggle="dropdown" aria-expanded="false">
                <img class="svg-icon" src="./img/dots-three-vertical.svg" width="24" height="24" alt="dots icon" />
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li onclick="getBehanceFeed('${data[0].feed_options}', ${data[0].id})"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2" src="./img/reload.svg" width="20" height="20" />Reload</button></li>
                <li onclick="removeBehanceFeed(${data[0].id})"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2" src="./img/delete.svg" width="20" height="20" />Remove</button></li>
              </ul>
            </div>
          </div>
          <div id="feed-behance-${data[0].id}" class="list-group list-group-flush feed-body">
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
    getBehanceFeed(data[0].feed_options, data[0].id);
  }

  newBehanceName.value = "";

  if (error) {
    console.log(error);
  }
  initTooltip();
});

// Remove Behance
async function removeBehanceFeed(id) {
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

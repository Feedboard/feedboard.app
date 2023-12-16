async function getPinterestAccount(username, id) {
  console.log("Loading " + username);
  const pinterestAccountUrl = "https://web-production-09ad.up.railway.app/pinterest.com/" + username + "/feed.rss";
  const feedPinterestAccount = document.getElementById("feed-pinterestAccount-" + id);

  await fetch(pinterestAccountUrl, {
    headers: {
      "X-Requested-With": "XMLHttpRequest",
    },
  })
    .then((response) => response.text())
    .then((str) => new window.DOMParser().parseFromString(str, "text/xml"))
    .then((data) => {
      const entries = data.querySelectorAll("item");
      feedPinterestAccount.innerHTML = "";
      let entry = "";
      if (entries.length <= 0) {
        console.log("not ok");
        entry += `
        <div class="alert alert-warning d-flex align-items-center border-0 rounded-0 p-2" role="alert">
          <img class="me-2" src="./img/warning-diamond.svg" width="20" height="20" alt="warning icon" />
          <div>
            This functionality is in Beta and it might fail. If you think the username is correct try to reload this tab.
            In alternative this Pinterest account is not public or doesn't seem to exist.
          </div>
        </div>
              `;
        feedPinterestAccount.innerHTML = entry;
      }

      entries.forEach((el) => {
        let title = el.querySelector("title").textContent;
        let description = el.querySelector("description").textContent;
        let pubDate = el.querySelector("pubDate").textContent;
        let link = el.querySelector("link").textContent;

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(description, "text/xml");

        const documentRoot = xmlDoc.documentElement;
        const cdataContent = documentRoot.textContent;

        const htmlDoc = new DOMParser().parseFromString(description, "text/html");
        const imgEl = htmlDoc.querySelector("img");

        entry += `
            <a href="${link}" class="list-group-item list-group-item-action" target="_blank">
              ${imgEl ? `<img class="w-100 img-fluid rounded-3" src="${imgEl.getAttribute("src")}" alt="${title}" loading="lazy" onError="this.onerror=null;this.src='./img/image-placeholder.png';" />` : ""}
              <p class="fw-semibold mb-2">${title}</p>
              <p class="text-secondary small">${convertHnDate(pubDate)}</p>
            </a>
              `;
      });
      feedPinterestAccount.innerHTML = entry;
    });
}

// Add new Pinterest account
const addNewPinterestAccountBtn = document.getElementById("addNewPinterestAccount");
const newPinterestAccountName = document.getElementById("newPinterestAccountName");

newPinterestAccountName.addEventListener("input", function () {
  checkInputFill(newPinterestAccountName, addNewPinterestAccountBtn);
});

addNewPinterestAccountBtn.addEventListener("click", async function () {
  closeModal("newFeedModal");
  addNewPinterestAccountBtn.disabled = true;

  const { data, error } = await client
    .from("feeds")
    .insert([{ feed_name: "pinterest", feed_type: "pinterest-account", feed_options: newPinterestAccountName.value, user_id: user_id }])
    .select();

  if (data) {
    showToast(newPinterestAccountName.value + " added to your feed");
    const feedContainer = document.getElementById("feedContainer");
    const sidebarContainer = document.getElementById("feedLogoContainer");
    let feed = "";
    let sidebar = "";

    sidebar += `
         <a id="sidebarLogo-${data[0].id}" href="#${data[0].id}" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="${data[0].feed_options}" aria-label="${data[0].feed_options}">
         <img class="rounded-3 m-2" src="./img/logo-pinterest.svg" alt="pinterest logo" width="40" height="40" />
         </a>
        `;

    feed += `
        <div id="${data[0].id}" class="feed border-end">
          <div class="feed-header d-flex flex-row justify-content-between bg-body-tertiary border-bottom">
            <div class="d-flex align-items-center">
              <img class="me-2" src="./img/logo-pinterest.svg" width="20" height="20" alt="pinterest logo" />
              <p>${data[0].feed_options}</p>
            </div>
            <div class="btn-group">
              <button type="button" class="btn bg-body-tertiary btn-sm p-0 rounded-1 border-0" data-bs-toggle="dropdown" aria-expanded="false">
                <img class="svg-icon" src="./img/dots-three-vertical.svg" width="24" height="24" alt="dots icon" />
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li onclick="getPinterestAccount('${data[0].feed_options}', ${data[0].id})"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2" src="./img/reload.svg" width="20" height="20" />Reload</button></li>
                <li onclick="removePinterestAccount(${data[0].id})"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2" src="./img/delete.svg" width="20" height="20" />Remove</button></li>
              </ul>
            </div>
          </div>
          <div id="feed-pinterestAccount-${data[0].id}" class="list-group list-group-flush feed-body">
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
    getPinterestAccount(data[0].feed_options, data[0].id);
  }

  newPinterestAccountName.value = "";

  if (error) {
    console.log(error);
  }
  initTooltip();
});

// Remove Pinterest account
async function removePinterestAccount(id) {
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

///////////////////////////////////////////////////////////////

async function getPinterestBoard(slug, id) {
  console.log("Loading " + slug);
  const pinterestBoardUrl = "https://web-production-09ad.up.railway.app/pinterest.com/" + slug + ".rss";
  const feedPinterestBoard = document.getElementById("feed-pinterestBoard-" + id);

  await fetch(pinterestBoardUrl, {
    headers: {
      "X-Requested-With": "XMLHttpRequest",
    },
  })
    .then((response) => response.text())
    .then((str) => new window.DOMParser().parseFromString(str, "text/xml"))
    .then((data) => {
      const entries = data.querySelectorAll("item");
      feedPinterestBoard.innerHTML = "";
      let entry = "";
      if (entries.length <= 0) {
        console.log("not ok");
        entry += `
        <div class="alert alert-warning d-flex align-items-center border-0 rounded-0 p-2" role="alert">
          <img class="me-2" src="./img/warning-diamond.svg" width="20" height="20" alt="warning icon" />
          <div>
            This functionality is in Beta and it might fail. If you think the username is correct try to reload this tab.
            In alternative this Pinterest board is not public or doesn't seem to exist.
          </div>
        </div>
              `;
        feedPinterestBoard.innerHTML = entry;
      }

      entries.forEach((el) => {
        let title = el.querySelector("title").textContent;
        let description = el.querySelector("description").textContent;
        let pubDate = el.querySelector("pubDate").textContent;
        let link = el.querySelector("link").textContent;

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(description, "text/xml");

        const documentRoot = xmlDoc.documentElement;
        const cdataContent = documentRoot.textContent;

        const htmlDoc = new DOMParser().parseFromString(description, "text/html");
        const imgEl = htmlDoc.querySelector("img");

        entry += `
            <a href="${link}" class="list-group-item list-group-item-action" target="_blank">
              ${imgEl ? `<img class="w-100 img-fluid rounded-3" src="${imgEl.getAttribute("src")}" alt="${title}" />` : ""}
              <p class="fw-semibold mb-2">${title}</p>
              <p class="text-secondary small">${convertHnDate(pubDate)}</p>
            </a>
              `;
      });
      feedPinterestBoard.innerHTML = entry;
    });
}

// Add new Pinterest board
const addNewPinterestBoardBtn = document.getElementById("addNewPinterestBoard");
const newPinterestBoardName = document.getElementById("newPinterestBoardName");

newPinterestBoardName.addEventListener("input", function () {
  checkInputFill(newPinterestBoardName, addNewPinterestBoardBtn);
});

addNewPinterestBoardBtn.addEventListener("click", async function () {
  closeModal("newFeedModal");
  addNewPinterestBoardBtn.disabled = true;

  const { data, error } = await client
    .from("feeds")
    .insert([{ feed_name: "pinterest", feed_type: "pinterest-board", feed_options: removeTrailingSlash(newPinterestBoardName.value), user_id: user_id }])
    .select();

  if (data) {
    showToast(newPinterestBoardName.value + " added to your feed");
    const feedContainer = document.getElementById("feedContainer");
    const sidebarContainer = document.getElementById("feedLogoContainer");
    let feed = "";
    let sidebar = "";

    sidebar += `
         <a id="sidebarLogo-${data[0].id}" href="#${data[0].id}" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="${data[0].feed_options}" aria-label="${data[0].feed_options}">
         <img class="rounded-3 m-2" src="./img/logo-pinterest.svg" alt="pinterest logo" width="40" height="40" />
         </a>
        `;

    feed += `
        <div id="${data[0].id}" class="feed border-end">
          <div class="feed-header d-flex flex-row justify-content-between bg-body-tertiary border-bottom">
            <div class="d-flex align-items-center">
              <img class="me-2" src="./img/logo-pinterest.svg" width="20" height="20" alt="pinterest logo" />
              <p>${data[0].feed_options}</p>
            </div>
            <div class="btn-group">
              <button type="button" class="btn bg-body-tertiary btn-sm p-0 rounded-1 border-0" data-bs-toggle="dropdown" aria-expanded="false">
                <img class="svg-icon" src="./img/dots-three-vertical.svg" width="24" height="24" alt="dots icon" />
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li onclick="getPinterestBoard('${data[0].feed_options}', ${data[0].id})"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2" src="./img/reload.svg" width="20" height="20" />Reload</button></li>
                <li onclick="removePinterestBoard(${data[0].id})"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2" src="./img/delete.svg" width="20" height="20" />Remove</button></li>
              </ul>
            </div>
          </div>
          <div id="feed-pinterestBoard-${data[0].id}" class="list-group list-group-flush feed-body">
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
    getPinterestBoard(data[0].feed_options, data[0].id);
  }

  newPinterestBoardName.value = "";

  if (error) {
    console.log(error);
  }
  initTooltip();
});

// Remove Pinterest board
async function removePinterestBoard(id) {
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

function removeTrailingSlash(slug) {
  return slug.replace(/\/$/, ""); // This replaces a trailing / with an empty string
}

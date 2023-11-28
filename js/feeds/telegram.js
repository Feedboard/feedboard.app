async function getTelegramFeed(channel, id) {
  console.log("Loading " + channel);
  const telegramUrl = "https://web-production-ba07.up.railway.app/https://rsshub.app/telegram/channel/" + channel;
  const feedTelegram = document.getElementById("feed-telegram-" + id);

  await fetch(telegramUrl, {
    headers: {
      "Access-Control-Allow-Origin": telegramUrl,
      "Access-Control-Allow-Headers": "content-type",
    },
  })
    .then((response) => response.text())
    .then((str) => new window.DOMParser().parseFromString(str, "text/xml"))
    .then((data) => {
      const entries = data.querySelectorAll("item");
      feedTelegram.innerHTML = "";
      let entry = "";
      if (entries.length <= 0) {
        console.log("not ok");
        entry += `
        <div class="alert alert-warning d-flex align-items-center border-0 rounded-0 p-2" role="alert">
          <img class="me-2" src="./img/warning-diamond.svg" width="20" height="20" alt="warning icon" />
          <div>
            This Telegram channel is not public or doesn't seem to exist.
          </div>
        </div>
              `;
        feedTelegram.innerHTML = entry;
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
              <p class="fw-semibold mb-2">${title}</p>
              ${imgEl ? `<img class="img-fluid rounded-3" src="${imgEl.getAttribute("src")}" alt="${title}" loading="lazy" onError="this.onerror=null;this.src='./img/image-placeholder.png';" />` : ""}
              <p class="text-secondary small">${convertHnDate(pubDate)}</p>
            </a>
              `;
      });
      feedTelegram.innerHTML = entry;
    });
}

// Add new Telegram channel
const addNewTelegramChannelBtn = document.getElementById("addNewTelegramChannel");
const newTelegramChannelName = document.getElementById("newTelegramChannelName");

newTelegramChannelName.addEventListener("input", function () {
  checkInputFill(newTelegramChannelName, addNewTelegramChannelBtn);
});

addNewTelegramChannelBtn.addEventListener("click", async function () {
  closeModal("newFeedModal");
  addNewTelegramChannelBtn.disabled = true;

  const { data, error } = await client
    .from("feeds")
    .insert([{ feed_name: "telegram", feed_type: "telegram", feed_options: newTelegramChannelName.value, user_id: user_id }])
    .select();

  if (data) {
    showToast(newTelegramChannelName.value + " added to your feed");
    const feedContainer = document.getElementById("feedContainer");
    const sidebarContainer = document.getElementById("feedLogoContainer");
    let feed = "";
    let sidebar = "";

    sidebar += `
         <a id="sidebarLogo-${data[0].id}" href="#${data[0].id}" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="${data[0].feed_options}" aria-label="${data[0].feed_options}">
         <img class="rounded-3 m-2" src="./img/logo-telegram.svg" alt="telegram logo" width="40" height="40" />
         </a>
        `;

    feed += `
        <div id="${data[0].id}" class="feed border-end">
          <div class="feed-header d-flex flex-row justify-content-between bg-body-tertiary border-bottom">
            <div class="d-flex align-items-center">
              <img class="me-2" src="./img/logo-telegram.svg" width="20" height="20" alt="telegram logo" />
              <p>${data[0].feed_options}</p>
            </div>
            <div class="btn-group">
              <button type="button" class="btn bg-body-tertiary btn-sm p-0 rounded-1 border-0" data-bs-toggle="dropdown" aria-expanded="false">
                <img src="./img/dots-three-vertical.svg" width="24" height="24" alt="dots icon" />
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li onclick="getTelegramFeed('${data[0].feed_options}', ${data[0].id})"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2" src="./img/reload.svg" width="20" height="20" /></button></li>
                <li onclick="removeTelegramFeed(${data[0].id})"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2" src="./img/delete.svg" width="20" height="20" />Remove</button></li>
              </ul>
            </div>
          </div>
          <div id="feed-telegram-${data[0].id}" class="list-group list-group-flush feed-body">
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
    getTelegramFeed(data[0].feed_options, data[0].id);
  }

  newTelegramChannelName.value = "";

  if (error) {
    console.log(error);
  }
  initTooltip();
});

// Remove Telegram channel
async function removeTelegramFeed(id) {
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

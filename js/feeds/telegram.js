async function getTelegramFeed(channel, id) {
  const feedTelegram = document.getElementById("feed-telegram-" + id);
  feedTelegram.innerHTML = `
    <div class="alert alert-warning d-flex align-items-center border-0 rounded-0 p-2 mb-0" role="alert">
      <img class="me-2 flex-shrink-0" src="./img/warning-diamond.svg" width="20" height="20" alt="warning icon" />
      <div class="small">Telegram feeds are currently under maintenance.</div>
    </div>`;
  return;

  /* MAINTENANCE: remove the return above to re-enable the feed
  const telegramUrl = "https://web-production-09ad.up.railway.app/https://rsshub.app/telegram/channel/" + encodeURIComponent(channel);
  try {
    const response = await fetch(telegramUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const str = await response.text();
    const data = new window.DOMParser().parseFromString(str, "text/xml");
    const entries = data.querySelectorAll("item");

    if (entries.length === 0) {
      feedTelegram.innerHTML = `
        <div class="alert alert-warning d-flex align-items-center border-0 rounded-0 p-2" role="alert">
          <img class="me-2" src="./img/warning-diamond.svg" width="20" height="20" alt="warning icon" />
          <div>This Telegram channel is not public or doesn't seem to exist.</div>
        </div>`;
      return;
    }

    let entry = "";
    entries.forEach((el) => {
      const rawTitle = el.querySelector("title")?.textContent ?? "";
      const rawLink = el.querySelector("link")?.textContent ?? "#";
      const title = escapeHtml(rawTitle);
      const link = safeUrl(rawLink);
      const pubDate = escapeHtml(convertHnDate(el.querySelector("pubDate")?.textContent ?? ""));

      const description = el.querySelector("description")?.textContent ?? "";
      const htmlDoc = new DOMParser().parseFromString(description, "text/html");
      const imgEl = htmlDoc.querySelector("img");
      const imgSrc = imgEl ? escapeHtmlAttr(safeUrl(imgEl.getAttribute("src") ?? "")) : "";

      entry += `
        <a href="${escapeHtmlAttr(link)}" class="list-group-item list-group-item-action" target="_blank">
          <p class="fw-semibold mb-2">${title}</p>
          ${imgSrc ? `<img class="img-fluid rounded-3" src="${imgSrc}" alt="${escapeHtmlAttr(rawTitle)}" loading="lazy" onError="this.onerror=null;this.src='./img/image-placeholder.png';" />` : ""}
          <p class="text-secondary small">${pubDate}</p>
        </a>`;
    });
    entry += `
      <div class="bg-dark-subtle py-4 text-center">
        <p class="text-secondary small">You reached the end of the feed</p>
      </div>`;
    feedTelegram.innerHTML = entry;
  } catch (error) {
    console.error("Error fetching Telegram feed:", error);
    if (feedTelegram) {
      feedTelegram.innerHTML = `
        <div class="alert alert-danger d-flex align-items-center border-0 rounded-0 p-2" role="alert">
          <img class="me-2" src="./img/error.svg" width="20" height="20" alt="error icon" />
          <div>Failed to load Telegram feed.</div>
        </div>`;
    }
  }
  */
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
    const safeOptions = escapeHtml(data[0].feed_options);
    showToast(safeOptions + " added to your feed");
    const feedContainer = document.getElementById("feedContainer");
    const sidebarContainer = document.getElementById("feedLogoContainer");

    const sidebar = `
         <a id="sidebarLogo-${data[0].id}" href="#${data[0].id}" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="${escapeHtmlAttr(data[0].feed_options)}" aria-label="${escapeHtmlAttr(data[0].feed_options)}">
         <img class="rounded-3 m-2" src="./img/logo-telegram.svg" alt="telegram logo" width="40" height="40" />
         </a>`;

    const feed = `
        <div id="${data[0].id}" class="feed border-end">
          <div class="feed-header d-flex flex-row justify-content-between bg-body-tertiary border-bottom">
            <div class="d-flex align-items-center">
              <img class="me-2" src="./img/logo-telegram.svg" width="20" height="20" alt="telegram logo" />
              <p class="feed-title">${safeOptions}</p>
            </div>
            <div class="btn-group">
              <button type="button" class="btn bg-body-tertiary btn-sm p-0 rounded-1 border-0" data-bs-toggle="dropdown" aria-expanded="false">
                <img class="svg-icon" src="./img/dots-three-vertical.svg" width="24" height="24" alt="dots icon" />
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li onclick="getTelegramFeed('${safeOptions}', ${data[0].id})"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2 svg-icon" src="./img/reload.svg" width="20" height="20" />Reload</button></li>
                <li onclick="removeTelegramFeed(${data[0].id})"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2 svg-icon" src="./img/delete.svg" width="20" height="20" />Remove</button></li>
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
        </div>`;
    hideEmpty();
    feedContainer.insertAdjacentHTML("beforeend", feed);
    sidebarContainer.insertAdjacentHTML("beforeend", sidebar);
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
    if (feedContainer) {
      feedContainer.remove();
    }
    if (sidebarLogo) {
      sidebarLogo.remove();
    }
  }
}

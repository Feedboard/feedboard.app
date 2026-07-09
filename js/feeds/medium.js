async function getMediumFeed(username, id) {
  console.log("Loading Medium " + username);
  const mediumUrl = "https://web-production-09ad.up.railway.app/https://www.medium.com/feed/" + encodeURIComponent(username);
  const feedMedium = document.getElementById("feed-medium-" + id);

  try {
    const response = await fetch(mediumUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const str = await response.text();
    const data = new window.DOMParser().parseFromString(str, "text/xml");
    const items = data.querySelectorAll("item");

    if (items.length === 0) {
      feedMedium.innerHTML = `
        <div class="alert alert-warning d-flex align-items-center border-0 rounded-0 p-2" role="alert">
          <img class="me-2" src="./img/warning-diamond.svg" width="20" height="20" alt="warning icon" />
          <div>This Medium account doesn't seem to exist.</div>
        </div>`;
      return;
    }

    let entry = "";
    items.forEach((el) => {
      const rawTitle = el.querySelector("title")?.textContent ?? "";
      const rawLink = el.querySelector("link")?.textContent ?? "#";
      const title = escapeHtml(rawTitle);
      const link = safeUrl(rawLink);
      const creator = escapeHtml(el.querySelector("creator")?.textContent ?? "");
      const pubDate = escapeHtml(convertTime(el.querySelector("pubDate")?.textContent ?? ""));

      const content = el.querySelector("encoded")?.textContent ?? "";
      const container = document.createElement("div");
      container.innerHTML = content;
      const imgSrc = escapeHtmlAttr(safeUrl(container.querySelector("img")?.getAttribute("src") ?? ""));

      entry += `
        <div class="list-group-item list-group-item-action">
          <a href="${escapeHtmlAttr(link)}" class="text-body text-decoration-none" target="_blank">
            ${imgSrc ? `<img class="img-fluid rounded-3 mb-2" src="${imgSrc}" alt="${escapeHtmlAttr(rawTitle)}" loading="lazy" onError="this.onerror=null;this.src='./img/image-placeholder.png';" />` : ""}
            <p class="fw-semibold mb-2">${title}</p>
          </a>
          <div class="d-flex justify-content-between align-items-center">
            <p class="text-secondary small">${creator}</p>
            <div class="d-flex flex-row align-items-center">
              <p class="text-secondary small">${pubDate}</p>
              <button class="btn btn-bookmark p-0 border-0" data-bm-title="${escapeHtmlAttr(rawTitle)}" data-bm-link="${escapeHtmlAttr(rawLink)}" data-bm-type="medium" onclick="bookmarkThis(this)">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.77,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32Z"></path></svg>
              </button>
            </div>
          </div>
        </div>`;
    });
    entry += `
      <div class="bg-dark-subtle py-4 text-center">
        <p class="text-secondary small">You reached the end of the feed</p>
      </div>`;
    feedMedium.innerHTML = entry;
  } catch (error) {
    console.error("Error fetching Medium feed:", error);
    if (feedMedium) {
      feedMedium.innerHTML = `
        <div class="alert alert-danger d-flex align-items-center border-0 rounded-0 p-2" role="alert">
          <img class="me-2" src="./img/error.svg" width="20" height="20" alt="error icon" />
          <div>Failed to load Medium feed.</div>
        </div>`;
    }
  }
}

// Add new Medium
const addNewMediumBtn = document.getElementById("addNewMedium");
const newMediumName = document.getElementById("newMediumName");

newMediumName.addEventListener("input", function () {
  checkInputFill(newMediumName, addNewMediumBtn);
});

addNewMediumBtn.addEventListener("click", async function () {
  addNewMediumBtn.disabled = true;
  if (await isRssLinkValid("https://web-production-09ad.up.railway.app/https://www.medium.com/feed/" + newMediumName.value)) {
    closeModal("newFeedModal");
    addNewMediumBtn.disabled = true;

    const { data, error } = await client
      .from("feeds")
      .insert([{ feed_name: "medium", feed_type: "medium", feed_options: newMediumName.value, user_id: user_id }])
      .select();

    if (data) {
      const safeOptions = escapeHtml(data[0].feed_options);
      showToast(safeOptions + " added to your feed");
      const feedContainer = document.getElementById("feedContainer");
      const sidebarContainer = document.getElementById("feedLogoContainer");

      const sidebar = `
         <a id="sidebarLogo-${data[0].id}" href="#${data[0].id}" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="${escapeHtmlAttr(data[0].feed_options)}" aria-label="${escapeHtmlAttr(data[0].feed_options)}">
         <img class="rounded-3 m-2 svg-icon" src="./img/logo-medium.svg" alt="medium logo" width="40" height="40" />
         </a>`;

      const feed = `
        <div id="${data[0].id}" class="feed border-end">
          <div class="feed-header d-flex flex-row justify-content-between bg-body-tertiary border-bottom">
            <div class="d-flex align-items-center">
              <img class="me-2 svg-icon" src="./img/logo-medium.svg" width="20" height="20" alt="medium logo" />
              <p class="feed-title">${safeOptions}</p>
            </div>
            <div class="btn-group">
              <button type="button" class="btn bg-body-tertiary btn-sm p-0 rounded-1 border-0" data-bs-toggle="dropdown" aria-expanded="false">
                <img class="svg-icon" src="./img/dots-three-vertical.svg" width="24" height="24" alt="dots icon" />
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li onclick="getMediumFeed('${safeOptions}', ${data[0].id})"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2 svg-icon" src="./img/reload.svg" width="20" height="20" />Reload</button></li>
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
        </div>`;
      hideEmpty();
      feedContainer.insertAdjacentHTML("beforeend", feed);
      sidebarContainer.insertAdjacentHTML("beforeend", sidebar);
      scrollToPos(data[0].id);
      getMediumFeed(data[0].feed_options, data[0].id);
    }
    if (error) {
      console.log(error);
    }
    newMediumName.value = "";
  } else {
    addNewMediumBtn.disabled = false;
    document.getElementById("mediumErrorHelp").hidden = false;
    setTimeout(() => {
      document.getElementById("mediumErrorHelp").hidden = true;
    }, 5000);
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

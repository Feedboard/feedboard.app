async function getHnFeed() {
  console.log("Loading HackerNews...");
  const hnUrl = "https://web-production-09ad.up.railway.app/https://hnrss.org/newest";
  const feedHackernews = document.getElementById("feed-hackernews");

  try {
    const response = await fetch(hnUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const str = await response.text();
    const data = new window.DOMParser().parseFromString(str, "text/xml");
    const entries = data.querySelectorAll("item");

    let entry = "";
    entries.forEach((el) => {
      const rawTitle = el.querySelector("title")?.textContent ?? "";
      const rawLink = el.querySelector("link")?.textContent ?? "";
      const title = escapeHtml(rawTitle);
      const link = safeUrl(rawLink);
      const pubDate = escapeHtml(convertHnDate(el.querySelector("pubDate")?.textContent ?? ""));
      entry += `
          <div class="list-group-item list-group-item-action">
            <a href="${escapeHtmlAttr(link)}" class="text-body text-decoration-none" target="_blank">
              <p class="fw-semibold">${title}</p>
              <p class="text-secondary small text-break">${escapeHtml(link)}</p>
            </a>
            <div class="d-flex flex-row justify-content-between align-items-center">
              <p class="text-secondary small">${pubDate}</p>
              <button class="btn btn-bookmark p-0 border-0" data-bm-title="${escapeHtmlAttr(rawTitle)}" data-bm-link="${escapeHtmlAttr(rawLink)}" data-bm-type="hackernews" onclick="bookmarkThis(this)">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.77,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32Z"></path></svg>
              </button>
            </div>
          </div>`;
    });
    entry += `
      <div class="bg-dark-subtle py-4 text-center">
        <p class="text-secondary small">You reached the end of the feed</p>
      </div>`;
    feedHackernews.innerHTML = entry;
  } catch (error) {
    console.error("Error fetching HackerNews feed:", error);
    if (feedHackernews) {
      feedHackernews.innerHTML = `
        <div class="alert alert-danger d-flex align-items-center border-0 rounded-0 p-2" role="alert">
          <img class="me-2" src="./img/error.svg" width="20" height="20" alt="error icon" />
          <div>Failed to load HackerNews feed.</div>
        </div>`;
    }
  }
}

// Add HackerNews
const addHackerNewsBtn = document.getElementById("addHackerNews");

addHackerNewsBtn.addEventListener("click", async function () {
  closeModal("newFeedModal");

  const { data, error } = await client
    .from("feeds")
    .insert([{ feed_name: "Hacker News", feed_options: "hackernews", feed_type: "hackernews", user_id: user_id }])
    .select();

  if (data) {
    showToast("HackerNews added to your feed");
    addHackerNewsBtn.disabled = true;
    console.log(data);
    const feedContainer = document.getElementById("feedContainer");
    const sidebarContainer = document.getElementById("feedLogoContainer");
    let feed = "";
    let sidebar = "";

    sidebar += `
         <a id="sidebarLogo-${data[0].id}" href="#${data[0].id}" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="${data[0].feed_name}" aria-label="${data[0].feed_name}">
         <img class="rounded-3 m-2" src="./img/logo-hackernews.svg" alt="hackernews logo" width="40" height="40" />
         </a>
        `;

    feed += `
        <div id="${data[0].id}" class="feed border-end">
          <div class="feed-header d-flex flex-row justify-content-between bg-body-tertiary border-bottom">
            <div class="d-flex align-items-center">
              <img class="me-2" src="./img/logo-hackernews.svg" width="20" height="20" alt="hackernews logo" />
              Hacker News
            </div>
            <div class="btn-group">
              <button type="button" name="options" class="btn bg-body-tertiary btn-sm p-0 rounded-1 border-0" data-bs-toggle="dropdown" aria-expanded="false">
                <img class="svg-icon" src="./img/dots-three-vertical.svg" width="24" height="24" alt="dots icon" />
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li onclick="getHnFeed(${data[0].id})"><button class="dropdown-item" type="button" name="reload"><img class="align-text-bottom me-2 svg-icon" src="./img/reload.svg" width="20" height="20" />Reload</button></li>
                <li onclick="removeHnFeed(${data[0].id})"><button class="dropdown-item" type="button" name="remove"><img class="align-text-bottom me-2 svg-icon" src="./img/delete.svg" width="20" height="20" />Remove</button></li>
              </ul>
            </div>
          </div>
          <div id="feed-hackernews" class="list-group list-group-flush feed-body">
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
    feedContainer.insertAdjacentHTML("beforeend", feed);
    sidebarContainer.insertAdjacentHTML("beforeend", sidebar);
    scrollToPos(data[0].id);
    getHnFeed(data[0].id);
  }

  if (error) {
    console.log(error);
  }
  initTooltip();
});

// Remove hackernews
async function removeHnFeed(id) {
  const { error } = await client.from("feeds").delete().eq("id", id);
  if (error) {
    console.log(error);
  } else {
    console.log("Deleted");
    showToast("Feed deleted");
    addHackerNewsBtn.disabled = false;

    let feedContainer = document.getElementById(id);
    let sidebarLogo = document.getElementById("sidebarLogo-" + id);
    feedContainer.remove();
    sidebarLogo.remove();
  }
}

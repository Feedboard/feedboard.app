async function getRedditFeed(subreddit, id) {
  console.log("Loading r/" + subreddit);
  const redditUrl = "https://web-production-09ad.up.railway.app/https://reddit.com/r/" + encodeURIComponent(subreddit) + "/.rss";
  const feedReddit = document.getElementById("feed-reddit-" + id);

  try {
    const response = await fetch(redditUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const str = await response.text();
    const data = new window.DOMParser().parseFromString(str, "text/xml");
    const entries = data.querySelectorAll("entry");

    if (entries.length === 0) {
      feedReddit.innerHTML = `
        <div class="alert alert-warning d-flex align-items-center border-0 rounded-0 p-2" role="alert">
          <img class="me-2" src="./img/warning-diamond.svg" width="20" height="20" alt="warning icon" />
          <div>This subreddit doesn't seem to exist.</div>
        </div>`;
      return;
    }

    let entry = "";
    entries.forEach((el) => {
      const rawTitle = el.querySelector("title")?.textContent ?? "";
      const rawLink = el.querySelector("link")?.getAttribute("href") ?? "#";
      const title = escapeHtml(rawTitle);
      const link = safeUrl(rawLink);

      const post = el.querySelector("content")?.textContent ?? "";
      const container = document.createElement("div");
      container.innerHTML = post;
      const mdEl = container.querySelector(".md");
      const truncatedContent = mdEl ? escapeHtml(mdEl.textContent.slice(0, 160) + "...") : "";

      const imageUrl = escapeHtmlAttr(safeUrl(el.querySelector("thumbnail")?.getAttribute("url") ?? ""));
      const name = escapeHtml(el.querySelector("name")?.textContent ?? "");

      entry += `
        <div class="list-group-item list-group-item-action">
          <a href="${escapeHtmlAttr(link)}" class="text-body text-decoration-none" target="_blank">
            <p class="fw-semibold mb-2">${title}</p>
            ${imageUrl ? `<img class="img-fluid rounded-3" src="${imageUrl}" alt="${escapeHtmlAttr(rawTitle)}" loading="lazy" onError="this.remove();" />` : ""}
            <p class="text-secondary small">${truncatedContent}</p>
          </a>
          <div class="d-flex flex-row justify-content-between align-items-center">
            <p class="text-secondary small">${name}</p>
            <button class="btn btn-bookmark p-0 border-0" data-bm-title="${escapeHtmlAttr(rawTitle)}" data-bm-link="${escapeHtmlAttr(rawLink)}" data-bm-type="reddit" onclick="bookmarkThis(this)">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.77,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32Z"></path></svg>
            </button>
          </div>
        </div>`;
    });
    entry += `
      <div class="bg-dark-subtle py-4 text-center">
        <p class="text-secondary small">You reached the end of the feed</p>
      </div>`;
    feedReddit.innerHTML = entry;
  } catch (error) {
    console.error("Error fetching Reddit feed:", error);
    if (feedReddit) {
      feedReddit.innerHTML = `
        <div class="alert alert-danger d-flex align-items-center border-0 rounded-0 p-2" role="alert">
          <img class="me-2" src="./img/error.svg" width="20" height="20" alt="error icon" />
          <div>Failed to load subreddit feed.</div>
        </div>`;
    }
  }
}

// Add new subreddit
const addNewSubredditBtn = document.getElementById("addNewSubreddit");
const newSubredditName = document.getElementById("newSubredditName");

newSubredditName.addEventListener("input", function () {
  checkInputFill(newSubredditName, addNewSubredditBtn);
});

addNewSubredditBtn.addEventListener("click", async function () {
  closeModal("newFeedModal");
  addNewSubredditBtn.disabled = true;

  const { data, error } = await client
    .from("feeds")
    .insert([{ feed_name: "subreddit", feed_type: "subreddit", feed_options: newSubredditName.value, user_id: user_id }])
    .select();

  if (data) {
    showToast("r/" + newSubredditName.value + " added to your feed");
    const feedContainer = document.getElementById("feedContainer");
    const sidebarContainer = document.getElementById("feedLogoContainer");
    const safeOptions = escapeHtml(data[0].feed_options);

    const sidebar = `
         <a id="sidebarLogo-${data[0].id}" href="#${data[0].id}" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="r/${escapeHtmlAttr(data[0].feed_options)}" aria-label="${escapeHtmlAttr(data[0].feed_options)}">
         <img class="rounded-3 m-2" src="./img/logo-reddit.svg" alt="reddit logo" width="40" height="40" />
         </a>`;

    const feed = `
        <div id="${data[0].id}" class="feed border-end">
          <div class="feed-header d-flex flex-row justify-content-between bg-body-tertiary border-bottom">
            <div class="d-flex align-items-center">
              <img class="me-2" src="./img/logo-reddit.svg" width="20" height="20" alt="reddit logo" />
              <p class="feed-title">r/${safeOptions}</p>
            </div>
            <div class="btn-group">
              <button type="button" class="btn bg-body-tertiary btn-sm p-0 rounded-1 border-0" data-bs-toggle="dropdown" aria-expanded="false">
                <img class="svg-icon" src="./img/dots-three-vertical.svg" width="24" height="24" alt="dots icon" />
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li onclick="getRedditFeed('${safeOptions}', ${data[0].id})"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2 svg-icon" src="./img/reload.svg" width="20" height="20" />Reload</button></li>
                <li onclick="removeRedditFeed(${data[0].id})"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2 svg-icon" src="./img/delete.svg" width="20" height="20" />Remove</button></li>
              </ul>
            </div>
          </div>
          <div id="feed-reddit-${data[0].id}" class="list-group list-group-flush feed-body">
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
    getRedditFeed(data[0].feed_options, data[0].id);
  }

  newSubredditName.value = "";

  if (error) {
    console.log(error);
  }
  initTooltip();
});

// Remove subreddit
async function removeRedditFeed(id) {
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

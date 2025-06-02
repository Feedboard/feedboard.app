async function getGenericRss(link, id) {
  console.log("Loading Generic RSS...");
  const rssURL = "https://web-production-09ad.up.railway.app/" + link;
  const feedGenericRSS = document.getElementById("feed-genericRSS-" + id);

  if (feedGenericRSS) {
    feedGenericRSS.innerHTML = '<div class="p-2">Loading...</div>';
  }

  try {
    const response = await fetch(rssURL, {
      headers: {
        "Access-Control-Allow-Origin": rssURL,
        "Access-Control-Allow-Headers": "content-type",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const str = await response.text();
    const data = new window.DOMParser().parseFromString(str, "text/xml");

    let entries = data.querySelectorAll("item").length > 0 ? data.querySelectorAll("item") : data.querySelectorAll("entry");

    if (feedGenericRSS) {
      feedGenericRSS.innerHTML = "";
    }

    if (entries.length === 0) {
      feedGenericRSS.innerHTML = `
        <div class="alert alert-warning d-flex align-items-center border-0 rounded-0 p-2" role="alert">
          <img class="me-2" src="./img/warning-diamond.svg" width="20" height="20" alt="warning icon" />
          <div>
            This link seems to be invalid or the website doesn't have any RSS feed.
          </div>
        </div>
      `;
      return;
    }

    let entryHTML = "";

    entries.forEach((el) => {
      let title = el.querySelector("title")?.textContent || "No Title";
      let link = el.querySelector("link")?.innerHTML || el.querySelector("id")?.innerHTML || "#";
      let description = el.querySelector("description")?.textContent || el.querySelector("content")?.textContent || "";
      let strippedContent = description.replace(/<[^>]*>/g, "");
      let truncatedContent = strippedContent.slice(0, 160) + "...";
      let enclosure = el.querySelector("enclosure")?.getAttribute("url");
      let mediaContent = el.querySelector("content")?.getAttribute("url");

      let dateElement = el.querySelector("published") || el.querySelector("updated") || el.querySelector("pubDate");
      let date = dateElement ? convertHnDate(dateElement.innerHTML) : "";

      entryHTML += `
        <div class="list-group-item list-group-item-action">
          <a href="${link}" class="text-body text-decoration-none" target="_blank">
            ${enclosure || mediaContent ? `<img class="img-fluid rounded-3" src="${enclosure || mediaContent}" alt="${title}" loading="lazy" onError="this.onerror=null;this.src='./img/image-placeholder.png';" />` : ""}
            <p class="fw-semibold">${title}</p>
            ${description ? `<p class="text-secondary small text-break">${truncatedContent}</p>` : ""}
          </a>
          <div class="d-flex flex-row justify-content-between align-items-center">
            ${date ? `<p class="text-secondary small">${date}</p>` : ""}
            <div>
            <button class="btn btn-bookmark p-0 border-0" data-rm-link="${link}" onclick="readmodeThis(this)">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM72,144a8,8,0,0,1-4.89,7.37A7.86,7.86,0,0,1,64,152H52a8,8,0,0,1,0-16h4V88H52a8,8,0,0,1,0-16H64a8,8,0,0,1,6.91,4L92,112.12,113.09,76A8,8,0,0,1,120,72h12a8,8,0,0,1,0,16h-4v48h4a8,8,0,0,1,0,16H120a7.86,7.86,0,0,1-3.11-.63A8,8,0,0,1,112,144V109.59L98.91,132a8,8,0,0,1-13.82,0L72,109.59Zm128,40H88a8,8,0,0,1,0-16H200a8,8,0,0,1,0,16Zm0-32H160a8,8,0,0,1,0-16h40a8,8,0,0,1,0,16Zm0-32H160a8,8,0,0,1,0-16h40a8,8,0,0,1,0,16Z"/></svg>
            </button>
              <button class="btn btn-bookmark p-0 border-0" data-bm-title="${title}" data-bm-link="${link}" data-bm-type="rss" onclick="bookmarkThis(this)">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.77,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32Z"></path></svg>
              </button>
            </div>
          </div>
        </div>
      `;
    });

    entryHTML += `
      <div class="bg-dark-subtle py-4 px- text-center">
        <p class="text-secondary small">You reached the end of the feed</p>
      </div>
    `;

    if (feedGenericRSS) {
      feedGenericRSS.innerHTML = entryHTML;
    }
  } catch (error) {
    console.error("Error fetching or parsing RSS:", error);
    if (feedGenericRSS) {
      feedGenericRSS.innerHTML = `
        <div class="alert alert-danger d-flex align-items-center border-0 rounded-0 p-2" role="alert">
          <img class="me-2" src="./img/error.svg" width="20" height="20" alt="error icon" />
          <div>
            Failed to load RSS feed: ${error.message}
          </div>
        </div>
      `;
    }
  }
}
// Add RSS Feed
const addNewRssBtn = document.getElementById("addNewRssBtn");
const newRssFeed = document.getElementById("newRssFeed");

newRssFeed.addEventListener("input", function () {
  checkInputFill(newRssFeed, addNewRssBtn);
});

addNewRssBtn.addEventListener("click", async function () {
  console.log(newRssFeed.value);
  if (await isRssLinkValid(newRssFeed.value)) {
    closeModal("newFeedModal");
    addNewRssBtn.disabled = true;

    const feedTitle = await getRssTitle(newRssFeed.value);

    const { data, error } = await client
      .from("feeds")
      .insert([{ feed_name: feedTitle, feed_options: newRssFeed.value, feed_type: "RSS", user_id: user_id }])
      .select();

    if (data) {
      showToast("New RSS added to your feed");
      const feedContainer = document.getElementById("feedContainer");
      const sidebarContainer = document.getElementById("feedLogoContainer");
      let feed = "";
      let sidebar = "";
      let favicon = getApexDomain(data[0].feed_options);

      sidebar += `
         <a id="sidebarLogo-${data[0].id}" href="#${data[0].id}" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="${data[0].feed_name}" aria-label="${data[0].feed_name}">
         <img class="rounded-3 m-2" src="${favicon}" onError="this.onerror=null;this.src='./img/logo-rss.svg';" alt="rss logo" width="40" height="40" />
         </a>
        `;

      feed += `
        <div id="${data[0].id}" class="feed border-end">
          <div class="feed-header d-flex flex-row justify-content-between bg-body-tertiary border-bottom">
            <div class="d-flex align-items-center">
              <img class="me-2" src="${favicon}" onError="this.onerror=null;this.src='./img/logo-rss.svg';" width="20" height="20" alt="rss logo" />
               <p class="feed-title">${data[0].feed_name}<p>
            </div>
            <div class="btn-group">
              <button type="button" name="options" class="btn bg-body-tertiary btn-sm p-0 rounded-1 border-0" data-bs-toggle="dropdown" aria-expanded="false">
                <img class="svg-icon" src="./img/dots-three-vertical.svg" width="24" height="24" alt="dots icon" />
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li onclick="getGenericRss(${data[0].id})"><button class="dropdown-item" type="button" name="reload"><img class="align-text-bottom me-2 svg-icon" src="./img/reload.svg" width="20" height="20" />Reload</button></li>
                <li onclick="removeRssFeed(${data[0].id})"><button class="dropdown-item" type="button" name="remove"><img class="align-text-bottom me-2 svg-icon" src="./img/delete.svg" width="20" height="20" />Remove</button></li>
                <li onclick="getFeedName(${data[0].id},'${data[0].feed_name}')"><button class="dropdown-item" type="button" name="rename"><img class="align-text-bottom me-2 svg-icon" src="./img/edit.svg" width="20" height="20" />Rename</button></li>
              </ul>
            </div>
          </div>
          <div id="feed-genericRSS-${data[0].id}" class="list-group list-group-flush feed-body">
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
      getGenericRss(data[0].feed_options, data[0].id);
    }
    if (error) {
      console.log(error);
    }

    newRssFeed.value = "";
  } else {
    document.getElementById("rssErrorHelp").hidden = false;
    setTimeout(() => {
      document.getElementById("rssErrorHelp").hidden = true;
    }, 5000);
  }
  initTooltip();
});

// Remove RSS feed
async function removeRssFeed(id) {
  try {
    const { error } = await client.from("feeds").delete().eq("id", id);
    if (error) {
      console.log(error);
    } else {
      console.log("Deleted");
      showToast("Feed deleted");

      let feedContainer = document.getElementById(id);
      let sidebarLogo = document.getElementById("sidebarLogo-" + id);
      if (feedContainer) feedContainer.remove();
      if (sidebarLogo) sidebarLogo.remove();
    }
  } catch (error) {
    console.log("Error removing feed: ", error);
    showToast("Failed to delete feed: " + error.message);
  }
}

// Get feed name to rename
const modalFeedNameInput = document.getElementById("modalFeedNameInput");

function getFeedName(id, feedName) {
  modalFeedNameInput.value = feedName;
  document.getElementById("modalFeedId").value = id;
  document.getElementById("modalFeedCurrentName").value = feedName;
  let renameModal = document.getElementById("renameModal");
  let modal = new bootstrap.Modal(renameModal);
  modal.show();
}

modalFeedNameInput.addEventListener("input", function (event) {
  const inputValue = event.target.value;
  const modalFeedCurrentName = document.getElementById("modalFeedCurrentName").value;
  if (inputValue !== modalFeedCurrentName) {
    modalFeedNameSaveBtn.disabled = false;
  } else {
    modalFeedNameSaveBtn.disabled = true;
  }
});

// Rename RSS Feed
const modalFeedNameSaveBtn = document.getElementById("modalFeedNameSaveBtn");

modalFeedNameSaveBtn.addEventListener("click", async function (event) {
  event.preventDefault();
  let newName = modalFeedNameInput.value;
  let feedId = document.getElementById("modalFeedId").value;
  console.log(newName, feedId);
  const { data, error } = await client.from("feeds").update({ feed_name: newName }).eq("id", feedId).select();
  if (data) {
    console.log(data);
    closeModal("renameModal");
    showToast("Feed renamed");
    // Update feed header
    let feedHeader = document.getElementById(feedId);
    let feedTitleElement = feedHeader.querySelector(".feed-title");
    feedTitleElement.textContent = newName;
  }
  if (error) {
    console.log(error);
  }
});

// Check RSS feed validity
async function isRssLinkValid(rssLink) {
  try {
    const response = await fetch("https://web-production-09ad.up.railway.app/" + rssLink);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    // Check if the response is in a valid RSS format
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "text/xml");
    // Check for parse errors
    const parseError = xmlDoc.querySelector("parsererror");
    if (parseError) {
      console.error("XML parse error:", parseError.textContent);
      return false;
    }
    // Check for RSS-specific elements
    const hasRssElements = xmlDoc.querySelector("rss") || xmlDoc.querySelector("feed");
    return !!hasRssElements;
  } catch (error) {
    // An error occurred during the fetch (e.g., network error)
    console.error("Error checking RSS link:", error);
    return false;
  }
}

// Get channel name from link
async function getRssTitle(link) {
  console.log("Getting feed title...");
  showToast("Getting your feed...");
  const rssLink = "https://web-production-09ad.up.railway.app/" + link;

  try {
    const response = await fetch(rssLink, {
      headers: {
        "Access-Control-Allow-Origin": rssLink,
        "Access-Control-Allow-Headers": "content-type",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const str = await response.text();
    const data = new window.DOMParser().parseFromString(str, "text/xml");

    let rssTitle;
    if (data && data.querySelector("channel")) {
      rssTitle = data.querySelector("channel").querySelector("title").textContent;
      formattedRssTitle = rssTitle.toString();
      return formattedRssTitle;
    }
    if (data && data.querySelector("feed")) {
      rssTitle = data.querySelector("feed").querySelector("title").textContent;
      formattedRssTitle = rssTitle.toString();
      return formattedRssTitle;
    }
  } catch (error) {
    console.error("Error fetching or parsing RSS data:", error);
    throw error;
  }
}

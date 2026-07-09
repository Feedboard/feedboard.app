function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function safeVideoId(videoId) {
  // Only allow alphanumeric, hyphens, and underscores (valid YouTube video ID chars)
  return /^[\w-]+$/.test(videoId) ? videoId : "";
}

async function getYoutubeChannel(channelId, id) {
  console.log("Loading Youtube...");
  const youtubeRss = "https://web-production-09ad.up.railway.app/https://www.youtube.com/feeds/videos.xml?channel_id=" + encodeURIComponent(channelId);
  const youtubeFeed = document.getElementById("feed-youtube-" + id);

  try {
    const response = await fetch(youtubeRss);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const str = await response.text();
    const data = new window.DOMParser().parseFromString(str, "text/xml");
    const entries = data.querySelectorAll("entry");

    youtubeFeed.innerHTML = "";

    if (entries.length === 0) {
      youtubeFeed.innerHTML = `
        <div class="alert alert-warning d-flex align-items-center border-0 rounded-0 p-2" role="alert">
          <img class="me-2" src="./img/warning-diamond.svg" width="20" height="20" alt="warning icon" />
          <div>This Youtube channel doesn't seem to exist.</div>
        </div>`;
      return;
    }

    let entry = "";
    entries.forEach((el) => {
      const title = escapeHtml(el.querySelector("title")?.textContent);
      const videoId = safeVideoId(el.querySelector("videoId")?.textContent ?? "");
      const embedLink = videoId ? "https://www.youtube.com/embed/" + videoId : "";
      const published = escapeHtml(convertTime(el.querySelector("published")?.textContent ?? ""));
      const views = escapeHtml(el.querySelector("statistics")?.getAttribute("views") ?? "");
      const likes = escapeHtml(el.querySelector("starRating")?.getAttribute("count") ?? "");

      if (!embedLink) return;

      entry += `
        <div class="list-group-item list-group-item-action">
          <div class="ratio ratio-16x9">
            <iframe class="rounded-3" src="${embedLink}" title="YouTube video" allowfullscreen loading="lazy"></iframe>
          </div>
          <p class="fw-semibold mb-2">${title}</p>
          <div class="d-flex flex-row">
            <p class="text-secondary small me-3"><img src="./img/clock.svg" width="14" alt="clock icon" /> ${published}</p>
            <p class="text-secondary small me-3"><img src="./img/eye.svg" width="14" alt="eye icon" /> ${views}</p>
            <p class="text-secondary small me-3"><img src="./img/thumbs-up.svg" width="14" alt="thumbs up icon" /> ${likes}</p>
          </div>
        </div>`;
    });
    entry += `
      <div class="bg-dark-subtle py-4 text-center">
        <p class="text-secondary small">You reached the end of the feed</p>
      </div>`;
    youtubeFeed.innerHTML = entry;
  } catch (error) {
    console.error("Error fetching YouTube feed:", error);
    if (youtubeFeed) {
      youtubeFeed.innerHTML = `
        <div class="alert alert-danger d-flex align-items-center border-0 rounded-0 p-2" role="alert">
          <img class="me-2" src="./img/error.svg" width="20" height="20" alt="error icon" />
          <div>Failed to load YouTube feed.</div>
        </div>`;
    }
  }
}

// Add new youtube channel
const addNewYoutubeBtn = document.getElementById("addNewYoutube");
const newYoutubeName = document.getElementById("newYoutubeName");

newYoutubeName.addEventListener("input", function () {
  checkInputFill(newYoutubeName, addNewYoutubeBtn);
});

addNewYoutubeBtn.addEventListener("click", async function () {
  addNewYoutubeBtn.disabled = true;

  let channelId;
  try {
    channelId = await getChannelId(newYoutubeName.value);
  } catch (err) {
    console.error("Failed to look up channel:", err);
    channelId = null;
  }

  if (channelId) {
    closeModal("newFeedModal");
    const { data, error } = await client
      .from("feeds")
      .insert([{ feed_name: channelId.title, feed_type: "youtube", feed_options: channelId.id, user_id: user_id }])
      .select();

    if (data) {
      const safeName = escapeHtml(data[0].feed_name);
      const safeOptions = escapeHtml(data[0].feed_options);
      showToast(safeName + " added to your feed");
      const feedContainer = document.getElementById("feedContainer");
      const sidebarContainer = document.getElementById("feedLogoContainer");

      const sidebar = `
         <a id="sidebarLogo-${data[0].id}" href="#${data[0].id}" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="${safeName}" aria-label="${safeName}">
         <img class="rounded-3 m-2" src="./img/logo-youtube.svg" alt="youtube logo" width="40" height="40" />
         </a>`;

      const feed = `
        <div id="${data[0].id}" class="feed border-end">
          <div class="feed-header d-flex flex-row justify-content-between bg-body-tertiary border-bottom">
            <div class="d-flex align-items-center">
              <img class="me-2" src="./img/logo-youtube.svg" width="20" height="20" alt="youtube logo" />
              <p class="feed-title">${safeName}</p>
            </div>
            <div class="btn-group">
              <button type="button" class="btn bg-body-tertiary btn-sm p-0 rounded-1 border-0" data-bs-toggle="dropdown" aria-expanded="false">
                <img class="svg-icon" src="./img/dots-three-vertical.svg" width="24" height="24" alt="dots icon" />
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li onclick="getYoutubeChannel('${safeOptions}', ${data[0].id})"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2 svg-icon" src="./img/reload.svg" width="20" height="20" />Reload</button></li>
                <li onclick="removeYoutubeChannel(${data[0].id})"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2 svg-icon" src="./img/delete.svg" width="20" height="20" />Remove</button></li>
              </ul>
            </div>
          </div>
          <div id="feed-youtube-${data[0].id}" class="list-group list-group-flush feed-body">
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
      getYoutubeChannel(data[0].feed_options, data[0].id);
    }

    newYoutubeName.value = "";

    if (error) {
      console.log(error);
    }
  } else {
    addNewYoutubeBtn.disabled = false;
    document.getElementById("youtubeErrorHelp").hidden = false;
    setTimeout(() => {
      document.getElementById("youtubeErrorHelp").hidden = true;
    }, 5000);
  }
  addNewYoutubeBtn.disabled = false;
  initTooltip();
});

// Remove youtube channel
async function removeYoutubeChannel(id) {
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

async function getChannelId(channelName) {
  const YTendpoint = "https://feedboard-api-relay-production.up.railway.app/yt/" + encodeURIComponent(channelName);
  const response = await fetch(YTendpoint);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  if (data?.pageInfo?.totalResults > 0 && data.items?.[0]) {
    return {
      id: data.items[0].id,
      title: data.items[0].snippet?.title ?? channelName,
    };
  }
  return null;
}

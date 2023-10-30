async function getYoutubeChannel(channelUsername) {
  console.log("Loading Youtube...");
  const youtubeFeed = document.getElementById("feed-youtube-" + id);

  await fetch(youtubeRss, {
    headers: {
      "Access-Control-Allow-Origin": youtubeRss,
      "Access-Control-Allow-Headers": "content-type",
    },
  })
    .then((response) => response.text())
    .then((str) => new window.DOMParser().parseFromString(str, "text/xml"))
    .then((data) => {
      const entries = data.querySelectorAll("entry");
      youtubeFeed.innerHTML = "";
      let entry = "";
      if (entries.length <= 0) {
        console.log("not ok");
        entry += `
        <div class="alert alert-warning d-flex align-items-center border-0 rounded-0 p-2" role="alert">
          <img class="me-2" src="./img/warning-diamond.svg" width="20" height="20" />
          <div>
            This Youtube channel doesn't seem to exist.
          </div>
        </div>
              `;
        youtubeFeed.innerHTML = entry;
      }

      entries.forEach((el) => {
        let title = el.querySelector("title").innerHTML;
        let author = el.querySelector("name").textContent;
        let preview = el.querySelector("thumbnail");
        let description = el.querySelector("description");
        let link = el.querySelector("link").getAttribute("href");

        entry += `
            <a href="${link}" class="list-group-item list-group-item-action" target="_blank">
              <p class="fw-semibold mb-2">${title}</p>
              <img src="${preview}" class="img-fluid"/>
              <p class="text-secondary small">${description}</p>
              <p class="text-secondary small">${author}</p>
            </a>
              `;
      });
      youtubeFeed.innerHTML = entry;
    });
}

// Add new youtube channel
const addNewYoutubeBtn = document.getElementById("addNewYoutube");
const newYoutubeName = document.getElementById("newYoutubeName");

newYoutubeName.addEventListener("input", function () {
  checkInputFill(newYoutubeName, addNewYoutubeBtn);
});

addNewYoutubeBtn.addEventListener("click", async function () {
  closeModal("newFeedModal");
  addNewYoutubeBtn.disabled = true;

  const { data, error } = await client
    .from("feeds")
    .insert([{ feed_name: "youtube", feed_type: "youtube", feed_options: newYoutubeName.value, user_id: user_id }])
    .select();

  if (data) {
    showToast(newYoutubeName.value + " added to your feed");
    const feedContainer = document.getElementById("feedContainer");
    const sidebarContainer = document.getElementById("feedLogoContainer");
    let feed = "";
    let sidebar = "";

    sidebar += `
         <a id="sidebarLogo-${data[0].id}" href="#${data[0].id}" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="r/${data[0].feed_options}">
         <img class="rounded-3 m-2" src="./img/logo-youtube.svg" alt="" width="40" height="40" />
         </a>
        `;

    feed += `
        <div id="${data[0].id}" class="feed border-end">
          <div class="feed-header d-flex flex-row justify-content-between bg-body-tertiary border-bottom">
            <div class="d-flex align-items-center">
              <img class="me-2" src="./img/logo-youtube.svg" width="20" height="20" alt="" />
              <p id="youtubeChannelName">${data[0].feed_options}</p>
            </div>
            <div class="btn-group">
              <button type="button" class="btn bg-body-tertiary btn-sm p-0 rounded-1 border-0" data-bs-toggle="dropdown" aria-expanded="false">
                <img src="./img/dots-three-vertical.svg" width="24" height="24" alt="" />
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li onclick="getYoutubeChannel('${data[0].feed_options}', ${data[0].id})"><button class="dropdown-item" type="button">Reload</button></li>
                <li onclick="removeYoutubeChannel(${data[0].id})"><button class="dropdown-item" type="button">Remove</button></li>
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
        </div>
        `;
    hideEmpty();
    feedContainer.innerHTML += feed;
    sidebarContainer.innerHTML += sidebar;
    scrollToPos(data[0].id);
    getYoutubeChannel(data[0].feed_options, data[0].id);
  }

  newYoutubeName.value = "";

  if (error) {
    console.log(error);
  }
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

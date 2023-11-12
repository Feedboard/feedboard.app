async function getPhFeed() {
  console.log("Loading ProductHunt...");
  const feedProductHunt = document.getElementById("feed-producthunt");

  const url = "https://feedboard-api-relay-production.up.railway.app/producthunt";
  // Create a fetch request
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      let feed = "";
      data.forEach((el) => {
        let name = el.node.name;
        let tagLine = el.node.tagline;
        let createdAt = convertTime(el.node.createdAt);
        let votesCount = el.node.votesCount;
        let image = el.node.thumbnail.url;
        let url = el.node.url;

        feed += `
      <a href="${url}" class="list-group-item list-group-item-action" target="_blank">
      <div class="d-flex flex-row justify-content-between">
      <div class="d-flex flex-row">
            <img src="${image}" class="rounded-3 me-3" width="64" height="64" alt="${name}"/>
            <div>
            <p class="fw-semibold">${name}</p>
            <p class="text-secondary small">${tagLine}</p>
            <p class="text-secondary text-uppercase small">${createdAt}</p>
            </div>
            </div>
            <div class="ph-votes d-flex flex-column align-items-center border rounded-2">
            <img src="./img/arrow-head-up.svg" width="24" alt="arrow head up" />
            <p>${votesCount}</p>
            </div>
        </div>
        </a>
            `;
      });

      feedProductHunt.innerHTML = feed;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Add ProductHunt
const addProductHuntBtn = document.getElementById("addProductHunt");

addProductHuntBtn.addEventListener("click", async function () {
  closeModal("newFeedModal");

  const { data, error } = await client
    .from("feeds")
    .insert([{ feed_name: "ProductHunt", feed_options: "producthunt", feed_type: "producthunt", user_id: user_id }])
    .select();

  if (data) {
    showToast("ProductHunt added to your feed");
    addProductHuntBtn.disabled = true;
    console.log(data);
    const feedContainer = document.getElementById("feedContainer");
    const sidebarContainer = document.getElementById("feedLogoContainer");
    let feed = "";
    let sidebar = "";

    sidebar += `
         <a id="sidebarLogo-${data[0].id}" href="#${data[0].id}" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="${data[0].feed_name}" aria-label="${data[0].feed_name}">
         <img class="rounded-3 m-2" src="./img/logo-product-hunt.svg" alt="producthunt logo" width="40" height="40" />
         </a>
        `;

    feed += `
        <div id="${data[0].id}" class="feed border-end">
          <div class="feed-header d-flex flex-row justify-content-between bg-body-tertiary border-bottom">
            <div class="d-flex align-items-center">
              <img class="me-2" src="./img/logo-product-hunt.svg" width="20" height="20" alt="producthunt logo" />
              ProductHunt
            </div>
            <div class="btn-group">
              <button type="button" name="options" class="btn bg-body-tertiary btn-sm p-0 rounded-1 border-0" data-bs-toggle="dropdown" aria-expanded="false">
                <img src="./img/dots-three-vertical.svg" width="24" height="24" alt="dots icon" />
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li onclick="getPhFeed(${data[0].id})"><button class="dropdown-item" type="button" name="reload">Reload</button></li>
                <li onclick="removePhFeed(${data[0].id})"><button class="dropdown-item" type="button" name="remove">Remove</button></li>
              </ul>
            </div>         
          </div>
          <div id="feed-producthunt" class="list-group list-group-flush feed-body">
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
    getPhFeed(data[0].id);
  }

  if (error) {
    console.log(error);
  }
  initTooltip();
});

// Remove producthunt
async function removePhFeed(id) {
  const { error } = await client.from("feeds").delete().eq("id", id);
  if (error) {
    console.log(error);
  } else {
    console.log("Deleted");
    showToast("Feed deleted");
    addProductHuntBtn.disabled = false;

    let feedContainer = document.getElementById(id);
    let sidebarLogo = document.getElementById("sidebarLogo-" + id);
    feedContainer.remove();
    sidebarLogo.remove();
  }
}

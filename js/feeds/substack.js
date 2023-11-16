async function getSubstack(substack) {
  console.log("Loading Substack...");
  window.SubstackFeedWidget = {
    substackUrl: substack + ".substack.com",
    posts: 12,
    hidden: ["image"],
  };
}

// Add new substack
const addNewSubstackBtn = document.getElementById("addNewSubstack");
const newSubstackName = document.getElementById("newSubstackName");

newSubstackName.addEventListener("input", function () {
  checkInputFill(newSubstackName, addNewSubstackBtn);
});

addNewSubstackBtn.addEventListener("click", async function () {
  closeModal("newFeedModal");
  addNewSubstackBtn.disabled = true;

  const { data, error } = await client
    .from("feeds")
    .insert([{ feed_name: "substack", feed_type: "substack", feed_options: newSubstackName.value, user_id: user_id }])
    .select();

  if (data) {
    showToast(newSubstackName.value + " added to your feed");
    const feedContainer = document.getElementById("feedContainer");
    const sidebarContainer = document.getElementById("feedLogoContainer");
    let feed = "";
    let sidebar = "";

    sidebar += `
         <a id="sidebarLogo-${data[0].id}" href="#${data[0].id}" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="${data[0].feed_options}" aria-label="${data[0].feed_options}">
         <img class="rounded-3 m-2" src="./img/logo-substack.svg" alt="substack logo" width="40" height="40" />
         </a>
        `;

    feed += `
        <div id="${data[0].id}" class="feed border-end">
          <div class="feed-header d-flex flex-row justify-content-between bg-body-tertiary border-bottom">
            <div class="d-flex align-items-center">
              <img class="me-2" src="./img/logo-substack.svg" width="20" height="20" alt="substack logo" />
              ${data[0].feed_options}
            </div>
            <div class="btn-group">
              <button type="button" class="btn bg-body-tertiary btn-sm p-0 rounded-1 border-0" data-bs-toggle="dropdown" aria-expanded="false">
                <img src="./img/dots-three-vertical.svg" width="24" height="24" alt="dots icon" />
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li onclick="getSubstack('${data[0].feed_options}', ${data[0].id})"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2" src="./img/reload.svg" width="20" height="20" />Reload</button></li>
                <li onclick="removeSubstack(${data[0].id})"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2" src="./img/delete.svg" width="20" height="20" />Remove</button></li>
              </ul>
            </div>
          </div>
          <div id="substack-feed-embed" class="feed-body">
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

    // Inject SubstackAPI script
    var script = document.createElement("script");
    script.src = "https://substackapi.com/embeds/feed.js";
    document.body.appendChild(script);

    getSubstack(data[0].feed_options);
  }

  newSubstackName.value = "";

  if (error) {
    console.log(error);
  }
  initTooltip();
});

// Remove substack
async function removeSubstack(id) {
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

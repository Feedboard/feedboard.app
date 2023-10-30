async function getUnsplashFeed() {
  console.log("Loading Unsplash...");
  const feedUnsplash = document.getElementById("feed-unsplash");

  fetch("https://api.unsplash.com/photos", {
    headers: {
      Authorization: "Client-ID gHqroLMsGJbzjvQNskN8sIlwujl7N1WbDFDnzCz5cTo",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      let photos = "";

      data.forEach((el) => {
        photos += `
        <a href="${el.links.html}" class="list-group-item list-group-item-action" target="_blank">
        <img class="img-fluid rounded-3 mb-2 bg-light" src="${el.links.download}"/>
        <p class="fw-semibold text-capitalize">${el.alt_description}</p>
        <p class="text-secondary small"><img src="./img/thumbs-up.svg" width="14" height="14"/> ${el.likes} likes</p>
        </a>
        `;
      });
      feedUnsplash.innerHTML = photos;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Add Unsplash
const addUnsplashBtn = document.getElementById("addUnsplash");

addUnsplashBtn.addEventListener("click", async function () {
  closeModal("newFeedModal");

  const { data, error } = await client
    .from("feeds")
    .insert([{ feed_name: "Unsplash", feed_options: "unsplash", feed_type: "unsplash", user_id: user_id }])
    .select();

  if (data) {
    showToast("Unsplash added to your feed");
    addUnsplashBtn.disabled = true;
    console.log(data);

    const feedContainer = document.getElementById("feedContainer");
    const sidebarContainer = document.getElementById("feedLogoContainer");
    let feed = "";
    let sidebar = "";

    sidebar += `
         <a id="sidebarLogo-${data[0].id}" href="#${data[0].id}" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="${data[0].feed_name}">
         <img class="rounded-3 m-2" src="./img/logo-unsplash.svg" alt="" width="40" height="40" />
         </a>
        `;

    feed += `
        <div id="${data[0].id}" class="feed border-end">
          <div class="feed-header d-flex flex-row justify-content-between bg-body-tertiary border-bottom">
            <div class="d-flex align-items-center">
              <img class="me-2" src="./img/logo-unsplash.svg" width="20" height="20" alt="" />
              Unsplash
            </div>
            <div class="btn-group">
              <button type="button" class="btn bg-body-tertiary btn-sm p-0 rounded-1" data-bs-toggle="dropdown" aria-expanded="false">
                <img src="./img/dots-three-vertical.svg" width="24" height="24" alt="" />
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li onclick="getUnsplashFeed(${data[0].id})"><button class="dropdown-item" type="button">Reload</button></li>
                <li onclick="removeUnsplashFeed(${data[0].id})"><button class="dropdown-item" type="button">Remove</button></li>
              </ul>
            </div>
          </div>
          <div id="feed-unsplash" class="list-group list-group-flush feed-body">
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
    getUnsplashFeed(data[0].id);
  }

  if (error) {
    console.log(error);
  }
});

// Remove Unsplash
async function removeUnsplashFeed(id) {
  const { error } = await client.from("feeds").delete().eq("id", id);
  if (error) {
    console.log(error);
  } else {
    console.log("Deleted");
    showToast("Feed deleted");
    addUnsplashBtn.disabled = false;

    let feedContainer = document.getElementById(id);
    let sidebarLogo = document.getElementById("sidebarLogo-" + id);
    feedContainer.remove();
    sidebarLogo.remove();
  }
}

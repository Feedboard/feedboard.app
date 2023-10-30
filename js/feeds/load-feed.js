// Call the loadFeed function when the document is ready
document.addEventListener("DOMContentLoaded", function () {
  loadFeed();
});

async function loadFeed() {
  const { data, error } = await client.from("feeds").select("*").eq("user_id", user_id).order("id", { ascending: true });

  if (data == "") {
    console.log("Feed is empty");
    empty = `
    <div class="d-flex flex-column align-items-center">
    <p>You do not have any feed</p>
    <button class="btn btn-dark btn-sm" data-bs-toggle="modal" data-bs-target="#newFeedModal">Add feed</button>
    </div>
    `;
    document.getElementById("spinnerContainer").innerHTML = empty;
  }

  if (data.length > 0) {
    const feedContainer = document.getElementById("feedContainer");
    const sidebarContainer = document.getElementById("feedLogoContainer");
    let feed = "";
    let sidebar = "";

    data.forEach((item) => {
      if (item.feed_type == "subreddit") {
        sidebar += `
         <a id="sidebarLogo-${item.id}" href="#${item.id}" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="r/${item.feed_options}">
         <img class="rounded-3 m-2" src="./img/logo-reddit.svg" alt="" width="40" height="40" />
         </a>
        `;

        feed += `
        <div id="${item.id}" class="feed border-end">
          <div class="feed-header d-flex flex-row justify-content-between bg-body-tertiary border-bottom">
            <div class="d-flex align-items-center">
              <img class="me-2" src="./img/logo-reddit.svg" width="20" height="20" alt="" />
              <p id="subredditName">r/${item.feed_options}</p>
            </div>
            <div class="btn-group">
              <button type="button" class="btn bg-body-tertiary btn-sm p-0 rounded-1 border-0" data-bs-toggle="dropdown" aria-expanded="false">
                <img src="./img/dots-three-vertical.svg" width="24" height="24" alt="" />
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li onclick="getRedditFeed('${item.feed_options}', ${item.id})"><button class="dropdown-item" type="button">Reload</button></li>
                <li onclick="removeRedditFeed(${item.id})"><button class="dropdown-item" type="button">Remove</button></li>
              </ul>
            </div>
          </div>
          <div id="feed-reddit-${item.id}" class="list-group list-group-flush feed-body">
            <div class="p-2 placeholder-glow">
              <span class="placeholder placeholder-lg col-6 bg-secondary"></span>
              <span class="placeholder col-7 bg-secondary"></span>
              <span class="placeholder col-4 bg-secondary"></span>
              <span class="placeholder placeholder-sm col-2 bg-secondary"></span>
            </div>
          </div>
        </div>
        `;
        setTimeout(function () {
          getRedditFeed(item.feed_options, item.id);
        }, 1);
      }
      if (item.feed_type == "hackernews") {
        addHackerNewsBtn.disabled = true;
        sidebar += `
         <a id="sidebarLogo-${item.id}" href="#${item.id}" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="${item.feed_name}">
         <img class="rounded-3 m-2" src="./img/logo-hackernews.svg" alt="" width="40" height="40" />
         </a>
        `;
        feed += `
        <div id="${item.id}" class="feed border-end">
          <div class="feed-header d-flex flex-row justify-content-between bg-body-tertiary border-bottom">
            <div class="d-flex align-items-center">
              <img class="me-2" src="./img/logo-hackernews.svg" width="20" height="20" alt="" />
              Hacker News
            </div>
            <div class="btn-group">
              <button type="button" class="btn bg-body-tertiary btn-sm p-0 rounded-1 border-0" data-bs-toggle="dropdown" aria-expanded="false">
                <img src="./img/dots-three-vertical.svg" width="24" height="24" alt="" />
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li onclick="getHnFeed(${item.id})"><button class="dropdown-item" type="button">Reload</button></li>
                <li onclick="removeHnFeed(${item.id})"><button class="dropdown-item" type="button">Remove</button></li>
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
        setTimeout(function () {
          getHnFeed();
        }, 1);
      }

      if (item.feed_type == "producthunt") {
        addProductHuntBtn.disabled = true;
        sidebar += `
         <a id="sidebarLogo-${item.id}" href="#${item.id}" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="${item.feed_name}">
         <img class="rounded-3 m-2" src="./img/logo-product-hunt.svg" alt="" width="40" height="40" />
         </a>
        `;

        feed += `
        <div id="${item.id}" class="feed border-end">
          <div class="feed-header d-flex flex-row justify-content-between bg-body-tertiary border-bottom">
            <div class="d-flex align-items-center">
              <img class="me-2" src="./img/logo-product-hunt.svg" width="20" height="20" alt="" />
              ProductHunt
            </div>
            <div class="btn-group">
              <button type="button" class="btn bg-body-tertiary btn-sm p-0 rounded-1 border-0" data-bs-toggle="dropdown" aria-expanded="false">
                <img src="./img/dots-three-vertical.svg" width="24" height="24" alt="" />
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li onclick="getPhFeed(${item.id})"><button class="dropdown-item" type="button">Reload</button></li>
                <li onclick="removePhFeed(${item.id})"><button class="dropdown-item" type="button">Remove</button></li>
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
        setTimeout(function () {
          getPhFeed();
        }, 1);
      }

      if (item.feed_type == "substack") {
        addNewSubstackBtn.disabled = true;
        sidebar += `
         <a id="sidebarLogo-${item.id}" href="#${item.id}" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="${item.feed_options}">
         <img class="rounded-3 m-2" src="./img/logo-substack.svg" alt="" width="40" height="40" />
         </a>
        `;

        feed += `
        <div id="${item.id}" class="feed border-end">
          <div class="feed-header d-flex flex-row justify-content-between bg-body-tertiary border-bottom">
            <div class="d-flex align-items-center">
              <img class="me-2" src="./img/logo-substack.svg" width="20" height="20" alt="" />
              <p class="text-capitalize">${item.feed_options}</p>
            </div>
            <div class="btn-group">
              <button type="button" class="btn bg-body-tertiary btn-sm p-0 rounded-1 border-0" data-bs-toggle="dropdown" aria-expanded="false">
                <img src="./img/dots-three-vertical.svg" width="24" height="24" alt="" />
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li onclick="getSubstack('${item.feed_options}', ${item.id})"><button class="dropdown-item" type="button">Reload</button></li>
                <li onclick="removeSubstack(${item.id})"><button class="dropdown-item" type="button">Remove</button></li>
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
        setTimeout(function () {
          // Inject SubstackAPI script
          var script = document.createElement("script");
          script.src = "https://substackapi.com/embeds/feed.js";
          document.body.appendChild(script);

          getSubstack(item.feed_options);
        }, 1);
      }

      if (item.feed_type == "unsplash") {
        addUnsplashBtn.disabled = true;
        sidebar += `
         <a id="sidebarLogo-${item.id}" href="#${item.id}" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="${item.feed_name}">
         <img class="rounded-3 m-2" src="./img/logo-unsplash.svg" alt="" width="40" height="40" />
         </a>
        `;

        feed += `
        <div id="${item.id}" class="feed border-end">
          <div class="feed-header d-flex flex-row justify-content-between bg-body-tertiary border-bottom">
            <div class="d-flex align-items-center">
              <img class="me-2" src="./img/logo-unsplash.svg" width="20" height="20" alt="" />
              Unsplash
            </div>
            <div class="btn-group">
              <button type="button" class="btn bg-body-tertiary btn-sm p-0 rounded-1 border-0" data-bs-toggle="dropdown" aria-expanded="false">
                <img src="./img/dots-three-vertical.svg" width="24" height="24" alt="" />
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li onclick="getUnsplashFeed(${item.id})"><button class="dropdown-item" type="button">Reload</button></li>
                <li onclick="removeUnsplashFeed(${item.id})"><button class="dropdown-item" type="button">Remove</button></li>
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
        setTimeout(function () {
          getUnsplashFeed();
        }, 1);
      }

      if (item.feed_type == "youtbe") {
        addNewYoutubeBtn.disabled = true;
        sidebar += `
         <a id="sidebarLogo-${item.id}" href="#${item.id}" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="${item.feed_options}">
         <img class="rounded-3 m-2" src="./img/logo-youtube.svg" alt="" width="40" height="40" />
         </a>
        `;

        feed += `
        <div id="${item.id}" class="feed border-end">
          <div class="feed-header d-flex flex-row justify-content-between bg-body-tertiary border-bottom">
            <div class="d-flex align-items-center">
              <img class="me-2" src="./img/logo-youtube.svg" width="20" height="20" alt="" />
              <p class="text-capitalize">${item.feed_options}</p>
            </div>
            <div class="btn-group">
              <button type="button" class="btn bg-body-tertiary btn-sm p-0 rounded-1 border-0" data-bs-toggle="dropdown" aria-expanded="false">
                <img src="./img/dots-three-vertical.svg" width="24" height="24" alt="" />
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li onclick="getYoutubeChannel('${item.feed_options}', ${item.id})"><button class="dropdown-item" type="button">Reload</button></li>
                <li onclick="removeYoutubeChannel(${item.id})"><button class="dropdown-item" type="button">Remove</button></li>
              </ul>
            </div>
          </div>
          <div id="feed-youtube-${item.id}" class="feed-body">
            <div class="p-2 placeholder-glow">
              <span class="placeholder placeholder-lg col-6 bg-secondary"></span>
              <span class="placeholder col-7 bg-secondary"></span>
              <span class="placeholder col-4 bg-secondary"></span>
              <span class="placeholder placeholder-sm col-2 bg-secondary"></span>
            </div>
          </div>
        </div>
        `;
        setTimeout(function () {
          getYoutubeChannel(item.feed_options);
        }, 1);
      }

      feedContainer.innerHTML = feed;
      sidebarContainer.innerHTML = sidebar;
    });
  }
  if (error) {
    console.log(error);
  }
}
// Super hacky shit to load tooltips
setTimeout(function () {
  // Initialise Bootstrap tooltips
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  const tooltipList = [...tooltipTriggerList].map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl));
}, 1000);

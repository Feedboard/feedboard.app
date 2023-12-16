// Call the loadFeed function when the document is ready
document.addEventListener("DOMContentLoaded", async function () {
  await loadFeed();
});

async function loadFeed() {
  await checkSession();
  const { data, error } = await client.from("feeds").select("*").eq("user_id", user_id).order("id", { ascending: true });

  if (data == "") {
    console.log("Feed is empty");
    empty = `
    <div class="d-flex flex-column align-items-center">
    <p>You do not have any feed</p>
    <button class="btn btn-dark btn-sm" data-bs-toggle="modal" data-bs-target="#newFeedModal" name="add-feed">Add feed</button>
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
         <a id="sidebarLogo-${item.id}" href="#${item.id}" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="r/${item.feed_options}" aria-label="${item.feed_options}">
         <img class="rounded-3 m-2" src="./img/logo-reddit.svg" alt="reddit logo" width="40" height="40" />
         </a>
        `;

        feed += `
        <div id="${item.id}" class="feed border-end">
          <div class="feed-header d-flex flex-row justify-content-between bg-body-tertiary border-bottom">
            <div class="d-flex align-items-center">
              <img class="me-2" src="./img/logo-reddit.svg" width="20" height="20" alt="reddit logo" />
              <p id="subredditName">r/${item.feed_options}</p>
            </div>
            <div class="btn-group">
              <button type="button" name="more" class="btn bg-body-tertiary btn-sm p-0 rounded-1 border-0" data-bs-toggle="dropdown" aria-expanded="false">
                <img class="svg-icon" src="./img/dots-three-vertical.svg" width="24" height="24" alt="dots icon" />
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li onclick="getRedditFeed('${item.feed_options}', ${item.id})"><button name="get-reddit-feed" class="dropdown-item" type="button"><img class="align-text-bottom me-2" src="./img/reload.svg" width="20" height="20" />Reload</button></li>
                <li onclick="removeRedditFeed(${item.id})"><button class="dropdown-item" type="button" name="remove"><img class="align-text-bottom me-2" src="./img/delete.svg" width="20" height="20" />Remove</button></li>
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
        setTimeout(async function () {
          await getRedditFeed(item.feed_options, item.id);
        }, 1);
      }

      if (item.feed_type == "hackernews") {
        addHackerNewsBtn.disabled = true;
        sidebar += `
         <a id="sidebarLogo-${item.id}" href="#${item.id}" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="${item.feed_name}" aria-label="${item.feed_name}">
         <img class="rounded-3 m-2" src="./img/logo-hackernews.svg" alt="hackernews logo" width="40" height="40" />
         </a>
        `;
        feed += `
        <div id="${item.id}" class="feed border-end">
          <div class="feed-header d-flex flex-row justify-content-between bg-body-tertiary border-bottom">
            <div class="d-flex align-items-center">
              <img class="me-2" src="./img/logo-hackernews.svg" width="20" height="20" alt="hackernews logo" />
              Hacker News
            </div>
            <div class="btn-group">
              <button type="button" class="btn bg-body-tertiary btn-sm p-0 rounded-1 border-0" data-bs-toggle="dropdown" aria-expanded="false">
                <img class="svg-icon" src="./img/dots-three-vertical.svg" width="24" height="24" alt="dots icon" />
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li onclick="getHnFeed(${item.id})"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2" src="./img/reload.svg" width="20" height="20" />Reload</button></li>
                <li onclick="removeHnFeed(${item.id})"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2" src="./img/delete.svg" width="20" height="20" />Remove</button></li>
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
        setTimeout(async function () {
          await getHnFeed();
        }, 1);
      }

      if (item.feed_type == "producthunt") {
        addProductHuntBtn.disabled = true;
        sidebar += `
         <a id="sidebarLogo-${item.id}" href="#${item.id}" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="${item.feed_name}" aria-label="${item.feed_name}">
         <img class="rounded-3 m-2" src="./img/logo-product-hunt.svg" alt="producthunt logo" width="40" height="40" />
         </a>
        `;

        feed += `
        <div id="${item.id}" class="feed border-end">
          <div class="feed-header d-flex flex-row justify-content-between bg-body-tertiary border-bottom">
            <div class="d-flex align-items-center">
              <img class="me-2" src="./img/logo-product-hunt.svg" width="20" height="20" alt="producthunt logo" />
              ProductHunt
            </div>
            <div class="btn-group">
              <button type="button" class="btn bg-body-tertiary btn-sm p-0 rounded-1 border-0" data-bs-toggle="dropdown" aria-expanded="false">
                <img class="svg-icon" src="./img/dots-three-vertical.svg" width="24" height="24" alt="dots icon" />
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li onclick="getPhFeed(${item.id})"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2" src="./img/reload.svg" width="20" height="20" />Reload</button></li>
                <li onclick="removePhFeed(${item.id})"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2" src="./img/delete.svg" width="20" height="20" />Remove</button></li>
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
        setTimeout(async function () {
          await getPhFeed();
        }, 1);
      }

      if (item.feed_type == "substack") {
        addNewSubstackBtn.disabled = true;
        sidebar += `
         <a id="sidebarLogo-${item.id}" href="#${item.id}" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="${item.feed_options}" aria-label="${item.feed_options}">
         <img class="rounded-3 m-2" src="./img/logo-substack.svg" alt="substack logo" width="40" height="40" />
         </a>
        `;

        feed += `
        <div id="${item.id}" class="feed border-end">
          <div class="feed-header d-flex flex-row justify-content-between bg-body-tertiary border-bottom">
            <div class="d-flex align-items-center">
              <img class="me-2" src="./img/logo-substack.svg" width="20" height="20" alt="substack logo" />
              <p class="text-capitalize">${item.feed_options}</p>
            </div>
            <div class="btn-group">
              <button type="button" class="btn bg-body-tertiary btn-sm p-0 rounded-1 border-0" data-bs-toggle="dropdown" aria-expanded="false">
                <img class="svg-icon" src="./img/dots-three-vertical.svg" width="24" height="24" alt="dots icon" />
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li onclick="getSubstack('${item.feed_options}', ${item.id})"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2" src="./img/reload.svg" width="20" height="20" />Reload</button></li>
                <li onclick="removeSubstack(${item.id})"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2" src="./img/delete.svg" width="20" height="20" />Remove</button></li>
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
        setTimeout(async function () {
          // Inject SubstackAPI script
          var script = document.createElement("script");
          script.src = "https://substackapi.com/embeds/feed.js";
          document.body.appendChild(script);

          await getSubstack(item.feed_options, item.id);
        }, 1);
      }

      if (item.feed_type == "unsplash") {
        addUnsplashBtn.disabled = true;
        sidebar += `
         <a id="sidebarLogo-${item.id}" href="#${item.id}" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="${item.feed_name}" aria-label="${item.feed_name}">
         <img class="rounded-3 m-2" src="./img/logo-unsplash.svg" alt="unsplash logo" width="40" height="40" />
         </a>
        `;

        feed += `
        <div id="${item.id}" class="feed border-end">
          <div class="feed-header d-flex flex-row justify-content-between bg-body-tertiary border-bottom">
            <div class="d-flex align-items-center">
              <img class="me-2" src="./img/logo-unsplash.svg" width="20" height="20" alt="unsplash logo" />
              Unsplash
            </div>
            <div class="btn-group">
              <button type="button" class="btn bg-body-tertiary btn-sm p-0 rounded-1 border-0" data-bs-toggle="dropdown" aria-expanded="false">
                <img class="svg-icon" src="./img/dots-three-vertical.svg" width="24" height="24" alt="dots icon" />
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li onclick="getUnsplashFeed(${item.id})"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2" src="./img/reload.svg" width="20" height="20" />Reload</button></li>
                <li onclick="removeUnsplashFeed(${item.id})"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2" src="./img/delete.svg" width="20" height="20" />Remove</button></li>
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
        setTimeout(async function () {
          await getUnsplashFeed();
        }, 1);
      }

      if (item.feed_type == "youtube") {
        addNewYoutubeBtn.disabled = true;
        sidebar += `
         <a id="sidebarLogo-${item.id}" href="#${item.id}" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="${item.feed_name}" aria-label="${item.feed_name}">
         <img class="rounded-3 m-2" src="./img/logo-youtube.svg" alt="youtube logo" width="40" height="40" />
         </a>
        `;

        feed += `
        <div id="${item.id}" class="feed border-end">
          <div class="feed-header d-flex flex-row justify-content-between bg-body-tertiary border-bottom">
            <div class="d-flex align-items-center">
              <img class="me-2" src="./img/logo-youtube.svg" width="20" height="20" alt="youtube logo" />
              <p class="text-capitalize">${item.feed_name}</p>
            </div>
            <div class="btn-group">
              <button type="button" class="btn bg-body-tertiary btn-sm p-0 rounded-1 border-0" data-bs-toggle="dropdown" aria-expanded="false">
                <img class="svg-icon" src="./img/dots-three-vertical.svg" width="24" height="24" alt="dots icon" />
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li onclick="getYoutubeChannel('${item.feed_options}', ${item.id})"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2" src="./img/reload.svg" width="20" height="20" />Reload</button></li>
                <li onclick="removeYoutubeChannel(${item.id})"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2" src="./img/delete.svg" width="20" height="20" />Remove</button></li>
              </ul>
            </div>
          </div>
          <div id="feed-youtube-${item.id}" class="list-group list-group-flush feed-body">
            <div class="p-2 placeholder-glow">
              <span class="placeholder placeholder-lg col-6 bg-secondary"></span>
              <span class="placeholder col-7 bg-secondary"></span>
              <span class="placeholder col-4 bg-secondary"></span>
              <span class="placeholder placeholder-sm col-2 bg-secondary"></span>
            </div>
          </div>
        </div>
        `;
        setTimeout(async function () {
          await getYoutubeChannel(item.feed_options, item.id);
        }, 1);
      }

      // Telegram
      if (item.feed_type == "telegram") {
        addNewTelegramChannelBtn.disabled = true;
        sidebar += `
         <a id="sidebarLogo-${item.id}" href="#${item.id}" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="${item.feed_options}" aria-label="${item.feed_options}">
         <img class="rounded-3 m-2" src="./img/logo-telegram.svg" alt="telegram logo" width="40" height="40" />
         </a>
        `;

        feed += `
        <div id="${item.id}" class="feed border-end">
          <div class="feed-header d-flex flex-row justify-content-between bg-body-tertiary border-bottom">
            <div class="d-flex align-items-center">
              <img class="me-2" src="./img/logo-telegram.svg" width="20" height="20" alt="telegram logo" />
              <p class="text-capitalize">${item.feed_options}</p>
            </div>
            <div class="btn-group">
              <button type="button" class="btn bg-body-tertiary btn-sm p-0 rounded-1 border-0" data-bs-toggle="dropdown" aria-expanded="false">
                <img class="svg-icon" src="./img/dots-three-vertical.svg" width="24" height="24" alt="dots icon" />
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li onclick="getTelegramFeed('${item.feed_options}', ${item.id})"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2" src="./img/reload.svg" width="20" height="20" />Reload</button></li>
                <li onclick="removeTelegramFeed(${item.id})"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2" src="./img/delete.svg" width="20" height="20" />Remove</button></li>
              </ul>
            </div>
          </div>
          <div id="feed-telegram-${item.id}" class="list-group list-group-flush feed-body">
            <div class="p-2 placeholder-glow">
              <span class="placeholder placeholder-lg col-6 bg-secondary"></span>
              <span class="placeholder col-7 bg-secondary"></span>
              <span class="placeholder col-4 bg-secondary"></span>
              <span class="placeholder placeholder-sm col-2 bg-secondary"></span>
            </div>
          </div>
        </div>
        `;
        setTimeout(async function () {
          await getTelegramFeed(item.feed_options, item.id);
        }, 1);
      }

      // Pinterest account
      if (item.feed_type == "pinterest-account") {
        addNewPinterestAccountBtn.disabled = true;
        sidebar += `
         <a id="sidebarLogo-${item.id}" href="#${item.id}" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="${item.feed_options}" aria-label="${item.feed_options}">
         <img class="rounded-3 m-2" src="./img/logo-pinterest.svg" alt="pinterest logo" width="40" height="40" />
         </a>
        `;

        feed += `
        <div id="${item.id}" class="feed border-end">
          <div class="feed-header d-flex flex-row justify-content-between bg-body-tertiary border-bottom">
            <div class="d-flex align-items-center">
              <img class="me-2" src="./img/logo-pinterest.svg" width="20" height="20" alt="pinterest logo" />
              <p class="text-capitalize">${item.feed_options}</p>
            </div>
            <div class="btn-group">
              <button type="button" class="btn bg-body-tertiary btn-sm p-0 rounded-1 border-0" data-bs-toggle="dropdown" aria-expanded="false">
                <img class="svg-icon" src="./img/dots-three-vertical.svg" width="24" height="24" alt="dots icon" />
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li onclick="getPinterestAccount('${item.feed_options}', ${item.id})"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2" src="./img/reload.svg" width="20" height="20" />Reload</button></li>
                <li onclick="removePinterestAccount(${item.id})"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2" src="./img/delete.svg" width="20" height="20" />Remove</button></li>
              </ul>
            </div>
          </div>
          <div id="feed-pinterestAccount-${item.id}" class="list-group list-group-flush feed-body">
            <div class="p-2 placeholder-glow">
              <span class="placeholder placeholder-lg col-6 bg-secondary"></span>
              <span class="placeholder col-7 bg-secondary"></span>
              <span class="placeholder col-4 bg-secondary"></span>
              <span class="placeholder placeholder-sm col-2 bg-secondary"></span>
            </div>
          </div>
        </div>
        `;
        setTimeout(async function () {
          await getPinterestAccount(item.feed_options, item.id);
        }, 1);
      }

      // Pinterest board
      if (item.feed_type == "pinterest-board") {
        addNewPinterestBoardBtn.disabled = true;
        sidebar += `
         <a id="sidebarLogo-${item.id}" href="#${item.id}" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="${item.feed_options}" aria-label="${item.feed_options}">
         <img class="rounded-3 m-2" src="./img/logo-pinterest.svg" alt="pinterest logo" width="40" height="40" />
         </a>
        `;

        feed += `
        <div id="${item.id}" class="feed border-end">
          <div class="feed-header d-flex flex-row justify-content-between bg-body-tertiary border-bottom">
            <div class="d-flex align-items-center">
              <img class="me-2" src="./img/logo-pinterest.svg" width="20" height="20" alt="pinterest logo" />
              <p class="text-capitalize">${item.feed_options}</p>
            </div>
            <div class="btn-group">
              <button type="button" class="btn bg-body-tertiary btn-sm p-0 rounded-1 border-0" data-bs-toggle="dropdown" aria-expanded="false">
                <img class="svg-icon" src="./img/dots-three-vertical.svg" width="24" height="24" alt="dots icon" />
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li onclick="getPinterestBoard('${item.feed_options}', ${item.id})"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2" src="./img/reload.svg" width="20" height="20" />Reload</button></li>
                <li onclick="removePinterestBoard(${item.id})"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2" src="./img/delete.svg" width="20" height="20" />Remove</button></li>
              </ul>
            </div>
          </div>
          <div id="feed-pinterestBoard-${item.id}" class="list-group list-group-flush feed-body">
            <div class="p-2 placeholder-glow">
              <span class="placeholder placeholder-lg col-6 bg-secondary"></span>
              <span class="placeholder col-7 bg-secondary"></span>
              <span class="placeholder col-4 bg-secondary"></span>
              <span class="placeholder placeholder-sm col-2 bg-secondary"></span>
            </div>
          </div>
        </div>
        `;
        setTimeout(async function () {
          await getPinterestBoard(item.feed_options, item.id);
        }, 1);
      }

      // Coingecko Top 100 board
      if (item.feed_type == "coingecko") {
        addCoingeckoTopBtn.disabled = true;
        sidebar += `
         <a id="sidebarLogo-${item.id}" href="#${item.id}" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="${item.feed_name}" aria-label="${item.feed_options}">
         <img class="rounded-3 m-2" src="./img/logo-coingecko.svg" alt="coingecko logo" width="40" height="40" />
         </a>
        `;

        feed += `
        <div id="${item.id}" class="feed border-end">
          <div class="feed-header d-flex flex-row justify-content-between bg-body-tertiary border-bottom">
            <div class="d-flex align-items-center">
              <img class="me-2" src="./img/logo-coingecko.svg" width="20" height="20" alt="coingecko logo" />
              <p class="text-capitalize">${item.feed_options}</p>
            </div>
            <div class="btn-group">
              <button type="button" class="btn bg-body-tertiary btn-sm p-0 rounded-1 border-0" data-bs-toggle="dropdown" aria-expanded="false">
                <img class="svg-icon" src="./img/dots-three-vertical.svg" width="24" height="24" alt="dots icon" />
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li onclick="getCoingeckoTop()"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2" src="./img/reload.svg" width="20" height="20" />Reload</button></li>
                <li onclick="removeCoingeckoTop(${item.id})"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2" src="./img/delete.svg" width="20" height="20" />Remove</button></li>
              </ul>
            </div>
          </div>
          <div id="feed-coingeckoTop" class="list-group list-group-flush feed-body">
            <div class="p-2 placeholder-glow">
              <span class="placeholder placeholder-lg col-6 bg-secondary"></span>
              <span class="placeholder col-7 bg-secondary"></span>
              <span class="placeholder col-4 bg-secondary"></span>
              <span class="placeholder placeholder-sm col-2 bg-secondary"></span>
            </div>
          </div>
        </div>
        `;
        setTimeout(async function () {
          await getCoingeckoTop();
        }, 1);
      }

      // Medium
      if (item.feed_type == "medium") {
        sidebar += `
         <a id="sidebarLogo-${item.id}" href="#${item.id}" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="${item.feed_options}" aria-label="${item.feed_options}">
         <img class="rounded-3 m-2 svg-icon" src="./img/logo-medium.svg" alt="medium logo" width="40" height="40" />
         </a>
        `;

        feed += `
        <div id="${item.id}" class="feed border-end">
          <div class="feed-header d-flex flex-row justify-content-between bg-body-tertiary border-bottom">
            <div class="d-flex align-items-center">
              <img class="me-2 svg-icon" src="./img/logo-medium.svg" width="20" height="20" alt="medium logo" />
              <p id="mediumName">${item.feed_options}</p>
            </div>
            <div class="btn-group">
              <button type="button" name="more" class="btn bg-body-tertiary btn-sm p-0 rounded-1 border-0" data-bs-toggle="dropdown" aria-expanded="false">
                <img class="svg-icon" src="./img/dots-three-vertical.svg" width="24" height="24" alt="dots icon" />
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li onclick="getMediumFeed('${item.feed_options}', ${item.id})"><button name="get-medium-feed" class="dropdown-item" type="button"><img class="align-text-bottom me-2" src="./img/reload.svg" width="20" height="20" />Reload</button></li>
                <li onclick="removeMediumFeed(${item.id})"><button class="dropdown-item" type="button" name="remove"><img class="align-text-bottom me-2" src="./img/delete.svg" width="20" height="20" />Remove</button></li>
              </ul>
            </div>
          </div>
          <div id="feed-medium-${item.id}" class="list-group list-group-flush feed-body">
            <div class="p-2 placeholder-glow">
              <span class="placeholder placeholder-lg col-6 bg-secondary"></span>
              <span class="placeholder col-7 bg-secondary"></span>
              <span class="placeholder col-4 bg-secondary"></span>
              <span class="placeholder placeholder-sm col-2 bg-secondary"></span>
            </div>
          </div>
        </div>
        `;
        setTimeout(async function () {
          await getMediumFeed(item.feed_options, item.id);
        }, 1);
      }

      // Behance
      if (item.feed_type == "behance") {
        sidebar += `
         <a id="sidebarLogo-${item.id}" href="#${item.id}" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="${item.feed_options}" aria-label="${item.feed_options}">
         <img class="rounded-3 m-2" src="./img/logo-behance.svg" alt="Behance logo" width="40" height="40" />
         </a>
        `;

        feed += `
        <div id="${item.id}" class="feed border-end">
          <div class="feed-header d-flex flex-row justify-content-between bg-body-tertiary border-bottom">
            <div class="d-flex align-items-center">
              <img class="me-2" src="./img/logo-behance.svg" width="20" height="20" alt="Behance logo" />
              <p id="behanceName">${item.feed_options}</p>
            </div>
            <div class="btn-group">
              <button type="button" name="more" class="btn bg-body-tertiary btn-sm p-0 rounded-1 border-0" data-bs-toggle="dropdown" aria-expanded="false">
                <img class="svg-icon" src="./img/dots-three-vertical.svg" width="24" height="24" alt="dots icon" />
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li onclick="getBehanceFeed('${item.feed_options}', ${item.id})"><button name="get-behance-feed" class="dropdown-item" type="button"><img class="align-text-bottom me-2" src="./img/reload.svg" width="20" height="20" />Reload</button></li>
                <li onclick="removeBehanceFeed(${item.id})"><button class="dropdown-item" type="button" name="remove"><img class="align-text-bottom me-2" src="./img/delete.svg" width="20" height="20" />Remove</button></li>
              </ul>
            </div>
          </div>
          <div id="feed-behance-${item.id}" class="list-group list-group-flush feed-body">
            <div class="p-2 placeholder-glow">
              <span class="placeholder placeholder-lg col-6 bg-secondary"></span>
              <span class="placeholder col-7 bg-secondary"></span>
              <span class="placeholder col-4 bg-secondary"></span>
              <span class="placeholder placeholder-sm col-2 bg-secondary"></span>
            </div>
          </div>
        </div>
        `;
        setTimeout(async function () {
          await getBehanceFeed(item.feed_options, item.id);
        }, 1);
      }

      feedContainer.innerHTML = feed;
      sidebarContainer.innerHTML = sidebar;
    });
  }
  if (error) {
    console.log(error);
  }

  initTooltip();
}

function initTooltip() {
  // Initialise Bootstrap tooltips
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  const tooltipList = [...tooltipTriggerList].map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl));
}

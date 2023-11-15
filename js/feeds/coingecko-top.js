async function getCoingeckoTop() {
  console.log("Loading Coingecko Too 100...");
  const cgURL = "https://web-production-ba07.up.railway.app/https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h&locale=en";
  const feedCoingeckoTop = document.getElementById("feed-coingeckoTop");

  await fetch(cgURL, {
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      feedCoingeckoTop.innerHTML = "";
      let entry = "";
      data.forEach((el) => {
        // console.log(el);
        let coinId = el.id;
        let coinImage = el.image;
        let coinName = el.name;
        let symbol = el.symbol;
        let currentPrice = el.current_price;
        let change24h = el.price_change_percentage_24h.toFixed(2);
        entry += `
              <a href="https://www.coingecko.com/en/coins/${coinId}" class="d-flex justify-content-between list-group-item list-group-item-action align-items-center" target="_blank">
              <div class="d-flex align-items-center">
                <img class="rounded-3 me-2" src="${coinImage} width="32" height="32" alt="${coinId}"/>
                <div>
                  <p class="fw-semibold">${coinName}</p>
                  <p class="text-secondary small text-uppercase">${symbol}</p>
                </div>
                </div>
                <div class="d-flex">
                  <p class="text-secondary small me-4">$${currentPrice}</p>
                  ${change24h >= 0 ? `<p class="text-success small">+${change24h}</p>` : `<p class="text-danger small">${change24h}</p>`}
                </div>
              </a>
              `;
      });
      feedCoingeckoTop.innerHTML = entry;
    });
}

// Add Coingecko Top 100
const addCoingeckoTopBtn = document.getElementById("addCoingeckoTop");

addCoingeckoTopBtn.addEventListener("click", async function () {
  closeModal("newFeedModal");

  const { data, error } = await client
    .from("feeds")
    .insert([{ feed_name: "Coingecko Top 100", feed_options: "coingecko", feed_type: "coingecko", user_id: user_id }])
    .select();

  if (data) {
    showToast("Coingecko Top 100 added to your feed");
    addCoingeckoTopBtn.disabled = true;
    const feedContainer = document.getElementById("feedContainer");
    const sidebarContainer = document.getElementById("feedLogoContainer");
    let feed = "";
    let sidebar = "";

    sidebar += `
         <a id="sidebarLogo-${data[0].id}" href="#${data[0].id}" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="${data[0].feed_name}" aria-label="${data[0].feed_name}">
         <img class="rounded-3 m-2" src="./img/logo-coingecko.svg" alt="coingecko logo" width="40" height="40" />
         </a>
        `;

    feed += `
        <div id="${data[0].id}" class="feed border-end">
          <div class="feed-header d-flex flex-row justify-content-between bg-body-tertiary border-bottom">
            <div class="d-flex align-items-center">
              <img class="me-2" src="./img/logo-coingecko.svg" width="20" height="20" alt="coingecko logo" />
              Coingecko Top 100
            </div>
            <div class="btn-group">
              <button type="button" name="options" class="btn bg-body-tertiary btn-sm p-0 rounded-1 border-0" data-bs-toggle="dropdown" aria-expanded="false">
                <img src="./img/dots-three-vertical.svg" width="24" height="24" alt="dots icon" />
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li onclick="getHnFeed(${data[0].id})"><button class="dropdown-item" type="button" name="reload">Reload</button></li>
                <li onclick="removeHnFeed(${data[0].id})"><button class="dropdown-item" type="button" name="remove">Remove</button></li>
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
    hideEmpty();
    feedContainer.innerHTML += feed;
    sidebarContainer.innerHTML += sidebar;
    scrollToPos(data[0].id);
    getCoingeckoTop();
  }

  if (error) {
    console.log(error);
  }
  initTooltip();
});

// Remove Coingecko Top 100
async function removeCoingeckoTop(id) {
  const { error } = await client.from("feeds").delete().eq("id", id);
  if (error) {
    console.log(error);
  } else {
    console.log("Deleted");
    showToast("Feed deleted");
    addCoingeckoTopBtn.disabled = false;

    let feedContainer = document.getElementById(id);
    let sidebarLogo = document.getElementById("sidebarLogo-" + id);
    feedContainer.remove();
    sidebarLogo.remove();
  }
}

async function getGenericRss(link, id) {
  console.log("Loading Generic RSS...");
  const rssURL = "https://web-production-09ad.up.railway.app/" + link;
  const feedGenericRSS = document.getElementById("feed-genericRSS-" + id);

  await fetch(rssURL, {
    headers: {
      "Access-Control-Allow-Origin": rssURL,
      "Access-Control-Allow-Headers": "content-type",
    },
  })
    .then((response) => response.text())
    .then((str) => new window.DOMParser().parseFromString(str, "text/xml"))
    .then((data) => {
      const entries = data.querySelectorAll("item");
      feedGenericRSS.innerHTML = "";
      let entry = "";

      if (entries.length <= 0) {
        console.log("not ok");
        entry += `
        <div class="alert alert-warning d-flex align-items-center border-0 rounded-0 p-2" role="alert">
          <img class="me-2" src="./img/warning-diamond.svg" width="20" height="20" alt="warning icon" />
          <div>
            This link seems to be invalid or the website doesn't have any RSS feed.
          </div>
        </div>
              `;
        feedGenericRSS.innerHTML = entry;
      }

      entries.forEach((el) => {
        let title = el.querySelector("title").textContent;
        let link = el.querySelector("link").innerHTML;
        let description;
        if (el.querySelector("description")) {
          description = el.querySelector("description").textContent;
          truncatedContent = description.slice(0, 160) + "...";
        }
        let enclosure;
        if (el.querySelector("enclosure")) {
          enclosure = el.querySelector("enclosure").getAttribute("url");
        }
        let mediaContent;
        if (el.querySelector("content")) {
          mediaContent = el.querySelector("content").getAttribute("url");
        }

        let pubDate;
        if (el.querySelector("pubDate")) {
          pubDate = convertHnDate(el.querySelector("pubDate").innerHTML);
        }
        entry += `
              <a href="${link}" class="list-group-item list-group-item-action" target="_blank">
              <p class="fw-semibold">${title}</p>
              ${enclosure ? `<img class="img-fluid rounded-3" src="${enclosure}" alt="${title}" loading="lazy" onError="this.onerror=null;this.src='./img/image-placeholder.png';" />` : ""}
              ${mediaContent ? `<img class="img-fluid rounded-3" src="${mediaContent}" alt="${title}" loading="lazy" onError="this.onerror=null;this.src='./img/image-placeholder.png';" />` : ""}
              ${description ? `<p class="text-secondary small text-break">${truncatedContent}</p>` : ""}
              ${pubDate ? `<p class="text-secondary small">${pubDate}</p>` : ""}
              </a>
              `;
      });
      feedGenericRSS.innerHTML = entry;
    });
}

// getGenericRSS("https://hnrss.org/newest", 1);
// getGenericRSS("https://www.dailytelegraph.com.au/news/national/rss", 1);
// getGenericRSS("https://www.ecodibergamo.it/feeds/latesthp/268/", 1);
// getGenericRSS("https://www.repubblica.it/rss/tecnologia/rss2.0.xml", 1);
// getGenericRSS("https://www.dailymail.co.uk/articles.rss", 1);
// getGenericRSS("https://www.coindesk.com/arc/outboundfeeds/rss/", 1);
// getGenericRSS("https://cointelegraph.com/rss", 1); //Error
// getGenericRSS("https://news.bitcoin.com/feed", 1); // Formatting image error
// getGenericRSS("https://decrypt.co/feed", 1);
// getGenericRSS("https://www.investing.com/rss/news.rss", 1);
// getGenericRSS("https://finance.yahoo.com/news/rssindex/", 1);
// getGenericRSS("https://www.cnbc.com/id/10000664/device/rss/rss.html", 1);
// getGenericRSS("https://feeds.bbci.co.uk/news/rss.xml", 1);
// getGenericRSS("https://feeds.feedburner.com/TechCrunch/", 1); //Error
// getGenericRSS("https://www.forbes.com/innovation/feed/", 1);
// getGenericRSS("https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml", 1);
// getGenericRSS("http://rss.cnn.com/rss/edition.rss", 1); //Error
// getGenericRSS("https://feeds.feedburner.com/TEDTalks_video", 1); //Error
// getGenericRSS("https://www.wired.com/feed/", 1); // Could be improved with thumbnails
// getGenericRSS("https://www.theguardian.com/uk/rss", 1);
// getGenericRSS("https://feeds.a.dj.com/rss/RSSWorldNews.xml", 1);
// getGenericRSS("https://www.technologyreview.com/feed/", 1);
// getGenericRSS("https://www.espn.com/espn/rss/news", 1);
// getGenericRSS("https://www.vox.com/rss/index.xml", 1);
// getGenericRSS("", 1);

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
               ${data[0].feed_name}
            </div>
            <div class="btn-group">
              <button type="button" name="options" class="btn bg-body-tertiary btn-sm p-0 rounded-1 border-0" data-bs-toggle="dropdown" aria-expanded="false">
                <img class="svg-icon" src="./img/dots-three-vertical.svg" width="24" height="24" alt="dots icon" />
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li onclick="getGenericRss(${data[0].id})"><button class="dropdown-item" type="button" name="reload"><img class="align-text-bottom me-2 svg-icon" src="./img/reload.svg" width="20" height="20" />Reload</button></li>
                <li onclick="removeRssFeed(${data[0].id})"><button class="dropdown-item" type="button" name="remove"><img class="align-text-bottom me-2 svg-icon" src="./img/delete.svg" width="20" height="20" />Remove</button></li>
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

// Check RSS feed validity
async function isRssLinkValid(rssLink) {
  try {
    const response = await fetch("https://web-production-09ad.up.railway.app/" + rssLink);
    const text = await response.text();
    // Check if the response is in a valid RSS format
    if (response.ok && text.includes("<rss") && text.includes("</rss>")) {
      return true;
    } else {
      return false;
    }
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

    const str = await response.text();
    const data = new window.DOMParser().parseFromString(str, "text/xml");

    let rssTitle;
    if (data.querySelector("channel")) {
      rssTitle = data.querySelector("channel").querySelector("title").textContent;
      formattedRssTitle = rssTitle.toString();
      return formattedRssTitle;
    } else {
      throw new Error("No channel found in the XML data");
    }
  } catch (error) {
    console.error("Error fetching or parsing RSS data:", error);
    throw error;
  }
}

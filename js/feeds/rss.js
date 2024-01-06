async function getGenericRSS(link, id) {
  console.log("Loading Generic RSS...");
  const rssURL = "https://web-production-09ad.up.railway.app/" + link;
  // const feedGenericRSS = document.getElementById("feed-genericRSS" + id);
  const feedGenericRSS = document.getElementById("feed-genericRSS");
  //Remove
  const title = document.getElementById("title");

  await fetch(rssURL, {
    headers: {
      "Access-Control-Allow-Origin": rssURL,
      "Access-Control-Allow-Headers": "content-type",
    },
  })
    .then((response) => response.text())
    .then((str) => new window.DOMParser().parseFromString(str, "text/xml"))
    .then((data) => {
      console.log(data);

      let channelTitle;
      if (data.querySelector("channel")) {
        channelTitle = data.querySelector("channel").querySelector("title").textContent;
      }
      title.innerHTML = channelTitle;
      const entries = data.querySelectorAll("item");
      feedGenericRSS.innerHTML = "";
      let entry = "";
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
              <hr>
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
getGenericRSS("https://www.vox.com/rss/index.xml", 1);
// getGenericRSS("", 1);

// Add HackerNews
// const addHackerNewsBtn = document.getElementById("addHackerNews");

// addHackerNewsBtn.addEventListener("click", async function () {
//   closeModal("newFeedModal");

//   const { data, error } = await client
//     .from("feeds")
//     .insert([{ feed_name: "Hacker News", feed_options: "hackernews", feed_type: "hackernews", user_id: user_id }])
//     .select();

//   if (data) {
//     showToast("HackerNews added to your feed");
//     addHackerNewsBtn.disabled = true;
//     console.log(data);
//     const feedContainer = document.getElementById("feedContainer");
//     const sidebarContainer = document.getElementById("feedLogoContainer");
//     let feed = "";
//     let sidebar = "";

//     sidebar += `
//          <a id="sidebarLogo-${data[0].id}" href="#${data[0].id}" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="${data[0].feed_name}" aria-label="${data[0].feed_name}">
//          <img class="rounded-3 m-2" src="./img/logo-hackernews.svg" alt="hackernews logo" width="40" height="40" />
//          </a>
//         `;

//     feed += `
//         <div id="${data[0].id}" class="feed border-end">
//           <div class="feed-header d-flex flex-row justify-content-between bg-body-tertiary border-bottom">
//             <div class="d-flex align-items-center">
//               <img class="me-2" src="./img/logo-hackernews.svg" width="20" height="20" alt="hackernews logo" />
//               Hacker News
//             </div>
//             <div class="btn-group">
//               <button type="button" name="options" class="btn bg-body-tertiary btn-sm p-0 rounded-1 border-0" data-bs-toggle="dropdown" aria-expanded="false">
//                 <img class="svg-icon" src="./img/dots-three-vertical.svg" width="24" height="24" alt="dots icon" />
//               </button>
//               <ul class="dropdown-menu dropdown-menu-end">
//                 <li onclick="getHnFeed(${data[0].id})"><button class="dropdown-item" type="button" name="reload"><img class="align-text-bottom me-2 svg-icon" src="./img/reload.svg" width="20" height="20" />Reload</button></li>
//                 <li onclick="removeHnFeed(${data[0].id})"><button class="dropdown-item" type="button" name="remove"><img class="align-text-bottom me-2 svg-icon" src="./img/delete.svg" width="20" height="20" />Remove</button></li>
//               </ul>
//             </div>
//           </div>
//           <div id="feed-hackernews" class="list-group list-group-flush feed-body">
//             <div class="p-2 placeholder-glow">
//               <span class="placeholder placeholder-lg col-6 bg-secondary"></span>
//               <span class="placeholder col-7 bg-secondary"></span>
//               <span class="placeholder col-4 bg-secondary"></span>
//               <span class="placeholder placeholder-sm col-2 bg-secondary"></span>
//             </div>
//           </div>
//         </div>
//         `;
//     hideEmpty();
//     feedContainer.innerHTML += feed;
//     sidebarContainer.innerHTML += sidebar;
//     scrollToPos(data[0].id);
//     getHnFeed(data[0].id);
//   }

//   if (error) {
//     console.log(error);
//   }
//   initTooltip();
// });

// Remove hackernews
async function removeHnFeed(id) {
  const { error } = await client.from("feeds").delete().eq("id", id);
  if (error) {
    console.log(error);
  } else {
    console.log("Deleted");
    showToast("Feed deleted");
    addHackerNewsBtn.disabled = false;

    let feedContainer = document.getElementById(id);
    let sidebarLogo = document.getElementById("sidebarLogo-" + id);
    feedContainer.remove();
    sidebarLogo.remove();
  }
}

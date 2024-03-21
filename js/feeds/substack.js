async function getSubstack(substack, id) {
  console.log("Loading Substack for " + substack + "...");
  const substackURL = "https://substackapi.com/api/feeds/" + substack + ".substack.com?limit=12&sort=new";
  const substackFeed = document.getElementById("substack-feed-" + id);

  await fetch(substackURL, {
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      substackFeed.innerHTML = "";
      let substackPost = "";
      data.forEach((el) => {
        const reactionValue = Object.values(el.reactions)[0];
        const truncatedContent = el.description.slice(0, 160) + "...";
        substackPost += `
        <div class="list-group-item list-group-item-action">
        <a href="${el.canonical_url}" class="text-body text-decoration-none" target="_blank">
          <p class="fw-semibold mb-2">${el.title}</p>
          <p class="text-secondary small mb-2">${truncatedContent}</p>
        </a>
        <div class="d-flex flex-row justify-content-between align-item-center">
          <div class="d-flex flex-row">
            <p class="text-uppercase text-secondary small me-3">${el.publishedBylines[0].name}</p>
            <p class="text-uppercase text-secondary small me-3">${el.post_date}</p>
            <div class="d-flex flex-row align-items-center">
              <img src="./img/love.svg" width="16" height="16">
              <p class="text-uppercase text-secondary small me-3 ms-1">${reactionValue}</p>
            </div>
          </div>
          <button class="btn btn-bookmark p-0 border-0" data-bm-title="${el.title}" data-bm-link="${el.canonical_url}" onclick="bookmarkThis(this)">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.77,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32Z"></path></svg>
            </button>
          </div>
        </div>
        `;
      });
      substackPost += `
      <div class="bg-dark-subtle py-4 px- text-center">
        <p class="text-secondary small">You reached the end of the feed</p>
      </div>
      `;
      substackFeed.innerHTML = substackPost;
    });
}

// Add new substack
const addNewSubstackBtn = document.getElementById("addNewSubstack");
const newSubstackName = document.getElementById("newSubstackName");

newSubstackName.addEventListener("input", function () {
  checkInputFill(newSubstackName, addNewSubstackBtn);
});

addNewSubstackBtn.addEventListener("click", async function () {
  addNewSubstackBtn.disabled = true;

  if (await isSubstackValid(newSubstackName.value)) {
    closeModal("newFeedModal");

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
              <p class="feed-title">${data[0].feed_options}<p>
            </div>
            <div class="btn-group">
              <button type="button" class="btn bg-body-tertiary btn-sm p-0 rounded-1 border-0" data-bs-toggle="dropdown" aria-expanded="false">
                <img class="svg-icon" src="./img/dots-three-vertical.svg" width="24" height="24" alt="dots icon" />
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li onclick="getSubstack('${data[0].feed_options}', ${data[0].id})"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2 svg-icon" src="./img/reload.svg" width="20" height="20" />Reload</button></li>
                <li onclick="removeSubstack(${data[0].id})"><button class="dropdown-item" type="button"><img class="align-text-bottom me-2 svg-icon" src="./img/delete.svg" width="20" height="20" />Remove</button></li>
              </ul>
            </div>
          </div>
          <div id="substack-feed-${data[0].id}" class="list-group list-group-flush feed-body">
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
      getSubstack(data[0].feed_options, data[0].id);
    }

    newSubstackName.value = "";

    if (error) {
      console.log(error);
    }
  } else {
    addNewSubstackBtn.disabled = false;
    document.getElementById("substackErrorHelp").hidden = false;
    setTimeout(() => {
      document.getElementById("substackErrorHelp").hidden = true;
    }, 5000);
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

// Check if Substack is valid
async function isSubstackValid(substackName) {
  const substackURL = "https://substackapi.com/api/feeds/" + substackName + ".substack.com?limit=12&sort=new";
  try {
    const response = await fetch(substackURL, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();

    if (data.length > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

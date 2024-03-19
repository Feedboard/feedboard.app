const bookmarkBtn = document.getElementById("bookmarkBtn");

// Save a bookmark
async function bookmarkThis(el) {
  el.disabled = true;
  const bookmarkTitle = el.getAttribute("data-bm-title");
  const bookmarkLink = el.getAttribute("data-bm-link");

  const { data, error } = await client
    .from("bookmarks")
    .insert([{ bookmark_title: bookmarkTitle, bookmark_link: bookmarkLink, user_id: user_id }])
    .select();

  if (data) {
    showToast("Article added to your bookmarks");
    el.disabled = false;
  }
  if (error) {
    showToast("We couldn't save your bookmark");
    console.log(error);
    el.disabled = false;
  }
}

// Get my bookmarks
bookmarkBtn.addEventListener("click", async function () {
  console.log("Loading bookmarks...");
  const { data, error } = await client.from("bookmarks").select("*").eq("user_id", user_id).order("id", { ascending: true });

  if (data) {
    const bookmarkBody = document.getElementById("bookmarkBody");
    // console.log(data);
    if (data.length > 0) {
      let bookmarksList = "";
      data.forEach((item) => {
        bookmarksList += `
      <div id="bookmark-${item.id}" class="list-group-item list-group-item-actio px-0">
      <div class="d-flex justify-content-between align-items-start">
        <a class="text-decoration-none" href="${item.bookmark_link}" target="_blank">  
          <p class="fw-semibold text-body">${item.bookmark_title}</p>
          <p class="text-secondary small">Saved on ${convertHnDate(item.created_at)}</p>
        </a>
        <button id="delete-bookmark-${item.id}" class="btn btn-link btn-delete-bookmark border-0" onclick="deleteBookmark(${item.id})">
          <svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="text-secondary" viewBox="0 0 256 256"><path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path></svg>
        </button>
        </div>
      </div>
      `;
      });
      bookmarkBody.innerHTML = `
      <div class="list-group list-group-flush feed-body">
      ${bookmarksList}
      </div>
      `;
    } else {
      bookmarkBody.innerHTML = `
      <div class="w-100 h-100 d-flex flex-column justify-content-center align-items-center text-center">
      <img class="mb-3" src="./img/bookmark-placeholder.svg" width="250"/>
        <p class="text-secondary small">
            You don't have any bookmarks yet.<br />
            Bookmark some articles to save them here.
        </p>
        </div>
      `;
    }
  }
  if (error) {
    console.log(error);
  }
});

async function deleteBookmark(id) {
  document.getElementById("delete-bookmark-" + id).disabled = true;
  const { error } = await client.from("bookmarks").delete().eq("id", id);
  if (error) {
    console.log(error);
  } else {
    console.log("Bookmark deleted");
    document.getElementById("bookmark-" + id).remove();
    showToast("Bookmark deleted");
  }
}

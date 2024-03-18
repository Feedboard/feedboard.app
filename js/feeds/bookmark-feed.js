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
    console.log(data);
    if (data.length > 0) {
      console.log("you got stuff");
      let bookmarksList = "";
      data.forEach((item) => {
        bookmarksList += `
      <a href="${item.bookmark_link}" class="list-group-item list-group-item-action" target="_blank">
        <p class="fw-semibold">${item.bookmark_title}</p>
      </a>
      `;
      });
      bookmarkBody.innerHTML = `
      <div class="list-group list-group-flush feed-body">
      ${bookmarksList}
      </div>
      `;
    } else {
      console.log("You got nothing");
      bookmarkBody.innerHTML = `
      <div class="w-100 h-100 d-flex justify-content-center align-items-center text-center">
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

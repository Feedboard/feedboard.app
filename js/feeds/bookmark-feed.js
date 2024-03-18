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

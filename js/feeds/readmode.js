const readmodeBody = document.getElementById("readmodeBody");

async function readmodeThis(el) {
  readmodeBody.innerHTML = `
  <div class="w-100 h-100 d-flex flex-column justify-content-center align-items-center">
    <p class="text-secondary small mb-2">Loading your article...</p>
    <img class="svg-icon" src="./img/spinner.svg" width="24" height="24" alt="loading spinner" />
  </div>
  `;
  let readmodeModal = document.getElementById("readmodeModal");
  let modal = new bootstrap.Modal(readmodeModal);
  modal.show();

  const link = el.getAttribute("data-rm-link");
  let response = await fetch("https://web-production-09ad.up.railway.app/https://clearthis.page/?u=" + link);
  let html = await response.text();
  let doc = new DOMParser().parseFromString(html, "text/html");
  let reader = new Readability(doc);
  let article = reader.parse();
  console.log(article);
  if (article && article.textContent === "Content not availableSorry, it was not possible to extract content from this website.Return") {
    let response = await fetch("https://web-production-09ad.up.railway.app/" + link);
    let html = await response.text();
    let doc = new DOMParser().parseFromString(html, "text/html");
    let reader = new Readability(doc);
    let article = reader.parse();
    console.log(article);
    if (article && article.title) {
      article.title = article.title.replace(/\(via:.*?\)/g, "").trim();
    }
    readmodeBody.innerHTML = `
    <h1 id="readmodeArticleTitle" class="fw-bold mb-2">${article ? article.title : "No title available"}</h1>
    <div id="readmodeArticleBody">${article ? article.content : "No content available"}</div>
    `;
  } else {
    if (article && article.title) {
      article.title = article.title.replace(/\(via:.*?\)/g, "").trim();
    }
    readmodeBody.innerHTML = `
    <h1 id="readmodeArticleTitle" class="fw-bold mb-2">${article ? article.title : "No title available"}</h1>
    <div id="readmodeArticleBody">${article ? article.content : "No content available"}</div>
    `;
  }
}

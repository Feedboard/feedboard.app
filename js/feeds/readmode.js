const readmodeBody = document.getElementById("readmodeBody");

async function readmodeThis(el) {
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
  if (article.textContent === "Content not availableSorry, it was not possible to extract content from this website.Return") {
    let response = await fetch("https://web-production-09ad.up.railway.app/" + link);
    let html = await response.text();
    let doc = new DOMParser().parseFromString(html, "text/html");
    let reader = new Readability(doc);
    let article = reader.parse();
    console.log(article);
    article.title = article.title.replace(/\(via:.*?\)/g, "").trim();
    readmodeBody.innerHTML = `
    <h1 id="readmodeArticleTitle" class="fw-bold mb-2">${article.title}</h1>
    <div id="readmodeArticleBody">${article.content}</div>
    `;
  } else {
    article.title = article.title.replace(/\(via:.*?\)/g, "").trim();
    readmodeBody.innerHTML = `
    <h1 id="readmodeArticleTitle" class="fw-bold mb-2">${article.title}</h1>
    <div id="readmodeArticleBody">${article.content}</div>
    `;
  }
}

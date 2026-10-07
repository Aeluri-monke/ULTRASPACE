(() => {
  const id = new URLSearchParams(window.location.search).get("id");
  const article = window.ULTRASPACE_DATA.articles.find((item) => item.id === id);
  const page = document.querySelector("#article-page");
  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  if (!article) {
    page.innerHTML = `<section class="article-record"><h1>Archive record not found</h1><p>The requested clipping may have been moved, misfiled, or eaten by the 2006 content-management system.</p><p><a href="./campus.html">Return to the campus archive</a></p></section>`;
    return;
  }
  document.title = `${article.headline} ★ U.A. Campus Chronicle`;
  page.innerHTML = `
    <article class="article-record">
      <a class="back-link" href="./campus.html">← Return to campus archive</a>
      <span class="campus-section">${escapeHtml(article.category)}</span>
      <h1>${escapeHtml(article.headline)}</h1>
      <p class="article-deck">${escapeHtml(article.deck)}</p>
      <div class="article-byline">${escapeHtml(article.byline)}　•　${escapeHtml(article.date)}</div>
      <div class="article-photo"><span>${escapeHtml(article.initials)}</span><small>ARCHIVE IMAGE<br>TO BE REPLACED</small></div>
      <div class="article-copy">${article.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</div>
      <div class="article-end">— END OF ARCHIVE RECORD —</div>
    </article>
  `;
})();

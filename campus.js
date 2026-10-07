(() => {
  const articles = window.ULTRASPACE_DATA.articles;
  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  document.querySelector("#campus-articles").innerHTML = articles.map((article, index) => `
    <article id="${index === 0 ? "faculty" : "news"}" class="campus-card">
      <span class="campus-section">${escapeHtml(article.category)}</span>
      <h2><a href="./article.html?id=${encodeURIComponent(article.id)}">${escapeHtml(article.headline)}</a></h2>
      <p class="campus-deck">${escapeHtml(article.deck)}</p>
      <div class="campus-meta">${escapeHtml(article.byline)}　•　${escapeHtml(article.date)}</div>
      <p>${escapeHtml(article.body[0])}</p>
      <a class="read-story" href="./article.html?id=${encodeURIComponent(article.id)}">Read full archive record</a>
    </article>
  `).join("");
})();

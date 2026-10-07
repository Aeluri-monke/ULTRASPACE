(() => {
  const characters = window.ULTRASPACE_DATA.characters;
  const container = document.querySelector("#profile-directory");
  const search = document.querySelector("#directory-search");
  const onlineOnly = document.querySelector("#online-only");
  const count = document.querySelector("#directory-count");
  const empty = document.querySelector("#directory-empty");
  const query = new URLSearchParams(window.location.search).get("q") || "";
  search.value = query;

  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");

  function render() {
    const term = search.value.trim().toLowerCase();
    const filtered = characters.filter((character) => {
      const matches = !term || `${character.name} ${character.username}`.toLowerCase().includes(term);
      return matches && (!onlineOnly.checked || character.online);
    });
    count.textContent = `${filtered.length} profile${filtered.length === 1 ? "" : "s"} found`;
    empty.hidden = filtered.length !== 0;
    container.innerHTML = filtered.map((character) => `
      <article class="directory-card theme-card-${escapeHtml(character.theme)}">
        <div class="directory-title"><a href="./profile.html?id=${encodeURIComponent(character.id)}">${escapeHtml(character.username)}</a>${character.online ? '<span class="online-now">ONLINE NOW!</span>' : ""}</div>
        <a class="directory-photo" href="./profile.html?id=${encodeURIComponent(character.id)}">${escapeHtml(character.initials)}</a>
        <div class="directory-copy">
          <h2>${escapeHtml(character.name)}</h2>
          <p>“${escapeHtml(character.quote)}”</p>
          <small><b>Mood:</b> ${escapeHtml(character.mood)}<br><b>Last login:</b> ${escapeHtml(character.lastLogin)}</small>
          <a class="directory-button" href="./profile.html?id=${encodeURIComponent(character.id)}">View Profile</a>
        </div>
      </article>
    `).join("");
  }

  search.addEventListener("input", render);
  onlineOnly.addEventListener("change", render);
  render();
})();

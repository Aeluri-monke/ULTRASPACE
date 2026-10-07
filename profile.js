(() => {
  const data = window.ULTRASPACE_DATA;
  const byId = new Map(data.characters.map((character) => [character.id, character]));
  const params = new URLSearchParams(window.location.search);
  const character = byId.get(params.get("id")) || null;
  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  document.querySelector("#profile-loading").hidden = true;

  if (!character) {
    document.querySelector("#profile-error").hidden = false;
    return;
  }

  const firstName = character.name.split(" ")[0];
  const fullNameFields = document.querySelectorAll("[data-full-name]");
  const firstNameFields = document.querySelectorAll("[data-first-name]");
  fullNameFields.forEach((element) => { element.textContent = character.name; });
  firstNameFields.forEach((element) => { element.textContent = firstName; });

  // ?theme=name previews any theme on any profile, e.g. profile.html?id=jirou&theme=pixelpink
  const themeOverride = (params.get("theme") || "").replace(/[^a-z0-9-]/gi, "");
  document.body.classList.add(`theme-${themeOverride || character.theme}`);
  document.title = `UltraSpace.com — ${character.username}`;
  document.querySelector("#profile-content").hidden = false;
  document.querySelector("#profile-name").textContent = `${character.name} (${character.username})`;
  document.querySelector("#profile-quote").textContent = `“${character.quote}”`;
  document.querySelector("#profile-details").innerHTML = character.details.map(escapeHtml).join("<br>");
  document.querySelector("#profile-login").textContent = character.lastLogin;
  document.querySelector("#profile-mood").textContent = character.mood;
  document.querySelector("#profile-status").textContent = character.status;
  document.querySelector("#profile-song").textContent = character.song;
  document.querySelector("#profile-about").textContent = character.about;
  document.querySelector("#profile-meet").textContent = character.meet;
  document.querySelector("#profile-url").textContent = `ultraspace.com/${character.username}`;

  const photo = document.querySelector("#profile-photo");
  if (character.image) {
    photo.innerHTML = `<img src="${escapeHtml(character.image)}" alt="${escapeHtml(character.name)} profile picture">`;
  } else {
    photo.innerHTML = `<span>${escapeHtml(character.initials)}</span><small>PHOTO<br>COMING SOON</small>`;
  }

  document.querySelector("#profile-interests").innerHTML = Object.entries(character.interests).map(([label, value]) => `
    <tr><th scope="row">${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>
  `).join("");

  document.querySelector("#profile-blogs").innerHTML = character.blogs.map(([date, title, text]) => `
    <article class="blog-entry"><time>${escapeHtml(date)}</time><div><a href="#blogs">${escapeHtml(title)}</a><p>${escapeHtml(text)}</p></div></article>
  `).join("");

  const topFriends = character.top8.map((id) => byId.get(id)).filter(Boolean);
  document.querySelector("#friend-count").textContent = String(Math.max(topFriends.length, 8));
  document.querySelector("#friend-grid").innerHTML = topFriends.map((friend, index) => `
    <a class="friend-card" href="./profile.html?id=${encodeURIComponent(friend.id)}">
      <b>${index + 1}. ${escapeHtml(friend.username)}</b>
      <span class="friend-photo theme-chip-${escapeHtml(friend.theme)}">${escapeHtml(friend.initials)}</span>
      <small>${escapeHtml(friend.name)}</small>
    </a>
  `).join("");

  document.querySelector("#chart-link").href = `./relationships.html?focus=${encodeURIComponent(character.id)}`;

  // Top 8 History: each entry is { date, top8: [ids], note }. Newest first.
  if (Array.isArray(character.top8History) && character.top8History.length) {
    const history = character.top8History.slice().sort((x, y) => String(y.date).localeCompare(String(x.date)));
    const select = document.querySelector("#history-select");
    const renderSnapshot = (index) => {
      const entry = history[index];
      document.querySelector("#history-note").textContent = entry.note || "";
      document.querySelector("#history-grid").innerHTML = entry.top8.map((id) => byId.get(id)).filter(Boolean).map((friend, i) => `
        <a class="friend-card" href="./profile.html?id=${encodeURIComponent(friend.id)}">
          <b>${i + 1}. ${escapeHtml(friend.username)}</b>
          <span class="friend-photo theme-chip-${escapeHtml(friend.theme)}">${escapeHtml(friend.initials)}</span>
          <small>${escapeHtml(friend.name)}</small>
        </a>`).join("");
    };
    select.innerHTML = history.map((entry, index) => `<option value="${index}">${escapeHtml(entry.date)}${index === 0 ? " (current)" : ""}</option>`).join("");
    select.addEventListener("change", () => renderSnapshot(Number(select.value)));
    renderSnapshot(0);
    document.querySelector("#top8-history").hidden = false;
  }

  document.querySelector("#comment-count").textContent = String(character.comments.length);
  document.querySelector("#comment-count-2").textContent = String(character.comments.length);
  document.querySelector("#comment-list").innerHTML = character.comments.map(([fromId, text], index) => {
    const from = byId.get(fromId) || character;
    return `
      <article class="comment-item">
        <div class="comment-friend">
          <a href="./profile.html?id=${encodeURIComponent(from.id)}">${escapeHtml(from.username)}</a>
          <span class="comment-photo theme-chip-${escapeHtml(from.theme)}">${escapeHtml(from.initials)}</span>
        </div>
        <div class="comment-copy"><time>09/${8 + index}/2006 11:${12 + index * 7} PM</time><p>${escapeHtml(text)}</p></div>
      </article>
    `;
  }).join("");

  document.querySelector("#song-button").addEventListener("click", (event) => {
    const paused = event.currentTarget.textContent === "▶";
    event.currentTarget.textContent = paused ? "❚❚" : "▶";
    event.currentTarget.setAttribute("aria-label", paused ? "Pause decorative profile player" : "Play decorative profile player");
  });

  document.querySelectorAll(".contact-table button, .add-comment").forEach((button) => {
    button.addEventListener("click", () => {
      button.textContent = "ARCHIVED — VIEW ONLY";
      button.disabled = true;
    });
  });
})();

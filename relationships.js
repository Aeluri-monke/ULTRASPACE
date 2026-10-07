(() => {
  const { characters, relationships, circles = [] } = window.ULTRASPACE_DATA;
  const byId = new Map(characters.map((character) => [character.id, character]));
  const nodes = document.querySelector("#relationship-nodes");
  const board = document.querySelector("#relationship-board");
  const lines = document.querySelector("#relationship-lines");
  const ledger = document.querySelector("#relationship-ledger");
  const circleLedger = document.querySelector("#circle-ledger");
  const focusSelect = document.querySelector("#focus-select");
  let layer = "reality";
  let filter = "all";
  let focus = new URLSearchParams(window.location.search).get("focus") || "";
  if (!byId.has(focus)) focus = "";

  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");

  function symbol(relationship) {
    if (relationship.direction === "a-to-b") return "→";
    if (relationship.direction === "b-to-a") return "←";
    return "↔";
  }

  // A relationship is visible when it matches the connection filter and, in focus mode, involves the focused character.
  function visibleRelationships() {
    return relationships.filter((relationship) =>
      (filter === "all" || relationship.type === filter) &&
      (!focus || relationship.a === focus || relationship.b === focus));
  }

  focusSelect.innerHTML = '<option value="">Everyone</option>' + characters
    .slice().sort((x, y) => x.name.localeCompare(y.name))
    .map((character) => `<option value="${escapeHtml(character.id)}">${escapeHtml(character.name)} (${escapeHtml(character.username)})</option>`).join("");
  focusSelect.value = focus;

  nodes.innerHTML = characters.map((character) => `
    <a id="relation-node-${character.id}" class="relation-node theme-card-${escapeHtml(character.theme)}" href="./profile.html?id=${encodeURIComponent(character.id)}">
      <span class="relation-photo">${escapeHtml(character.initials)}</span>
      <b>${escapeHtml(character.username)}</b>
      <small>${escapeHtml(character.name)}</small>
    </a>
  `).join("");

  function applyDimming() {
    const active = filter !== "all" || focus;
    const connected = new Set(visibleRelationships().flatMap((relationship) => [relationship.a, relationship.b]));
    if (focus) connected.add(focus);
    document.querySelectorAll(".relation-node").forEach((node) => {
      const id = node.id.replace("relation-node-", "");
      node.classList.toggle("dimmed", active && !connected.has(id));
      node.classList.toggle("focused", Boolean(focus) && id === focus);
    });
  }

  function drawLines() {
    const boardRect = board.getBoundingClientRect();
    lines.setAttribute("viewBox", `0 0 ${boardRect.width} ${boardRect.height}`);
    const palette = { romance: "#ee2b88", platonic: "#3677d0", former: "#8251ae", friction: "#d07a16" };
    const defs = `<defs>${Object.entries(palette).map(([type, color]) => `<marker id="arrow-${type}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 10 5 0 10Z" fill="${color}"></path></marker>`).join("")}</defs>`;
    const paths = visibleRelationships().map((relationship, index) => {
      const a = document.querySelector(`#relation-node-${relationship.a}`).getBoundingClientRect();
      const b = document.querySelector(`#relation-node-${relationship.b}`).getBoundingClientRect();
      const x1 = a.left + a.width / 2 - boardRect.left;
      const y1 = a.top + a.height / 2 - boardRect.top;
      const x2 = b.left + b.width / 2 - boardRect.left;
      const y2 = b.top + b.height / 2 - boardRect.top;
      const bend = index % 2 ? 22 : -22;
      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2 + bend;
      const markers = relationship.direction === "mutual" ? `marker-start="url(#arrow-${relationship.type})" marker-end="url(#arrow-${relationship.type})"` : relationship.direction === "b-to-a" ? `marker-start="url(#arrow-${relationship.type})"` : `marker-end="url(#arrow-${relationship.type})"`;
      return `<path class="relationship-line ${relationship.type} ${layer === "rumor" ? "rumor" : ""}" d="M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}" ${markers}></path>`;
    }).join("");
    lines.innerHTML = defs + paths;
  }

  function timelineHtml(relationship) {
    if (!relationship.timeline || !relationship.timeline.length) return "";
    return `<details class="relation-timeline"><summary>Timeline (${relationship.timeline.length} stages)</summary><ol>${relationship.timeline.map((step) => `<li><b>${escapeHtml(step.stage)}</b> ${escapeHtml(step.text)}</li>`).join("")}</ol></details>`;
  }

  function renderLedger() {
    const heading = layer === "reality" ? "Objective truth" : "Socially available truth";
    const focusName = focus ? ` — ${escapeHtml(byId.get(focus).name)}` : "";
    const items = visibleRelationships().map((relationship) => {
      const a = byId.get(relationship.a);
      const b = byId.get(relationship.b);
      return `
        <article class="relation-record ${relationship.type}">
          <div class="record-pair">
            <a href="./profile.html?id=${encodeURIComponent(a.id)}">${escapeHtml(a.name)}</a>
            <b>${symbol(relationship)}</b>
            <a href="./profile.html?id=${encodeURIComponent(b.id)}">${escapeHtml(b.name)}</a>
            ${relationship.secret && layer === "reality" ? '<span title="Secret relationship">🔒</span>' : ""}
          </div>
          <span class="record-type">${escapeHtml(relationship.kind || relationship.type)}</span>
          <div><strong>${escapeHtml(relationship[layer])}</strong><p>${escapeHtml(relationship.note)}</p>${layer === "reality" ? timelineHtml(relationship) : ""}</div>
        </article>
      `;
    }).join("");
    ledger.innerHTML = `<h2>${heading}${focusName}</h2>` + (items || '<p class="ledger-empty">No relationships on file for this filter.</p>');
    requestAnimationFrame(drawLines);
  }

  function renderCircles() {
    const shown = circles.filter((circle) => !focus || circle.members.includes(focus) || (circle.floaters || []).includes(focus));
    circleLedger.innerHTML = "<h2>Social circles</h2>" + (shown.map((circle) => `
      <article class="circle-record">
        <div><b>${escapeHtml(circle.name)}</b><span class="record-type">${escapeHtml(circle.kind)}</span></div>
        <div class="circle-members">${circle.members.map((id) => byId.get(id)).filter(Boolean).map((m) => `<a href="./profile.html?id=${encodeURIComponent(m.id)}">${escapeHtml(m.username)}</a>`).join(" ")}${(circle.floaters || []).map((id) => byId.get(id)).filter(Boolean).map((m) => ` <span class="floater">(<a href="./profile.html?id=${encodeURIComponent(m.id)}">${escapeHtml(m.username)}</a>)</span>`).join("")}</div>
        <p>${escapeHtml(circle.note)}</p>
      </article>`).join("") || '<p class="ledger-empty">No social circles on file.</p>');
  }

  function refresh() {
    applyDimming();
    renderLedger();
    renderCircles();
  }

  function setFocus(id) {
    focus = byId.has(id) ? id : "";
    focusSelect.value = focus;
    const url = new URL(window.location.href);
    if (focus) url.searchParams.set("focus", focus); else url.searchParams.delete("focus");
    try { window.history.replaceState(null, "", url); } catch (error) { /* file:// can refuse this; ignore */ }
    refresh();
  }

  document.querySelectorAll(".layer-choice").forEach((button) => {
    button.addEventListener("click", () => {
      layer = button.dataset.layer;
      document.querySelectorAll(".layer-choice").forEach((item) => item.classList.toggle("active", item === button));
      renderLedger();
    });
  });

  document.querySelectorAll(".filter-choice").forEach((button) => {
    button.addEventListener("click", () => {
      filter = button.dataset.filter;
      document.querySelectorAll(".filter-choice").forEach((item) => item.classList.toggle("active", item === button));
      refresh();
    });
  });

  focusSelect.addEventListener("change", () => setFocus(focusSelect.value));
  document.querySelector("#focus-clear").addEventListener("click", () => setFocus(""));

  new ResizeObserver(() => requestAnimationFrame(drawLines)).observe(board);
  refresh();
})();

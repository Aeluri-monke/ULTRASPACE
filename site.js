(() => {
  const poll = document.querySelector("#home-poll");
  if (poll) {
    poll.addEventListener("submit", (event) => {
      event.preventDefault();
      const selected = new FormData(poll).get("poll");
      const output = document.querySelector("#poll-result");
      output.textContent = selected
        ? "vote counted by a deeply unbiased system ♡"
        : "pick somebody first!!!";
    });
  }

  const player = document.querySelector(".fake-player button");
  if (player) {
    player.addEventListener("click", () => {
      const playing = player.textContent === "❚❚";
      player.textContent = playing ? "▶" : "❚❚";
      player.setAttribute("aria-label", playing ? "Play decorative music sample" : "Pause decorative music sample");
    });
  }
})();

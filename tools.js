(function () {
  "use strict";

  const carousel = document.getElementById("tool-carousel");
  if (!carousel) return;

  const tabs = Array.from(carousel.querySelectorAll("[data-tool-index]"));
  const panels = Array.from(carousel.querySelectorAll("[data-tool-slide]"));
  const previous = document.getElementById("tool-prev");
  const next = document.getElementById("tool-next");
  const position = document.getElementById("tool-position");

  if (!tabs.length || tabs.length !== panels.length || !previous || !next || !position) return;

  let activeIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true"),
  );

  function select(index, moveFocus) {
    activeIndex = (index + tabs.length) % tabs.length;

    tabs.forEach((tab, tabIndex) => {
      const isActive = tabIndex === activeIndex;
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });

    panels.forEach((panel, panelIndex) => {
      const isActive = panelIndex === activeIndex;
      panel.hidden = !isActive;
      panel.tabIndex = isActive ? 0 : -1;
    });

    const label = tabs[activeIndex].textContent.trim();
    position.textContent = `Tool ${activeIndex + 1} of ${tabs.length}: ${label}`;

    if (moveFocus) tabs[activeIndex].focus();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => select(index, false));
    tab.addEventListener("keydown", (event) => {
      let destination = null;
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") destination = index - 1;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") destination = index + 1;
      if (event.key === "Home") destination = 0;
      if (event.key === "End") destination = tabs.length - 1;
      if (destination === null) return;

      event.preventDefault();
      select(destination, true);
    });
  });

  previous.addEventListener("click", () => select(activeIndex - 1, false));
  next.addEventListener("click", () => select(activeIndex + 1, false));
  select(activeIndex, false);
})();

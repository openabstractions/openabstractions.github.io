(() => {
  "use strict";
  document.querySelectorAll("[data-tabs]").forEach((group) => {
    const tabs = Array.from(group.querySelectorAll('[role="tab"]'));
    function activate(tab, moveFocus) {
      tabs.forEach((candidate) => {
        const selected = candidate === tab;
        const panel = document.getElementById(candidate.getAttribute("aria-controls"));
        candidate.setAttribute("aria-selected", String(selected));
        candidate.tabIndex = selected ? 0 : -1;
        if (panel) panel.hidden = !selected;
      });
      if (moveFocus) tab.focus();
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(tab, false));
      tab.addEventListener("keydown", (event) => {
        let destination = null;
        if (event.key === "ArrowRight") destination = tabs[(index + 1) % tabs.length];
        if (event.key === "ArrowLeft") destination = tabs[(index - 1 + tabs.length) % tabs.length];
        if (event.key === "Home") destination = tabs[0];
        if (event.key === "End") destination = tabs[tabs.length - 1];
        if (destination) {
          event.preventDefault();
          activate(destination, true);
        }
      });
    });
  });
})();

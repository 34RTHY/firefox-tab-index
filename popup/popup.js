const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
const modKey = isMac ? "⌘" : "Alt";

async function render() {
  const tabs = await browser.tabs.query({ currentWindow: true });
  tabs.sort((a, b) => a.index - b.index);
  const total = tabs.length;

  document.getElementById("tab-count").textContent =
    `${total} tab${total !== 1 ? "s" : ""} in this window`;

  const list = document.getElementById("tab-list");
  list.innerHTML = "";

  for (const tab of tabs) {
    const num = tab.index + 1;
    const isLast = tab.index === total - 1;

    const item = document.createElement("div");
    item.className = "tab-item" + (tab.active ? " active" : "");

    // Badge
    const badge = document.createElement("span");
    badge.className = "tab-num";
    badge.textContent = num;
    if (tab.active) badge.style.background = "#16a34a";
    else if (isLast && total > 9) badge.style.background = "#9333ea";
    else if (num <= 8) badge.style.background = "#2563eb";
    else badge.style.background = "#6b7280";

    // Favicon
    const fav = document.createElement("img");
    fav.className = "tab-favicon";
    fav.src = tab.favIconUrl || "about:blank";
    fav.onerror = () => { fav.style.display = "none"; };

    // Title
    const title = document.createElement("span");
    title.className = "tab-title";
    title.textContent = tab.title || "Untitled";

    // Shortcut hint
    const shortcut = document.createElement("span");
    shortcut.className = "tab-shortcut";
    if (num <= 8) {
      shortcut.textContent = `${modKey}+${num}`;
    } else if (isLast) {
      shortcut.textContent = `${modKey}+9`;
    }

    item.append(badge, fav, title, shortcut);

    // Click to switch
    item.addEventListener("click", () => {
      browser.tabs.update(tab.id, { active: true });
      window.close();
    });

    list.appendChild(item);
  }
}

render();

// Content script: renders a floating tab index badge on each page

function createBadge() {
  let badge = document.getElementById("tab-index-badge");
  if (!badge) {
    badge = document.createElement("div");
    badge.id = "tab-index-badge";
    document.documentElement.appendChild(badge);
  }
  return badge;
}

function updateBadge(data) {
  const badge = createBadge();
  const { index, shortcutKey } = data;

  badge.textContent = "";

  const numSpan = document.createElement("span");
  numSpan.textContent = index;
  badge.appendChild(numSpan);

  if (shortcutKey) {
    const hint = document.createElement("span");
    hint.className = "tab-index-hint";
    hint.textContent = shortcutKey;
    badge.appendChild(hint);
  }

  badge.className = "";
  if (data.type === "last") badge.className = "last";
  else if (data.type === "beyond") badge.className = "beyond";
  else badge.className = "shortcut";
}

// Listen for updates from background script
browser.runtime.onMessage.addListener((msg) => {
  if (msg.action === "updateIndex") {
    updateBadge(msg);
  }
});

// Request initial index
browser.runtime.sendMessage({ action: "getIndex" });

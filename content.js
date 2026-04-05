// Content script: prepends tab index to the page title

let originalTitle = document.title;
let currentPrefix = "";

// Watch for title changes from the page itself (e.g. notifications, SPAs)
const observer = new MutationObserver(() => {
  const raw = document.title;
  // Strip our prefix if present before saving
  if (currentPrefix && raw.startsWith(currentPrefix)) {
    originalTitle = raw.slice(currentPrefix.length);
  } else {
    originalTitle = raw;
  }
  // Re-apply prefix
  if (currentPrefix) {
    const target = currentPrefix + originalTitle;
    if (document.title !== target) {
      document.title = target;
    }
  }
});

const titleEl = document.querySelector("title");
if (titleEl) {
  observer.observe(titleEl, { childList: true, characterData: true, subtree: true });
}

function applyPrefix(index) {
  const newPrefix = `${index} | `;
  if (newPrefix === currentPrefix) return;
  currentPrefix = newPrefix;
  document.title = currentPrefix + originalTitle;
}

// Listen for updates from background script
browser.runtime.onMessage.addListener((msg) => {
  if (msg.action === "updateIndex") {
    applyPrefix(msg.index);
  }
});

// Request initial index
browser.runtime.sendMessage({ action: "getIndex" });

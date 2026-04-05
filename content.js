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

// Filled circled numbers ❶-❿ (tabs with shortcuts)
const FILLED = [
  "", "\u2776", "\u2777", "\u2778", "\u2779", "\u277A",
  "\u277B", "\u277C", "\u277D", "\u277E", "\u277F"
];

// Outlined circled numbers ①-⑳ (all tabs)
const OUTLINE = [
  "", "\u2460", "\u2461", "\u2462", "\u2463", "\u2464",
  "\u2465", "\u2466", "\u2467", "\u2468", "\u2469",
  "\u246A", "\u246B", "\u246C", "\u246D", "\u246E",
  "\u246F", "\u2470", "\u2471", "\u2472", "\u2473"
];

// Negative circled ⓫-⓴ (11-20 filled, for last-tab shortcut)
const FILLED_11 = [
  "", "\u24EB", "\u24EC", "\u24ED", "\u24EE", "\u24EF",
  "\u24F0", "\u24F1", "\u24F2", "\u24F3", "\u24F4"
];

function getSymbol(index, isLast) {
  // Last tab gets filled style (it has Cmd/Alt+9)
  if (isLast && index > 8) {
    if (index <= 10) return FILLED[index];
    if (index <= 20) return FILLED_11[index - 10];
    return `\u25C6${index}`; // ◆N
  }
  // Tabs 1-8 get filled circles (have shortcuts)
  if (index <= 8) return FILLED[index];
  // Beyond 8: outline circles
  if (index <= 20) return OUTLINE[index];
  // 20+: diamond prefix
  return `\u25C7${index}`; // ◇N
}

function applyPrefix(index, isLast) {
  const symbol = getSymbol(index, isLast);
  const newPrefix = `${symbol} `;
  if (newPrefix === currentPrefix) return;
  currentPrefix = newPrefix;
  document.title = currentPrefix + originalTitle;
}

// Listen for updates from background script
browser.runtime.onMessage.addListener((msg) => {
  if (msg.action === "updateIndex") {
    applyPrefix(msg.index, msg.isLast);
  }
});

// Request initial index
browser.runtime.sendMessage({ action: "getIndex" });

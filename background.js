// Colors for badge
const SHORTCUT_COLOR = "#2563eb"; // blue — reachable via Cmd/Alt+1-8
const BEYOND_COLOR = "#6b7280";   // gray — no shortcut
const ACTIVE_COLOR = "#16a34a";   // green — currently active tab
const LAST_COLOR = "#9333ea";     // purple — Cmd/Alt+9 (last tab)

function getColor(index, isActive, isLast, totalTabs) {
  if (isActive) return ACTIVE_COLOR;
  if (isLast && totalTabs > 9) return LAST_COLOR;
  if (index <= 8) return SHORTCUT_COLOR;
  return BEYOND_COLOR;
}

async function updateAllBadges() {
  const tabs = await browser.tabs.query({});

  // Group tabs by window
  const windows = {};
  for (const tab of tabs) {
    if (!windows[tab.windowId]) windows[tab.windowId] = [];
    windows[tab.windowId].push(tab);
  }

  for (const windowId in windows) {
    const windowTabs = windows[windowId].sort((a, b) => a.index - b.index);
    const total = windowTabs.length;

    for (const tab of windowTabs) {
      const num = tab.index + 1; // 1-based display
      const isLast = tab.index === total - 1;
      const label = num <= 99 ? String(num) : "99+";
      const color = getColor(num, tab.active, isLast, total);

      browser.browserAction.setBadgeText({ text: label, tabId: tab.id });
      browser.browserAction.setBadgeBackgroundColor({ color, tabId: tab.id });
      browser.browserAction.setBadgeTextColor({ color: "#ffffff", tabId: tab.id });
    }
  }
}

// Update on every tab event
browser.tabs.onCreated.addListener(updateAllBadges);
browser.tabs.onRemoved.addListener(updateAllBadges);
browser.tabs.onMoved.addListener(updateAllBadges);
browser.tabs.onActivated.addListener(updateAllBadges);
browser.tabs.onDetached.addListener(updateAllBadges);
browser.tabs.onAttached.addListener(updateAllBadges);

// Initial paint
updateAllBadges();

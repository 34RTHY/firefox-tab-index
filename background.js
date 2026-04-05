const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
const modKey = isMac ? "⌘" : "Alt";

function getTabData(tab, total) {
  const num = tab.index + 1;
  const isLast = tab.index === total - 1;

  let type = "shortcut";
  let shortcutKey = "";

  if (num <= 8) {
    type = "shortcut";
    shortcutKey = `${modKey}+${num}`;
  } else if (isLast) {
    type = "last";
    shortcutKey = `${modKey}+9`;
  } else {
    type = "beyond";
    shortcutKey = "";
  }

  return { action: "updateIndex", index: num, type, shortcutKey, isLast };
}

async function updateAllTabs() {
  const tabs = await browser.tabs.query({});

  const windows = {};
  for (const tab of tabs) {
    if (!windows[tab.windowId]) windows[tab.windowId] = [];
    windows[tab.windowId].push(tab);
  }

  for (const windowId in windows) {
    const windowTabs = windows[windowId].sort((a, b) => a.index - b.index);
    const total = windowTabs.length;

    for (const tab of windowTabs) {
      const data = getTabData(tab, total);

      // Update toolbar badge
      const label = data.index <= 99 ? String(data.index) : "99+";
      const color = data.type === "last" ? "#9333ea"
                  : data.type === "beyond" ? "#6b7280"
                  : "#2563eb";

      browser.browserAction.setBadgeText({ text: label, tabId: tab.id });
      browser.browserAction.setBadgeBackgroundColor({ color, tabId: tab.id });
      browser.browserAction.setBadgeTextColor({ color: "#ffffff", tabId: tab.id });

      // Send to content script
      browser.tabs.sendMessage(tab.id, data).catch(() => {
        // Content script not loaded yet on this tab — ignore
      });
    }
  }
}

// Listen for content scripts requesting their index
browser.runtime.onMessage.addListener((msg, sender) => {
  if (msg.action === "getIndex" && sender.tab) {
    browser.tabs.query({ windowId: sender.tab.windowId }).then((tabs) => {
      const total = tabs.length;
      const data = getTabData(sender.tab, total);
      browser.tabs.sendMessage(sender.tab.id, data).catch(() => {});
    });
  }
});

// Update on every tab event
browser.tabs.onCreated.addListener(updateAllTabs);
browser.tabs.onRemoved.addListener(updateAllTabs);
browser.tabs.onMoved.addListener(updateAllTabs);
browser.tabs.onActivated.addListener(updateAllTabs);
browser.tabs.onDetached.addListener(updateAllTabs);
browser.tabs.onAttached.addListener(updateAllTabs);

// Initial paint
updateAllTabs();

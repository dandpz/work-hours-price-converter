import { log } from "../logger";
import { DEFAULT_USER_SETTINGS } from "../settings";
import type { UserSettings } from "../types";

type Message =
  | { type: "GET_USER_SETTINGS" }
  | { type: "SAVE_USER_SETTINGS"; settings: UserSettings };

type Response<T> = (response: T) => void;

chrome.runtime.onInstalled.addListener(() => {
  log("info", "Work Hours Price Converter installed!");
});

// Listen for URL changes on Amazon pages, because Amazon uses the History API (pushState) for pagination.
chrome.webNavigation.onHistoryStateUpdated.addListener(
  (details) => {
    chrome.tabs
      .sendMessage(details.tabId, {
        message: "CHANGED_URL",
        url: details.url,
      })
      .catch(() => {
        // No content script in this tab — safe to ignore
      });
  },
  { url: [{ hostContains: "amazon." }] },
);

chrome.runtime.onMessage.addListener(
  (
    message: Message,
    _sender,
    sendResponse: Response<UserSettings | object>,
  ) => {
    switch (message.type) {
      case "GET_USER_SETTINGS":
        chrome.storage.local.get(["userSettings"], (result) => {
          const settings: UserSettings = result.userSettings || {
            ...DEFAULT_USER_SETTINGS,
          };
          sendResponse(settings);
        });
        return true;

      case "SAVE_USER_SETTINGS":
        chrome.storage.local.set({ userSettings: message.settings }, () => {
          sendResponse({ success: true });
        });
        return true;

      default:
        return false;
    }
  },
);

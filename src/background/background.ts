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

chrome.runtime.onMessage.addListener(
  (message: Message, _sender, sendResponse: Response<UserSettings | object>) => {
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

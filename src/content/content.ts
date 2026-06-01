import { log } from "../logger";
import { PriceConverter } from "./priceConverter";

// Initialize the price converter when the page loads
let priceConverter: PriceConverter | null = null;

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  log("info", "Content script received message:", message);

  if (message.type === "UPDATE_SETTINGS") {
    if (priceConverter) {
      if (message.enabled === false) {
        priceConverter.setEnabled(false);
      } else {
        priceConverter.updateSettings(message);
      }
    }
    sendResponse({ success: true });
  } else if (message.message === "CHANGED_URL") {
    if (priceConverter) {
      setTimeout(() => {
        priceConverter?.refresh();
      }, 1500);
    }
    sendResponse({ success: true });
  }
});

// Listen for storage changes (e.g., settings updated in another tab)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.userSettings?.newValue) {
    console.log(
      "debug",
      "Settings changed in storage:",
      changes.userSettings.newValue,
    );
    priceConverter?.updateSettings(changes.userSettings.newValue);
    priceConverter?.refresh();
  }
});

// Initialize on DOMContentLoaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    priceConverter?.refresh();
  });
} else {
  priceConverter = new PriceConverter();
}

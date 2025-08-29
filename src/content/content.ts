import { log } from "../logger";
import { PriceConverter } from "./priceConverter";

// Initialize the price converter when the page loads
let priceConverter: PriceConverter | null = null;

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  log("info", "Content script received message:", message);

  if (message.type === "UPDATE_SETTINGS") {
    log("info", "Updating settings in content script:", message);

    // Update settings
    if (priceConverter) {
      // Handle enabled/disabled state
      if (message.enabled === false) {
        log("info", "Disabling extension");
        priceConverter.setEnabled(false);
      } else {
        log("info", "Updating settings and refreshing");
        priceConverter.updateSettings(message);
      }
    } else {
      log("info", "PriceConverter not initialized yet");
    }

    // Send response back to popup
    sendResponse({ success: true });
  }
});

// Listen for URL changes from the background script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.message === "CHANGED_URL") {
    log("info", "URL changed to:", message.url);
    if (priceConverter) {
      setTimeout(() => {
        priceConverter?.refresh();
      }, 1500); // Delay to allow page content to load
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

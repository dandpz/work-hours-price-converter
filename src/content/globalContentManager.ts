import { log } from "../logger";

import { AmazonContentManager } from "./amazonContentManager";
import type { ContentManager } from "./contentManager";
import { PriceConverter } from "./priceConverter";

export class GlobalContentManager implements ContentManager {
  public priceConverter: PriceConverter | undefined;
  private hostSpecificContentManager: ContentManager | null = null;
  private initialized = false;

  init() {
    // this is to avoid a cast to any
    const w = window as typeof window & {
      __workHoursPriceConverterInit?: boolean;
    };

    // Prevent multiple initializations in the same window
    if (w.__workHoursPriceConverterInit) {
      log("debug", "GlobalContentManager already initialized for this window");
      return;
    }
    w.__workHoursPriceConverterInit = true;

    log("info", "Initializing GlobalContentManager");
    this.doSpecificForHost(window.location.hostname);
    this.registerListeners();
  }

  doSpecificForHost(host: string) {
    if (host.includes("amazon")) {
      log("info", "Host specific manager: Amazon");
      this.hostSpecificContentManager = new AmazonContentManager();

      if (!document.body) {
        requestAnimationFrame(
          this.hostSpecificContentManager.registerListeners,
        );
      } else {
        this.hostSpecificContentManager.registerListeners();
      }
    }
  }

  registerListeners() {
    // Listen for messages from the popup
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      log("info", "Content script received message:", message);

      if (message.type === "UPDATE_SETTINGS") {
        if (this.priceConverter) {
          if (message.enabled === false) {
            this.priceConverter.setEnabled(false);
          } else {
            this.priceConverter.updateSettings(message);
          }
        }
        sendResponse({ success: true });
      }
    });

    // Listen for URL changes from the background script
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.message === "CHANGED_URL") {
        log("info", "URL changed, refreshing prices");
        if (this.priceConverter) {
          setTimeout(() => {
            this.priceConverter?.refresh();
          }, 1500);
        }
        sendResponse({ success: true });
      }
    });

    // Listen for storage changes
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && changes.userSettings?.newValue) {
        this.priceConverter?.updateSettings(changes.userSettings.newValue);
      }
    });

    // NOTE: This was a first attempt at solving the amazon issue:
    // https://github.com/dandpz/work-hours-price-converter/issues/16
    // an observer strategy is now being used instead of a scroll based one.
    // This might still be useful for infinite scrolling websites tho so it
    // could still be worth keeping.
    document.addEventListener("scrollend", () => {
      this.priceConverter?.refresh();
    });

    const setupConverter = () => {
      if (this.initialized) return;
      this.initialized = true;

      log("info", "Setting up PriceConverter");
      this.priceConverter = new PriceConverter();
      if (this.hostSpecificContentManager) {
        this.hostSpecificContentManager.priceConverter = this.priceConverter;
      }
    };

    // Initialize on DOMContentLoaded or immediately if already loaded
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", setupConverter);
    } else {
      setupConverter();
    }
  }
}

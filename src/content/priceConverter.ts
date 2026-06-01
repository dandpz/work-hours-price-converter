import { log } from "../logger";
import { getParser } from "../parsers/ParserFactory";
import { DEFAULT_USER_SETTINGS } from "../settings";
import type { UserSettings } from "../types";
import { injectWorkHours, removeWorkHoursElements } from "./domInjector";
import { calculateWorkHours } from "./workHoursCalculator";

export class PriceConverter {
  private parser = getParser(window.location.hostname);
  private settings: UserSettings | null = null;

  constructor() {
    if (!this.parser) {
      log(
        "info",
        "No parser available for this website:",
        window.location.hostname,
      );
      return;
    }
    this.loadSettings();
  }

  private loadSettings(): void {
    chrome.runtime.sendMessage({ type: "GET_USER_SETTINGS" }, (response) => {
      if (response) {
        this.settings = response;
        this.processPrices();
      } else {
        log("error", "No settings received from background script");
      }
    });
  }

  private processPrices(): void {
    if (!this.settings || !this.settings.enabled || !this.parser) return;

    const parser = this.parser;
    const settings = this.settings;

    parser.getPriceElements().forEach((element) => {
      const price = parser.extractPrice(element);
      if (!price || price <= 0) return;
      const result = calculateWorkHours(price, settings);
      if (result) injectWorkHours(element, result);
    });

    log("info", "Price processing completed");
  }

  public refresh(): void {
    if (!this.parser) return;
    this.parser.clearProcessedElements();
    removeWorkHoursElements();
    this.processPrices();
  }

  public setEnabled(enabled: boolean): void {
    if (!enabled) {
      removeWorkHoursElements();
      document.querySelector(".currency-warning")?.remove();
    } else {
      this.refresh();
    }
  }

  public updateSettings(newSettings: UserSettings): void {
    this.settings = { ...DEFAULT_USER_SETTINGS, ...newSettings };
    this.refresh();
  }
}

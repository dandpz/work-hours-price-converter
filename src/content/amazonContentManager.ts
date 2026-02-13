import { log } from "../logger";

import type { ContentManager } from "./contentManager";
import type { PriceConverter } from "./priceConverter";

export class AmazonContentManager implements ContentManager {
  priceConverter: PriceConverter | undefined;

  registerListeners(): void {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        const iterable = Array.from(mutation.addedNodes);
        for (const node of iterable) {
          if (!(node instanceof Element)) continue;

          // Check if this node or any of its children match the carousel
          // heading
          if (
            node.matches(".p13n-sc-uncoverable-faceout") ||
            node.querySelector(".p13n-sc-uncoverable-faceout")
          ) {
            this.priceConverter?.refresh();
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    log("info", "Amazon MutationObserver started");
  }
}

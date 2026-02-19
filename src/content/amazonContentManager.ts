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
          const className = "p13n-sc-uncoverable-faceout";

          if (
            node.matches(`.${className}`) ||
            node.querySelector(`.${className}`)
          ) {
            this.priceConverter?.refresh();
          }
        }
      }
    });

    const elementToObserve = document.getElementById("a-page");
    if (elementToObserve) {
      // We want to observe only a sub-tree of the page not to be too
      // expensive on the processor
      observer.observe(elementToObserve, { childList: true, subtree: true });
    }
  }
}

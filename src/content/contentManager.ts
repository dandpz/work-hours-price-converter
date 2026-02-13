import type { PriceConverter } from "./priceConverter";

export interface ContentManager {
  priceConverter: PriceConverter | undefined;
  registerListeners(): void;
}

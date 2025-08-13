
export interface IPriceParser {
    /**
     * Retrieves the price elements from the current page.
     * @returns A list of HTML elements containing the price.
     */
    getPriceElements(): HTMLElement[];

    /**
     * Extracts the price from a given HTML element.
     * @param element - The HTML element containing the price.
     * @returns The extracted price as a number, or null if extraction fails.
     */
    extractPrice(element: HTMLElement): number | null;

    /**
     * Clears the processed elements cache.
     * Call this when the page content changes significantly.
     */
    clearProcessedElements(): void;
}

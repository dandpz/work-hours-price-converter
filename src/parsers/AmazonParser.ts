import { IPriceParser } from "./IPriceParser";

export class AmazonParser implements IPriceParser {
    private processedElements: WeakSet<HTMLElement> = new WeakSet();

    getPriceElements(): HTMLElement[] {
        const selectors = [
            // Product listing pages - target only the main visible price elements
            '[data-component-type="s-search-result"] .a-price .a-price-whole:not([aria-hidden="true"]):not(.a-offscreen)',
            '[data-component-type="s-search-result"] .a-price .a-offscreen:not([aria-hidden="true"]):not(.a-price-whole)',

            // Product detail pages - target only the main visible price elements
            '.a-price .a-offscreen:not([aria-hidden="true"]):not(.a-price-whole)',
            '.a-price .a-price-whole:not([aria-hidden="true"]):not(.a-offscreen)',

            // Deal pages - target only the main visible price elements
            '.a-price-deal .a-offscreen:not([aria-hidden="true"]):not(.a-price-whole)',
            '.a-price-deal .a-price-whole:not([aria-hidden="true"]):not(.a-offscreen)',

            // Alternative price selectors - target only the main visible price elements
            '.a-price[data-a-color="price"] .a-offscreen:not([aria-hidden="true"]):not(.a-price-whole)',
            '.a-price[data-a-color="secondary"] .a-offscreen:not([aria-hidden="true"]):not(.a-price-whole)',

            // Prime day and other special pricing - target only the main visible price elements
            '.a-price.a-text-price .a-offscreen:not([aria-hidden="true"]):not(.a-price-whole)',
            '.a-price.a-text-price .a-price-whole:not([aria-hidden="true"]):not(.a-offscreen)'
        ];

        const elements: HTMLElement[] = [];
        const processedParents = new Set<HTMLElement>();

        for (const selector of selectors) {
            const found = document.querySelectorAll(selector);
            found.forEach((el) => {
                if (el instanceof HTMLElement && !this.isProcessedElement(el) && this.isVisibleElement(el)) {
                    // Check if we've already processed a price element from this parent
                    const parent = this.findBestParentElement(el);
                    if (parent && !processedParents.has(parent)) {
                        elements.push(el);
                        processedParents.add(parent);
                        // Mark this element as processed
                        this.processedElements.add(el);
                    }
                }
            });
        }

        return elements;
    }

    extractPrice(element: HTMLElement): number | null {
        // Extract the price text from the element
        const priceText = element.textContent?.trim();
        if (!priceText) return null;

        // Remove any non-numeric characters (except for decimal points)
        const numericPrice = priceText.replace(/[^0-9.,]/g, '').replace(',', '.');

        // Parse the numeric price
        const price = parseFloat(numericPrice);
        return isNaN(price) ? null : price;
    }

    clearProcessedElements(): void {
        this.processedElements = new WeakSet();
    }

    private isProcessedElement(element: HTMLElement): boolean {
        // Check if this element has already been processed
        if (this.processedElements.has(element)) {
            return true;
        }
        return false;
    }

    private findBestParentElement(priceElement: HTMLElement): HTMLElement | null {
        // Try to find a good parent that contains the price but isn't too large
        let current = priceElement.parentElement;

        while (current && current !== document.body) {
            // Check if this element is a good candidate
            const isGoodCandidate = this.isGoodParentCandidate(current);
            if (isGoodCandidate) {
                return current;
            }
            current = current.parentElement;
        }
        // Fallback to the price element's immediate parent
        return priceElement.parentElement;
    }

    private isGoodParentCandidate(element: HTMLElement): boolean {
        // Avoid very large containers
        if (element.children.length > 10) return false;

        // Avoid elements that are likely to be containers for multiple products
        const text = element.textContent || '';
        if (text.length > 200) return false;

        // Prefer elements that are likely to be price containers
        const className = element.className.toLowerCase();
        const goodClasses = ['price', 'cost', 'amount', 'value'];
        const hasGoodClass = goodClasses.some(cls => className.includes(cls));

        return hasGoodClass || element.children.length <= 3;
    }

    private isVisibleElement(element: HTMLElement): boolean {
        // Check if element is visible and not hidden
        const style = window.getComputedStyle(element);
        return style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            style.opacity !== '0' &&
            !element.hasAttribute('aria-hidden') &&
            element.offsetWidth > 0 &&
            element.offsetHeight > 0;
    }

}
import { IPriceParser } from './IPriceParser';
import { AmazonParser } from './AmazonParser';

export class ParserFactory {
    private static parsers: Map<string, IPriceParser> = new Map();

    /**
     * Gets the appropriate parser for the current website
     * @param hostname - The current website's hostname
     * @returns The appropriate price parser, or null if no parser is available
     */
    static getParser(hostname: string): IPriceParser | null {
        // Check if we already have a parser for this hostname
        if (this.parsers.has(hostname)) {
            return this.parsers.get(hostname)!;
        }

        // Create parser based on hostname
        let parser: IPriceParser | null = null;

        if (hostname.includes('amazon')) {
            parser = new AmazonParser();
        }
        // Add more parsers here as needed
        // else if (hostname.includes('ebay')) {
        //     parser = new EbayParser();
        // }

        // Cache the parser for future use
        if (parser) {
            this.parsers.set(hostname, parser);
        }

        return parser;
    }

    /**
     * Clears all cached parsers
     * Useful when switching between different websites
     */
    static clearParsers(): void {
        this.parsers.clear();
    }

    /**
     * Gets all supported hostnames
     * @returns Array of hostname patterns that have parsers
     */
    static getSupportedHostnames(): string[] {
        return ['amazon.com', 'amazon.co.uk', 'amazon.de', 'amazon.fr', 'amazon.it', 'amazon.es', 'amazon.ca', 'amazon.com.au', 'amazon.co.jp'];
    }
}

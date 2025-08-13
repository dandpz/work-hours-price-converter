import { ParserFactory } from '../parsers/ParserFactory';
import { IPriceParser } from '../parsers/IPriceParser';
import { DEFAULT_USER_SETTINGS } from '../settings';
import { calculateHourlyWage } from '../utils';

class PriceConverter {
    private parser: IPriceParser | null = null;
    private settings: any = null;
    private hourlyWage: number | null = null;

    constructor() {
        this.initialize();
    }

    private initialize(): void {
        // Get the appropriate parser for this website
        const hostname = window.location.hostname;
        this.parser = ParserFactory.getParser(hostname);

        if (!this.parser) {
            console.log('No parser available for this website:', hostname);
            return;
        }

        // Load settings and start processing
        this.loadSettings();
        
    }

    private loadSettings(): void {
        // Request settings from background script
        chrome.runtime.sendMessage({ type: 'GET_USER_SETTINGS' }, (response) => {
            if (response) {
                this.settings = response;
                this.processPrices();
            } else {
                console.error('No settings received from background script');
            }
        });
    }

    private processPrices(): void {
        console.log('Processing prices with settings:', this.settings);
        if (!this.parser || !this.settings || !this.settings.enabled) {
            return;
        }
        this.hourlyWage = calculateHourlyWage(this.settings)?.amount || 0.00;
        const priceElements = this.parser.getPriceElements();

        priceElements.forEach(element => {
            const price = this.parser!.extractPrice(element);
            if (price && price > 0) {
                this.convertPriceToWorkHours(element, price);
            }
        });
        console.log('Price processing completed');

    }

    private convertPriceToWorkHours(element: HTMLElement, price: number): void {
        
        if (!this.hourlyWage || this.hourlyWage <= 0) return;

        const workHours = price / this.hourlyWage;
        const formattedHours = this.formatWorkHours(workHours);

        // Create the work hours display with tooltip
        const workHoursContainer = document.createElement('span');
        workHoursContainer.className = 'work-hours';

        const workHoursText = document.createElement('span');
        workHoursText.textContent = formattedHours;
        workHoursContainer.appendChild(workHoursText);

        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'work-hours-tooltip';
        tooltip.textContent = `This item costs ${workHours.toFixed(1)} hours of your work time`;
        workHoursContainer.appendChild(tooltip);

        // Insert after the price element
        element.parentNode?.insertBefore(workHoursContainer, element.nextSibling);
    }

    private formatWorkHours(hours: number): string {
        if (hours < 1) {
            const minutes = Math.round(hours * 60);
            return `${minutes}m`;
        } else if (hours < this.settings.dailyHours) {
            return `${hours.toFixed(1)}h`;
        } else {
            const days = Math.floor(hours / 8);
            const remainingHours = hours % 8;
            if (remainingHours > 0) {
                return `${days}d ${remainingHours.toFixed(1)}h`;
            } else {
                return `${days}d`;
            }
        }
    }

    // Public method to refresh prices (can be called when settings change)
    public refresh(): void {
        if (this.parser) {
            this.parser.clearProcessedElements();

            // Remove existing work hours elements
            this.removeExistingWorkHours();

            // TODO: Handle currency conversion if needed
            // For now, we assume the prices are in the user's selected currency
            // Remove existing warnings
            // const existingWarning = document.querySelector('.currency-warning');
            // if (existingWarning) {
            //     existingWarning.remove();
            // }

            this.processPrices();
        }
    }

    private removeExistingWorkHours(): void {
        const existingElements = document.querySelectorAll('.work-hours');
        existingElements.forEach(element => element.remove());
    }

    // Public method to disable/enable the extension
    public setEnabled(enabled: boolean): void {
        if (!enabled) {
            this.removeExistingWorkHours();
            const existingWarning = document.querySelector('.currency-warning');
            if (existingWarning) {
                existingWarning.remove();
            }
        } else {
            this.refresh();
        }
    }

    // Public method to update settings
    public updateSettings(newSettings: any): void {
        this.settings = {
            ...DEFAULT_USER_SETTINGS,
            ...newSettings
        };
        this.refresh();
    }
}

// Initialize the price converter when the page loads
let priceConverter: PriceConverter | null = null;

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Content script received message:', message);
    
    if (message.type === 'UPDATE_SETTINGS') {
        console.log('Updating settings in content script:', message);
        
        // Update settings
        if (priceConverter) {
            // Handle enabled/disabled state
            if (message.enabled === false) {
                console.log('Disabling extension');
                priceConverter.setEnabled(false);
            } else {
                console.log('Updating settings and refreshing');
                priceConverter.updateSettings(message);
            }
        } else {
            console.log('PriceConverter not initialized yet');
        }
        
        // Send response back to popup
        sendResponse({ success: true });
    }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        priceConverter = new PriceConverter();
    });
} else {
    priceConverter = new PriceConverter();
}
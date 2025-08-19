<div align="center">
   <h1>Work Hours Price Converter</h1>
   <img src='./public/assets/icon128.png'>
</div>

---

Convert product prices on any e-commerce website into the number of work hours needed to afford them, based on your hourly wage.

This Chrome extension helps you shop smarter by showing the "real" cost of products in terms of your time, not just money.


## Features
- 🔄 Automatically converts product prices into work hours on supported websites.
- ⚙️ Configurable hourly wage (set your own rate in extension settings).
- 🌍 Works across multiple currencies.
- 🖥 Minimal and lightweight, runs in the background without slowing down browsing.
- 📈 Supports both monthly salary and hourly wage inputs


## Supported E-commerce Sites
- Amazon
- eBay (Coming soon)

---

## Installation

### From Chrome Web Store
🚀 Install it directly from the [Chrome Web Store](https://chromewebstore.google.com/detail/bnaieecnemgogcobmbnminmkbleoabfi).

### From Source

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the extension:
   ```bash
   npm run build
   ```
4. Load the extension in Chrome:
   - Open Chrome/Brave and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder from this project

### From ZIP
1. Download the latest release ZIP from the [Releases](https://github.com/dandpz/work-hours-price-converter/releases)
2. Extract the ZIP file
3. Load the extension in Chrome:
   - Open Chrome/Brave and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the extracted folder


## Usage

1. Click the extension icon in your Chrome toolbar
2. Configure your settings:
   - **Enable Extension**: Toggle the extension on/off (default: ON)
   - **Use Hourly Wage**: Switch between monthly salary and hourly wage input
   - **Monthly Salary**: Enter your monthly salary (assumes 160 working hours per month)
   - **Hourly Wage**: Enter your hourly wage directly
   - **Working Hours per Day**: Set how many hours you work each day (default: 8)
   - **Working Days per Week**: Set how many days you work each week (default: 5)
   - **Currency**: Select your preferred currency
3. Visit any supported website and the extension will automatically convert prices to work hours

## Contributing

Please read the [CONTRIBUTING.md](./CONTRIBUTING.md) file for details on how to contribute to this project.

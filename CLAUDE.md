# CLAUDE.md

Chrome extension (Manifest V3) — converts e-commerce prices to work hours based on user's hourly wage.

## Commands

```bash
npm install          # install deps + lefthook hooks
npm run build        # esbuild → dist/
npm run zip          # build + zip release artifact
npm test             # jest (pass with no tests)
npm run test:watch   # jest watch mode
npm run test:coverage
npm run biome:check  # lint + format check
npm run biome:check:apply  # auto-fix
```

Load extension: Chrome → `chrome://extensions/` → Developer mode → Load unpacked → `dist/`

## Architecture

```
src/
  manifest.json          # MV3 manifest
  types.ts               # UserSettings, PriceElement, CURRENCIES
  settings.ts            # defaults, storage keys, target website patterns
  utils.ts               # calculateHourlyWage, extractPriceFromText, isVisibleElement
  logger.ts              # log() wrapper
  background/
    background.ts        # service worker — storage CRUD, webNavigation listener
  content/
    content.ts           # entry point — creates PriceConverter, handles messages
    priceConverter.ts    # PriceConverter class — orchestrates parsing + DOM injection
    content.css          # .work-hours + .work-hours-tooltip styles
  parsers/
    IPriceParser.ts      # interface: getPriceElements(), extractPrice(), clearProcessedElements()
    ParserFactory.ts     # getParser(hostname) — cached, keyed by parser name substring
    AmazonParser.ts      # Amazon-specific selector logic
  popup/
    popup.html / popup.ts / popup.css
tests/
  utils/                 # jest unit tests for utils.ts helpers
```

**Messaging flow:**
1. Content script → `chrome.runtime.sendMessage({ type: "GET_USER_SETTINGS" })` → background returns settings from `chrome.storage.local`
2. Popup → `chrome.runtime.sendMessage({ type: "SAVE_USER_SETTINGS", settings })` → background writes to storage
3. Background → `chrome.tabs.sendMessage({ message: "CHANGED_URL" })` → content re-runs price conversion on Amazon SPA navigation

## Adding a New Parser

1. Create `src/parsers/FooParser.ts` implementing `IPriceParser`
2. Register in `ParserFactory.ts`: `parserMap.set("foo", FooParser)`
3. Add URL patterns to `DEFAULT_TARGET_WEBSITES` in `settings.ts`
4. Add patterns to `content_scripts[].matches` in `manifest.json`

## Key Conventions

- **Commits:** Conventional Commits enforced by commitlint + lefthook (`feat:`, `fix:`, `chore:`, etc.)
- **Lint/format:** Biome runs automatically on pre-commit via lefthook — no manual formatting needed
- **Build:** esbuild bundles each entry point (`background.ts`, `content.ts`, `popup.ts`) separately into `dist/`
- **Tests:** Jest + ts-jest, files in `tests/` mirroring `src/` structure
- **No currency conversion:** prices assumed to already be in user's selected currency

## Monthly → Hourly Wage Calculation

```
totalMonthlyHours = dailyHours × workingDaysPerWeek × 4
hourlyWage = monthlySalary / totalMonthlyHours
```

import { log } from "../logger";
import { DEFAULT_TARGET_WEBSITES, DEFAULT_USER_SETTINGS } from "../settings";
import type { UserSettings } from "../types";
import { CURRENCIES, type CurrencyCode } from "../types";
import { calculateHourlyWage } from "../utils";

const defaultSettings: UserSettings = {
  ...DEFAULT_USER_SETTINGS,
};

let settings: UserSettings = { ...defaultSettings };

function showStatus(message: string, type: "success" | "error" | "info") {
  const statusEl = document.querySelector("#statusOverlay") as HTMLDivElement;
  if (!statusEl) return;
  // Clear previous type classes
  statusEl.classList.remove("success", "error", "info");
  // Add show and the current type
  statusEl.classList.add("show", type);
  statusEl.textContent = message;
  if (type !== "info") {
    setTimeout(() => {
      statusEl.classList.remove("show", type);
      statusEl.textContent = "";
    }, 2000);
  }
}

function updateAllTabs() {
  const targetPatterns = DEFAULT_TARGET_WEBSITES;

  // Query tabs for each target pattern
  Promise.all(
    targetPatterns.map((pattern) => chrome.tabs.query({ url: pattern })),
  )
    .then((results) => {
      // Flatten and deduplicate tabs
      const allTabs = results.flat();
      const uniqueTabs = allTabs.filter(
        (tab, index, self) => index === self.findIndex((t) => t.id === tab.id),
      );

      uniqueTabs.forEach((tab) => {
        if (tab.id) {
          const message = {
            type: "UPDATE_SETTINGS",
            monthlySalary: settings.monthlySalary,
            hourlyWage: settings.hourlyWage,
            dailyHours: settings.dailyHours,
            workingDaysPerWeek: settings.workingDaysPerWeek,
            currency: settings.currency,
            inputType: settings.inputType,
            enabled: settings.enabled,
          };

          chrome.tabs.sendMessage(tab.id, message, (_response) => {
            if (chrome.runtime.lastError) {
              log(
                "error",
                `Error sending message to tab ${tab.id}:`,
                chrome.runtime.lastError,
              );
            } else {
              log("info", `Successfully sent message to tab ${tab.id}`);
            }
          });
        }
      });
    })
    .catch((error) => {
      log("error", "Error updating tabs:", error);
    });
}

function toggleExtension() {
  settings.enabled = !settings.enabled;
  const checkbox = document.getElementById(
    "extension-toggle",
  ) as HTMLInputElement;
  if (checkbox) checkbox.checked = settings.enabled;
  chrome.storage.local.set({ userSettings: settings });
  showStatus(
    settings.enabled ? "Extension enabled!" : "Extension disabled!",
    "success",
  );
  updateAllTabs();
}

function toggleInputMode() {
  settings.inputType = settings.inputType === "hourly" ? "monthly" : "hourly";
  chrome.storage.local.set({ userSettings: settings }, () => {
    updateAllTabs();
  });
  renderInputs();
}

function renderInputs() {
  const salaryGroup = document.getElementById(
    "monthly-salary-input",
  ) as HTMLDivElement;
  const hourlyGroup = document.getElementById(
    "hourly-salary-input",
  ) as HTMLDivElement;
  const hourlyDisplay = document.querySelector(
    ".hourly-wage-display",
  ) as HTMLDivElement;

  if (settings.inputType === "monthly") {
    if (salaryGroup) salaryGroup.style.display = "block";
    if (hourlyGroup) hourlyGroup.style.display = "none";
    if (hourlyDisplay) {
      const hasValidSalary =
        settings.monthlySalary !== undefined && settings.monthlySalary > 0;
      hourlyDisplay.style.display = hasValidSalary ? "block" : "none";
      if (hasValidSalary) {
        const wageValue = hourlyDisplay.querySelector(
          ".wage-value",
        ) as HTMLElement;
        const calculatedHourlyWage = calculateHourlyWage(settings);
        if (wageValue)
          wageValue.textContent =
            calculatedHourlyWage?.formatted || "0.00/hour";
        settings.hourlyWage = calculatedHourlyWage?.amount || 0.0;
      }
    }
  } else {
    if (salaryGroup) salaryGroup.style.display = "none";
    if (hourlyGroup) hourlyGroup.style.display = "block";
    if (hourlyDisplay) hourlyDisplay.style.display = "none";
  }
}

// --- Initialization ---
function initPopup() {
  try {
    chrome.storage.local.get(["userSettings"], (result) => {
      if (result.userSettings) {
        settings = { ...defaultSettings, ...result.userSettings };
      } else {
        // Set reasonable defaults for new users
        settings = {
          ...defaultSettings,
        };
      }

      // Initialize UI elements
      const extensionToggle = document.getElementById(
        "extension-toggle",
      ) as HTMLInputElement;
      const inputModeToggle = document.getElementById(
        "input-toggle",
      ) as HTMLInputElement;
      const monthlySalaryInput = document.getElementById(
        "monthly-salary",
      ) as HTMLInputElement;
      const hourlySalaryInput = document.getElementById(
        "hourly-salary",
      ) as HTMLInputElement;
      const workingHoursInput = document.getElementById(
        "working-hours",
      ) as HTMLInputElement;
      const workingDaysWeekInput = document.getElementById(
        "working-days-week",
      ) as HTMLInputElement;
      const currencySelect = document.getElementById(
        "currency-select",
      ) as HTMLSelectElement;

      // Remove existing event listeners by cloning elements
      if (extensionToggle) {
        const newExtensionToggle = extensionToggle.cloneNode(
          true,
        ) as HTMLInputElement;
        extensionToggle.parentNode?.replaceChild(
          newExtensionToggle,
          extensionToggle,
        );
        newExtensionToggle.checked = settings.enabled;
        newExtensionToggle.addEventListener("change", toggleExtension);
      }

      if (inputModeToggle) {
        const newInputModeToggle = inputModeToggle.cloneNode(
          true,
        ) as HTMLInputElement;
        inputModeToggle.parentNode?.replaceChild(
          newInputModeToggle,
          inputModeToggle,
        );
        newInputModeToggle.checked = settings.inputType === "hourly";
        newInputModeToggle.addEventListener("change", toggleInputMode);
      }

      if (monthlySalaryInput) {
        monthlySalaryInput.value = settings.monthlySalary?.toString() || "800";
        monthlySalaryInput.addEventListener("input", (e) => {
          settings.monthlySalary =
            parseFloat((e.target as HTMLInputElement).value) || 0;
          autoSave();
        });
      }

      if (hourlySalaryInput) {
        hourlySalaryInput.value = settings.hourlyWage?.toString() || "5";
        hourlySalaryInput.addEventListener("input", (e) => {
          settings.hourlyWage =
            parseFloat((e.target as HTMLInputElement).value) || 0;
          autoSave();
        });
      }

      // Initialize working hours fields
      if (workingHoursInput) {
        workingHoursInput.value = settings.dailyHours?.toString() || "8";
        workingHoursInput.addEventListener("input", (e) => {
          settings.dailyHours =
            parseFloat((e.target as HTMLInputElement).value) || 8;
          autoSave();
        });
      }

      if (workingDaysWeekInput) {
        workingDaysWeekInput.value =
          settings.workingDaysPerWeek?.toString() || "5";
        workingDaysWeekInput.addEventListener("input", (e) => {
          settings.workingDaysPerWeek =
            parseFloat((e.target as HTMLInputElement).value) || 5;
          autoSave();
        });
      }

      // Populate currency select dynamically
      populateCurrencySelect();

      // Set currency select value after populating options
      if (currencySelect) {
        currencySelect.value = settings.currency;
        currencySelect.addEventListener("change", (e) => {
          settings.currency = (e.target as HTMLSelectElement)
            .value as CurrencyCode;
          autoSave();
        });
      }

      renderInputs();

      // Initialize collapsible info panel
      //   initInfoPanel();
    });
  } catch (error) {
    log("error", "Error initializing popup:", error);
    showStatus("Error loading settings", "error");
  }
}

function autoSave() {
  renderInputs();
  // Auto-save after a short delay
  // biome-ignore lint/suspicious/noExplicitAny: <This is an accepted type here>
    clearTimeout((window as any).saveTimeout);
  // biome-ignore lint/suspicious/noExplicitAny: <This is an accepted type here>
  (window as any).saveTimeout = setTimeout(() => {
    chrome.storage.local.set({ userSettings: settings }, () => {
      showStatus("Settings saved!", "success");
      updateAllTabs();
    });
  }, 500);
}

// --- Currency Functions ---
function populateCurrencySelect() {
  const currencySelect = document.getElementById(
    "currency-select",
  ) as HTMLSelectElement;

  if (currencySelect) {
    // Clear existing options
    currencySelect.innerHTML = "";

    // Add options from CURRENCIES object
    Object.entries(CURRENCIES).forEach(([code, currency]) => {
      const option = document.createElement("option");
      option.value = code;
      option.textContent = `${code} - ${currency.name} (${currency.symbol})`;

      // Set EUR as default selected
      if (code === "EUR") {
        option.selected = true;
      }

      currencySelect.appendChild(option);
    });
  }
}

// --- Info Panel Functions ---
// Temporary disabled, as the info panel is not currently used in the popup
// function initInfoPanel() {
//   const infoToggle = document.getElementById(
//     "info-toggle",
//   ) as HTMLButtonElement;
//   const infoContent = document.getElementById("info-content") as HTMLDivElement;

//   if (infoToggle && infoContent) {
//     // Start collapsed by default
//     infoContent.classList.add("collapsed");
//     infoToggle.classList.add("collapsed");
//     updateInfoToggleText(infoToggle, false);

//     infoToggle.addEventListener("click", () => {
//       const isCollapsed = infoContent.classList.contains("collapsed");

//       if (isCollapsed) {
//         // Expand
//         infoContent.classList.remove("collapsed");
//         infoToggle.classList.remove("collapsed");
//         updateInfoToggleText(infoToggle, true);
//       } else {
//         // Collapse
//         infoContent.classList.add("collapsed");
//         infoToggle.classList.add("collapsed");
//         updateInfoToggleText(infoToggle, false);
//       }
//     });
//   }
// }

// function updateInfoToggleText(toggle: HTMLButtonElement, isExpanded: boolean) {
//   const textSpan = toggle.querySelector(".info-toggle-text") as HTMLElement;
//   if (textSpan) {
//     textSpan.textContent = isExpanded ? "ℹ️ Hide Info" : "ℹ️ Show Info";
//   }
// }

document.addEventListener("DOMContentLoaded", initPopup);

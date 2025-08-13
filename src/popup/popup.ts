import { UserSettings } from "../types";
import { CurrencyCode, CURRENCIES } from "../types";

const defaultSettings: UserSettings = {
  monthlySalary: 0,
  hourlyWage: 0,
  dailyHours: 8,
  workingDaysPerWeek: 5,
  currency: CURRENCIES.EUR.code,
  inputType: 'monthly',
  enabled: true
};

let settings: UserSettings = { ...defaultSettings };

// --- Helpers ---
function getCurrencySymbol(currencyCode: CurrencyCode): string {
  return CURRENCIES[currencyCode].symbol || '€';
}

function calculateHourlyWage(): string {
  if (settings.inputType === 'monthly') {
    const monthlySalary = settings.monthlySalary || 800;
    const dailyHours = settings.dailyHours || 8;
    const workingDaysPerWeek = settings.workingDaysPerWeek || 5;
    const totalMonthlyHours = dailyHours * workingDaysPerWeek * 4;
    const hourlyWage = monthlySalary / totalMonthlyHours;
    return `${getCurrencySymbol(settings.currency)}${hourlyWage.toFixed(2)}/hour`;
  }
  return '';
}

function showStatus(message: string, type: 'success' | 'error' | 'info') {
  const statusEl = document.querySelector('.status-message') as HTMLDivElement;
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.className = `status-message ${type}`;
  if (type !== 'info') {
    setTimeout(() => {
      statusEl.textContent = '';
      statusEl.className = 'status-message';
    }, 3000);
  }
}

function saveSettings() {
  const isHourly = settings.inputType === 'hourly';
  const value = isHourly ? settings.hourlyWage : settings.monthlySalary;

  if (value === undefined || value <= 0) {
    showStatus('Please enter a valid amount', 'error');
    return;
  }

  // Validate working hours fields
  if (settings.dailyHours && settings.dailyHours <= 0) {
    showStatus('Please enter valid working hours per day', 'error');
    return;
  }

  if (settings.workingDaysPerWeek && settings.workingDaysPerWeek <= 0) {
    showStatus('Please enter valid working days per week', 'error');
    return;
  }

  // Reset the other field
  if (isHourly) settings.monthlySalary = 0;
  else settings.hourlyWage = 0;

  chrome.storage.local.set({ userSettings: settings }, () => {
    showStatus('Settings saved!', 'success');
    updateAllTabs();
  });
}

function updateAllTabs() {
  chrome.tabs.query({ url: '*://*.amazon.com/*' }, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'UPDATE_SETTINGS',
          salary: settings.monthlySalary,
          hourlyWage: settings.hourlyWage,
          dailyHours: settings.dailyHours,
          workingDaysPerWeek: settings.workingDaysPerWeek,
          currency: settings.currency,
          inputType: settings.inputType,
          enabled: settings.enabled
        });
      }
    });
  });
}

function toggleExtension() {
  settings.enabled = !settings.enabled;
  const checkbox = document.getElementById('extension-toggle') as HTMLInputElement;
  if (checkbox) checkbox.checked = settings.enabled;
  chrome.storage.local.set({ userSettings: settings });
  showStatus(settings.enabled ? 'Extension enabled!' : 'Extension disabled!', 'success');
  updateAllTabs();
}

function toggleInputMode() {
  settings.inputType = settings.inputType === 'hourly' ? 'monthly' : 'hourly';
  chrome.storage.local.set({ userSettings: settings });
  renderInputs();
}

function renderInputs() {
  const salaryGroup = document.getElementById('salary-input') as HTMLDivElement;
  const hourlyGroup = document.getElementById('hourly-input') as HTMLDivElement;
  const hourlyDisplay = document.querySelector('.hourly-wage-display') as HTMLDivElement;

  if (settings.inputType === 'monthly') {
    if (salaryGroup) salaryGroup.style.display = 'block';
    if (hourlyGroup) hourlyGroup.style.display = 'none';
    if (hourlyDisplay) {
      const hasValidSalary = settings.monthlySalary !== undefined && settings.monthlySalary > 0;
      hourlyDisplay.style.display = hasValidSalary ? 'block' : 'none';
      if (hasValidSalary) {
        const wageValue = hourlyDisplay.querySelector('.wage-value') as HTMLElement;
        if (wageValue) wageValue.textContent = calculateHourlyWage();
      }
    }
  } else {
    if (salaryGroup) salaryGroup.style.display = 'none';
    if (hourlyGroup) hourlyGroup.style.display = 'block';
    if (hourlyDisplay) hourlyDisplay.style.display = 'none';
  }
}

// --- Initialization ---
function initPopup() {
  try {
    chrome.storage.local.get(['userSettings'], (result) => {
      if (result.userSettings) {
        settings = { ...defaultSettings, ...result.userSettings };
      } else {
        // Set reasonable defaults for new users
        settings = { 
          ...defaultSettings,
          monthlySalary: 800,
          hourlyWage: 5
        };
      }

      // Initialize UI elements
      const extensionToggle = document.getElementById('extension-toggle') as HTMLInputElement;
      const inputModeToggle = document.getElementById('input-toggle') as HTMLInputElement;
      const salaryInput = document.getElementById('salary') as HTMLInputElement;
      const hourlyInput = document.getElementById('hourly') as HTMLInputElement;
      const workingHoursInput = document.getElementById('working-hours') as HTMLInputElement;
      const workingDaysWeekInput = document.getElementById('working-days-week') as HTMLInputElement;
      const currencySelect = document.getElementById('currency-select') as HTMLSelectElement;

      // Remove existing event listeners by cloning elements
      if (extensionToggle) {
        const newExtensionToggle = extensionToggle.cloneNode(true) as HTMLInputElement;
        extensionToggle.parentNode?.replaceChild(newExtensionToggle, extensionToggle);
        newExtensionToggle.checked = settings.enabled;
        newExtensionToggle.addEventListener('change', toggleExtension);
      }

      if (inputModeToggle) {
        const newInputModeToggle = inputModeToggle.cloneNode(true) as HTMLInputElement;
        inputModeToggle.parentNode?.replaceChild(newInputModeToggle, inputModeToggle);
        newInputModeToggle.checked = settings.inputType === 'hourly';
        newInputModeToggle.addEventListener('change', toggleInputMode);
      }

      if (salaryInput) {
        salaryInput.value = settings.monthlySalary?.toString() || '800';
        salaryInput.addEventListener('input', (e) => {
          settings.monthlySalary = parseFloat((e.target as HTMLInputElement).value) || 0;
          renderInputs();
          // Auto-save after a short delay
          clearTimeout((window as any).saveTimeout);
          showStatus('Saving...', 'info');
          (window as any).saveTimeout = setTimeout(() => {
            chrome.storage.local.set({ userSettings: settings }, () => {
              showStatus('Settings saved!', 'success');
            });
          }, 500);
        });
      }

      if (hourlyInput) {
        hourlyInput.value = settings.hourlyWage?.toString() || '5';
        hourlyInput.addEventListener('input', (e) => {
          settings.hourlyWage = parseFloat((e.target as HTMLInputElement).value) || 0;
          renderInputs();
          // Auto-save after a short delay
          clearTimeout((window as any).saveTimeout);
          showStatus('Saving...', 'info');
          (window as any).saveTimeout = setTimeout(() => {
            chrome.storage.local.set({ userSettings: settings }, () => {
              showStatus('Settings saved!', 'success');
            });
          }, 500);
        });
      }



      // Initialize working hours fields
      if (workingHoursInput) {
        workingHoursInput.value = settings.dailyHours?.toString() || '8';
        workingHoursInput.addEventListener('input', (e) => {
          settings.dailyHours = parseFloat((e.target as HTMLInputElement).value) || 8;
          renderInputs();
          // Auto-save after a short delay
          clearTimeout((window as any).saveTimeout);
          showStatus('Saving...', 'info');
          (window as any).saveTimeout = setTimeout(() => {
            chrome.storage.local.set({ userSettings: settings }, () => {
              showStatus('Settings saved!', 'success');
            });
          }, 500);
        });
      }

      if (workingDaysWeekInput) {
        workingDaysWeekInput.value = settings.workingDaysPerWeek?.toString() || '5';
        workingDaysWeekInput.addEventListener('input', (e) => {
          settings.workingDaysPerWeek = parseFloat((e.target as HTMLInputElement).value) || 5;
          renderInputs();
          // Auto-save after a short delay
          clearTimeout((window as any).saveTimeout);
          showStatus('Saving...', 'info');
          (window as any).saveTimeout = setTimeout(() => {
            chrome.storage.local.set({ userSettings: settings }, () => {
              showStatus('Settings saved!', 'success');
            });
          }, 500);
        });
      }

      // Populate currency select dynamically
      populateCurrencySelect();
      
      // Set currency select value after populating options
      if (currencySelect) {
        currencySelect.value = settings.currency;
        currencySelect.addEventListener('change', (e) => {
          settings.currency = (e.target as HTMLSelectElement).value as CurrencyCode;
          renderInputs();
          // Auto-save immediately for currency changes
          chrome.storage.local.set({ userSettings: settings });
        });
      }
      
      renderInputs();
      
      // Initialize collapsible info panel
      initInfoPanel();
    });
  } catch (error) {
    console.error('Error initializing popup:', error);
    showStatus('Error loading settings', 'error');
  }
}

// --- Currency Functions ---
function populateCurrencySelect() {
  const currencySelect = document.getElementById('currency-select') as HTMLSelectElement;
  
  if (currencySelect) {
    // Clear existing options
    currencySelect.innerHTML = '';
    
    // Add options from CURRENCIES object
    Object.entries(CURRENCIES).forEach(([code, currency]) => {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = `${code} - ${currency.name} (${currency.symbol})`;
      
      // Set EUR as default selected
      if (code === 'EUR') {
        option.selected = true;
      }
      
      currencySelect.appendChild(option);
    });
  }
}

// --- Info Panel Functions ---
function initInfoPanel() {
  const infoToggle = document.getElementById('info-toggle') as HTMLButtonElement;
  const infoContent = document.getElementById('info-content') as HTMLDivElement;
  
  if (infoToggle && infoContent) {
    // Start collapsed by default
    infoContent.classList.add('collapsed');
    infoToggle.classList.add('collapsed');
    updateInfoToggleText(infoToggle, false);
    
    infoToggle.addEventListener('click', () => {
      const isCollapsed = infoContent.classList.contains('collapsed');
      
      if (isCollapsed) {
        // Expand
        infoContent.classList.remove('collapsed');
        infoToggle.classList.remove('collapsed');
        updateInfoToggleText(infoToggle, true);
      } else {
        // Collapse
        infoContent.classList.add('collapsed');
        infoToggle.classList.add('collapsed');
        updateInfoToggleText(infoToggle, false);
      }
    });
  }
}

function updateInfoToggleText(toggle: HTMLButtonElement, isExpanded: boolean) {
  const textSpan = toggle.querySelector('.info-toggle-text') as HTMLElement;
  if (textSpan) {
    textSpan.textContent = isExpanded ? 'ℹ️ Hide Info' : 'ℹ️ Show Info';
  }
}

document.addEventListener('DOMContentLoaded', initPopup);

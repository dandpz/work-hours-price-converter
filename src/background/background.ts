import { UserSettings } from '../types';

type Message =
    | { type: 'GET_USER_SETTINGS' }
    | { type: 'SAVE_USER_SETTINGS'; settings: UserSettings };

type Response<T> = (response: T) => void;

chrome.runtime.onInstalled.addListener(() => {
    console.log('Work Hours Price Converter installed!');
});

chrome.runtime.onMessage.addListener(
    (message: Message, sender, sendResponse: Response<any>) => {
        switch (message.type) {
            case 'GET_USER_SETTINGS':
                chrome.storage.local.get(['userSettings'], (result) => {
                    const settings: UserSettings = result.userSettings || { hourlySalary: 5, currency: 'EUR', inputType: 'hourly', enabled: true };
                    sendResponse(settings);
                });
                return true;

            case 'SAVE_USER_SETTINGS':
                chrome.storage.local.set({ userSettings: message.settings }, () => {
                    sendResponse({ success: true });
                });
                return true;

            default:
                return false;
        }
    }
);
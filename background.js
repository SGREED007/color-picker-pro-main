// PixelPick Pro - Background Service Worker
// Handles extension lifecycle and background tasks

// Extension installation
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Color Picker Pro installed:', details.reason);
    
    if (details.reason === 'install') {
        // Set up default settings or show welcome message
        chrome.storage.local.set({
            colorHistory: [],
            settings: {
                autoClipboard: true,
                defaultFormat: 'hex'
            }
        });
    }
});

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
    try {
        // Open popup (this is handled automatically by manifest)
        // But we can add additional logic here if needed
        console.log('Extension icon clicked on tab:', tab.id);
    } catch (error) {
        console.error('Error handling icon click:', error);
    }
});

// Handle keyboard shortcuts (if we add them later)
chrome.commands?.onCommand.addListener((command) => {
    console.log('Command received:', command);
    
    switch (command) {
        case 'pick-color':
            // Trigger color picking from keyboard shortcut
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs.id, { action: 'pickColor' });
                }
            });
            break;
    }
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received:', request);
    
    switch (request.action) {
        case 'getTabInfo':
            // Return current tab information
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                sendResponse({ tab: tabs });
            });
            return true; // Will respond asynchronously
            
        case 'showNotification':
            // Show system notification if needed
            if (chrome.notifications) {
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icons/icon48.png',
                    title: 'Color Picker Pro',
                    message: request.message
                });
            }
            break;
            
        default:
            console.log('Unknown message action:', request.action);
    }
});

// Handle storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        console.log(
            `Storage key "${key}" in namespace "${namespace}" changed.`,
            `Old value was "${oldValue}", new value is "${newValue}".`
        );
    }
});

// Cleanup on extension suspension
self.addEventListener('beforeunload', () => {
    console.log('Color Picker Pro service worker suspending');
});

// Keep service worker alive when needed
let keepAlive;

function startKeepAlive() {
    keepAlive = setInterval(() => {
        chrome.runtime.getPlatformInfo(() => {
            // Just a dummy call to keep the service worker alive
        });
    }, 25000);
}

function stopKeepAlive() {
    if (keepAlive) {
        clearInterval(keepAlive);
        keepAlive = null;
    }
}

// Start keep alive when extension is active
chrome.runtime.onStartup.addListener(startKeepAlive);
chrome.runtime.onInstalled.addListener(startKeepAlive);

console.log('Color Picker Pro service worker loaded');

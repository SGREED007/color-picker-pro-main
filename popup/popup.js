// PixelPick Pro - Color Picker Extension
// Core functionality and UI interactions

class ColorPicker {
    constructor() {
        this.currentColor = null;
        this.colorHistory = [];
        this.maxHistorySize = 20;
        
        this.init();
    }

    async init() {
        await this.loadColorHistory();
        this.setupEventListeners();
        this.renderColorHistory();
        this.checkEyeDropperSupport();
    }

    // Check if EyeDropper API is supported
    checkEyeDropperSupport() {
        if (!('EyeDropper' in window)) {
            this.showStatus('EyeDropper API not supported in this browser', 'error');
            document.getElementById('pickColorBtn').disabled = true;
        }
    }

    // Setup all event listeners
    setupEventListeners() {
        // Main pick color button
        document.getElementById('pickColorBtn').addEventListener('click', () => {
            this.pickColor();
        });

        // Copy buttons
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const format = e.target.getAttribute('data-format');
                this.copyColorValue(format);
            });
        });

        // Clear history button
        document.getElementById('clearHistoryBtn').addEventListener('click', () => {
            this.clearColorHistory();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                if (e.target.id === 'pickColorBtn') {
                    this.pickColor();
                }
            }
            if (e.key === 'Escape') {
                window.close();
            }
        });
    }

    // Main color picking function
    async pickColor() {
        if (!('EyeDropper' in window)) {
            this.showStatus('EyeDropper API not supported', 'error');
            return;
        }

        try {
            const pickBtn = document.getElementById('pickColorBtn');
            pickBtn.classList.add('loading');
            pickBtn.disabled = true;

            const eyeDropper = new EyeDropper();
            const result = await eyeDropper.open();
            
            this.currentColor = result.sRGBHex;
            this.displayColor(this.currentColor);
            this.addToHistory(this.currentColor);
            this.copyToClipboard(this.currentColor);
            this.showStatus(`Color ${this.currentColor} copied to clipboard!`);
            
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Color picking failed:', err);
                this.showStatus('Failed to pick color. Please try again.', 'error');
            }
        } finally {
            const pickBtn = document.getElementById('pickColorBtn');
            pickBtn.classList.remove('loading');
            pickBtn.disabled = false;
        }
    }

    // Display picked color in all formats
    displayColor(hexColor) {
        const colorDisplay = document.getElementById('colorDisplay');
        const colorPreview = document.getElementById('colorPreview');
        
        // Show color display section
        colorDisplay.style.display = 'block';
        
        // Set preview background
        colorPreview.style.backgroundColor = hexColor;
        
        // Convert to different formats
        const rgb = this.hexToRgb(hexColor);
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        
        // Update input values
        document.getElementById('hexValue').value = hexColor.toUpperCase();
        document.getElementById('rgbValue').value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        document.getElementById('hslValue').value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    }

    // Copy color value to clipboard
    async copyColorValue(format) {
        if (!this.currentColor) return;
        
        let value = '';
        const rgb = this.hexToRgb(this.currentColor);
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        
        switch(format) {
            case 'hex':
                value = this.currentColor.toUpperCase();
                break;
            case 'rgb':
                value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
                break;
            case 'hsl':
                value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
                break;
        }
        
        try {
            await this.copyToClipboard(value);
            this.showCopyFeedback(format);
            this.showStatus(`${format.toUpperCase()} value copied!`);
        } catch (err) {
            this.showStatus('Failed to copy to clipboard', 'error');
        }
    }

    // Copy to clipboard helper
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    }

    // Show copy feedback animation
    showCopyFeedback(format) {
        const btn = document.querySelector(`[data-format="${format}"]`);
        const originalText = btn.textContent;
        
        btn.classList.add('copied');
        btn.textContent = 'Copied!';
        
        setTimeout(() => {
            btn.classList.remove('copied');
            btn.textContent = originalText;
        }, 1000);
    }

    // Add color to history
    async addToHistory(hexColor) {
        // Remove if already exists
        this.colorHistory = this.colorHistory.filter(color => color !== hexColor);
        
        // Add to beginning
        this.colorHistory.unshift(hexColor);
        
        // Limit history size
        if (this.colorHistory.length > this.maxHistorySize) {
            this.colorHistory = this.colorHistory.slice(0, this.maxHistorySize);
        }
        
        await this.saveColorHistory();
        this.renderColorHistory();
    }

    // Render color history grid
    renderColorHistory() {
        const historyContainer = document.getElementById('colorHistory');
        historyContainer.innerHTML = '';
        
        this.colorHistory.forEach((color, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.style.backgroundColor = color;
            historyItem.setAttribute('data-color', color);
            historyItem.title = `Click to copy ${color}`;
            
            historyItem.addEventListener('click', async () => {
                await this.copyToClipboard(color);
                this.showStatus(`${color} copied to clipboard!`);
                
                // Visual feedback
                historyItem.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    historyItem.style.transform = '';
                }, 200);
            });
            
            historyContainer.appendChild(historyItem);
        });
    }

    // Clear color history
    async clearColorHistory() {
        this.colorHistory = [];
        await this.saveColorHistory();
        this.renderColorHistory();
        this.showStatus('Color history cleared', 'info');
    }

    // Save color history to Chrome storage
    async saveColorHistory() {
        try {
            await chrome.storage.local.set({
                colorHistory: this.colorHistory
            });
        } catch (err) {
            console.error('Failed to save color history:', err);
        }
    }

    // Load color history from Chrome storage
    async loadColorHistory() {
        try {
            const result = await chrome.storage.local.get(['colorHistory']);
            this.colorHistory = result.colorHistory || [];
        } catch (err) {
            console.error('Failed to load color history:', err);
            this.colorHistory = [];
        }
    }

    // Show status message
    showStatus(message, type = 'success') {
        const statusEl = document.getElementById('statusMessage');
        statusEl.textContent = message;
        statusEl.className = `status-message ${type}`;
        statusEl.style.display = 'block';
        
        // Hide after 3 seconds
        setTimeout(() => {
            statusEl.style.display = 'none';
        }, 3000);
    }

    // Color conversion utilities
    hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
    }

    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;
        const sum = max + min;
        
        let h = 0;
        let s = 0;
        const l = sum / 2;
        
        if (diff !== 0) {
            s = l > 0.5 ? diff / (2 - sum) : diff / sum;
            
            switch (max) {
                case r:
                    h = (g - b) / diff + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / diff + 2;
                    break;
                case b:
                    h = (r - g) / diff + 4;
                    break;
            }
            h /= 6;
        }
        
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ColorPicker();
});

// Handle extension icon click
if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.onMessage?.addListener((request, sender, sendResponse) => {
        if (request.action === 'pickColor') {
            const colorPicker = new ColorPicker();
            colorPicker.pickColor();
        }
    });
}

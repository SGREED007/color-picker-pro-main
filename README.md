# PixelPick Pro — Chrome Color Picker

Pick any on-screen color using the native EyeDropper API. Instantly view HEX/RGB/HSL, copy with one click, and keep a persistent visual history in a compact, accessible UI.

Live url: https://microsoftedge.microsoft.com/addons/detail/color-picker-pro-fast-c/adomppoofemjhackbjbkfplknjdaepdo

## Features

- EyeDropper-based picking from anywhere on screen
- Immediate HEX, RGB, and HSL display
- One-click copy for each format with "Copied!" feedback
- Auto-copy of the picked HEX
- Persistent history (up to 20), click swatch to copy
- Clear-all history with an explicit destructive action
- Keyboard support: Enter/Space to pick; Escape to close
- Responsive layout with subtle, performance-friendly animations

## Installation

- Download or clone this repository
- Open Chrome and go to `chrome://extensions`
- Enable Developer mode
- Click "Load unpacked" and select the project folder (Manifest V3)
- Pin the extension for quick access

## Usage

- Open the popup and press "Pick color" to activate the EyeDropper overlay
- Click any pixel to capture its color
- Copy HEX/RGB/HSL using the respective buttons
- Reuse colors by clicking swatches in History
- Clear history using the dedicated button

## Get it on Microsoft Edge

- Live on the Microsoft Edge Add-ons store under: **Color Picker Pro — Fast Color Picker**
- Install from the Edge Web Store to receive automatic updates

## Design & Accessibility

- **Layout:** Card-based sections for action, color details, history, and footer
- **Primary action:** Indigo→purple gradient button for prominence
- **Status colors:** Success (green), Error (red), Info (blue)
- **Typography:** System UI stack; monospace for color values
- **Interactions:** Clear focus-visible outlines, concise status messaging
- **Motion:** Subtle hover/active transitions; restrained shadows

## File Overview

- `popup.html` — Popup UI structure
- `popup.css` — Layout, colors, components, and states
- `popup.js` — EyeDropper integration, clipboard, history, storage
- `manifest.json` — Manifest V3 configuration
- `icons/` — 16, 32, 48, 128px assets

## Notes

- History persists via `chrome.storage.local` (max 20 entries)
- If EyeDropper is unavailable, the pick button is disabled and an error is shown
- Clipboard uses the async API with a safe fallback

## Roadmap

- [ ] Named/tagged colors
- [ ] Palette export/import
- [ ] WCAG contrast checker
- [ ] Additional formats (CMYK, HWB, LCH)
- [ ] Multi-pick palette preview

## License

MIT (or add a preferred license at the repository root)

## Contributing

- Open issues for bugs and enhancements
- Fork, create a branch, and submit a PR with clear description and test steps

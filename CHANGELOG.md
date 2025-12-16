# Changelog

All notable changes to the **Scribd Enhancer All-in-One** project will be documented in this file.

## [3.4.0] - 2025-12-16

### ✨ Features

- **Inline Image Scraping**: The Scraper Output now natively displays images found on pages. It filters out small icons and only shows substantial content images (>150px).
- **Improved Export**: HTML Export now includes these images, making it a true "Rich Text" export.

## [3.3.0] - 2025-12-16

### ✨ New UI (Pleasant Upgrade)

- **Redesigned Interface**: Switched from Glassmorphism to a cleaner, polished "Pleasant Dark" theme with soft blue gradients and rounded aesthetics.
- **Smart Dragging**: Fixed a bug where the menu wouldn't open if you clicked it too fast (drag detection was too aggressive). Now uses pixel-distance detection.
- **Preview Box**: Renamed to "Scraper Output / Reader" and is now **hidden by default**. It will pop up automatically when you click "Scrape".

## [3.2.0] - 2025-12-16

### ✨ Added
- **Glassmorphism UI**: Completely redesigned the control panel with a modern, blurred, semi-transparent aesthetic.
- **Toast Notifications**: Replaced intrusive browser alerts (`alert()`) with a custom, non-blocking toast notification system at the top of the screen.
- **Micro-animations**: Added subtle hover effects and transitions to buttons and inputs for a premium feel.

### 🛠️ Fixed
- **Code Optimization**: Refactored DOM queries and event handlers for better performance.
- **Styling**: Improved Dark Mode consistency across the panel and preview window.

### 🔄 Changed
- **Dependencies**: Updated standard library references.
- **Defaults**: Tweaked default snapshot settings for better quality out-of-the-box.

---

## [3.1.0] - Prior Version
### Added
- External Downloader button integration.
- Rich HTML export with preference controls (Text vs Image layer).
- Snapshot PDF "pixel-perfect" mode.
- Collapsible Preview window with position memory.

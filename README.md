# Scribd Enhancer All-in-One

![Scribd Enhancer Banner](https://img.shields.io/badge/Scribd-Enhancer-1e1f22?style=for-the-badge&logo=scribd&logoColor=white)
![Version](https://img.shields.io/badge/Version-3.2.0-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

**Unlock the full potential of Scribd reading.** This userscript is a powerful, all-in-one toolkit designed to enhance your experience on Scribd.com. It provides advanced features like unblurring content, comprehensive export options (TXT, pixel-perfect PDF, Rich HTML), and a modern, draggable control panel.

## ✨ Features

*   **👁️ Unblur & Cleanup**: Automatically removes blurred pages, "promo" banners, and unselectable text restrictions.
*   **💾 Advanced Exporting**:
    *   **Plain Text (.txt)**: Extract pure text from the document.
    *   **Plain HTML (.html)**: Export text with basic formatting.
    *   **Snapshot PDF (.pdf)**: Create a pixel-perfect PDF from page screenshots (HTML2Canvas + jsPDF). Great for documents with complex layouts.
    *   **Rich HTML (.html)**: Export a self-contained HTML file with images inlined and layout preserved. Smartly handles duplicate layers (text vs. image).
    *   **Print**: Clean print view for system printing.
*   **📖 OCR Support**: Built-in integration with Tesseract.js to extract text from image-only pages on the fly.
*   **⚙️ Modern UI**:
    *   **Glassmorphism Control Panel**: a beautiful, translucent, draggable menu.
    *   **Floating Gear**: Unobtrusive floating button to toggle the menu.
    *   **Live Preview**: See what you scrape in real-time.
    *   **Toast Notifications**: Non-intrusive status updates instead of annoying popups.
*   **⬇️ External Downloader**: One-click integration with `scribd.vdownloaders.com` for valid file downloads.
*   **🛠️ Power Tools**:
    *   **Page Range**: Export specific pages (e.g., `1-10`, `5,8,20`).
    *   **Auto-Scrape**: Option to start scraping immediately on load.
    *   **Dark Mode**: A built-in dark theme for the document viewer and panel.

## 🚀 Installation

1.  Install a userscript manager like **Tampermonkey** or **Violentmonkey**.
2.  [**Click Here to Install**](https://greasyfork.org/scripts/483606-scribd-enhancer-all-in-one) (or copy the script code).
3.  Visit any Scribd document page.
4.  Look for the floating **⚙️ Gear Icon** (default: bottom-right) to open the control panel.

## 🕹️ Controls

*   **Open Panel**: Click the Floating Gear ⚙️ or press `G`.
*   **Toggle Preview**: Click the "Eye" 👁️ icon or press `P`.
*   **Close Panel**: Press `ESC` or click the `X`.

## 📸 Usage Tips

*   **Snapshot PDF**: Use `Scale: 2x` and `Quality: 0.92` for the best balance of quality and file size.
*   **Rich Export**: If a document has selectable text but also page images, try setting "Rich Export Preference" to "Keep Text" to reduce file size.
*   **OCR**: Select your document's language in the dropdown for better accuracy if the auto-detection fails.

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.

---
*Disclaimer: This script is for educational and accessibility purposes only. Please respect copyright laws and Scribd's terms of service.*

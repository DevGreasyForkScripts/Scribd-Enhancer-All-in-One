# 📘 Scribd Enhancer All-in-One (v3.5.0)

**Author:** [Eliminater74](https://greasyfork.org/users/Eliminater74)  
**License:** MIT  
**Compatible with:** Chrome + Tampermonkey, Firefox + Violentmonkey  
**Matches:**  
`*://*.scribd.com/*`  
`*://scribd.vdownloaders.com/*`

---

## 🆕 What’s New in v3.5.0

*   **DOC Export** — Export scraped content directly to a Microsoft Word-compatible `.doc` file.
*   **Inline Image Scraping** — The scraper now detects and displays images inline within the output reader (filtering out small icons).
*   **Refined PDF Export** — Renamed "Print" to "Print / Save PDF" to clarify that the system print dialog is the best way to get text-searchable PDFs.
*   **"Pleasant Dark" UI** — A complete visual overhaul (v3.3.0) replacing the old look with a polished, rounded, dark-blue aesthetic.
*   **Smart Dragging** — Fixed menu interactions so clicks are never mistaken for drags.
*   **Toast Notifications** — Replaced annoying browser alerts with sleek, non-blocking popup notifications.

---

## ✨ Features

✅ **Unblur Content** — Instantly removes Scribd’s blur filters and visual overlays  
✅ **Inline Image Support** — Captures and displays images directly in the Scraper Output box  
✅ **Full-Text & Image OCR** — Uses [Tesseract.js](https://tesseract.projectnaptha.com/) to read scanned pages  
✅ **Auto Language Detection** — Detects document language automatically or allows manual selection  
✅ **Smart Filtering** — Skips irrelevant logos, icons, and watermark graphics  
✅ **Live Scraper Output** — See text and images appear in real-time (hidden by default, toggles with `P` key or empty scrape)  

✅ **Export Options**:
*   📝 **TXT** — Clean text only
*   📄 **DOC** — Microsoft Word compatible file
*   🌐 **HTML** — Plain or Rich (includes inline images)
*   🖨️ **Print / Save PDF** — Uses system print to generate searchable PDF
*   📷 **Snapshot PDF** — Pixel-perfect image-based PDF (great for preserving exact layout)

✅ **Integration**:
*   **External Downloader** — One-click button to open the current document in `scribd.vdownloaders.com`
*   **Auto-Fill** — Automatically fills the URL when opening the external downloader

✅ **Customization**:
*   **Dark Mode** — Optional night-friendly reading mode
*   **Persistent Settings** — All toggles, menu state, and UI positions are saved locally
*   **Draggable UI** — Move the menu and the output box anywhere on your screen

---

## 📖 How to Use

1.  **Install** the script in Tampermonkey or Violentmonkey.
2.  **Open** any Scribd document.
3.  **Click** the floating gear ⚙️ icon to open the control panel:
    *   Enable **Unblur** to see content clearly.
    *   Click **Scrape Content** to extract text and images.
    *   Use the **Scraper Output** window to review the content.
4.  **Export** your content:
    *   Click **DOC** for Word documents.
    *   Click **Print / Save PDF** for a searchable PDF file.
    *   Click **Snapshot PDF** if you need an exact visual copy.
5.  (Optional) Use the **External Downloader** section to process the link via 3rd party tools.

---

## 💡 Tips

*   **Keyboard Shortcut**: Press **`P`** to quickly toggle the Scraper Output visibility.
*   **OCR**: Keep **Unblur** + **OCR** enabled for the best results on scanned documents.
*   **PDFs**: For the best text-searchable PDF, use the **Print / Save PDF** button and choose "Save as PDF" in your browser's print dialog.
*   **Images**: The scraper automatically filters out images smaller than 150px to keep your export clean.

---

## 🔮 Planned Updates

*   **Rich HTML Layer Cleanup** — Eliminate duplicate/overlapping text and image layers
*   **Selective Export** — Scrape by page range or keyword search
*   **Integrated Translation** — Auto-translate OCR output into your chosen language
*   **ZIP Bundling** — Package all text, HTML, and images in a single download

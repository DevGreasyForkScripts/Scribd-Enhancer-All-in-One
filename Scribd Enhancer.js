// ==UserScript==
// @name         Scribd Enhancer All-in-One (v3.1.0)
// @namespace    https://greasyfork.org/users/Eliminater74
// @version      3.1.0
// @description  Scribd Enhancer with OCR, TXT/HTML export, Snapshot PDF (pixel-perfect), Rich HTML (images inlined), page-range + quality controls. Draggable/collapsible panel + floating gear with position memory. Rich HTML de-duplicates layered text/image. + External Downloader button (scribd.vdownloaders.com) with URL templating. Preview now has a quick-hide toggle.
// @author       Eliminater74
// @license      MIT
// @match        *://*.scribd.com/*
// @match        *://scribd.vdownloaders.com/*
// @grant        none
// @icon         https://s-f.scribdassets.com/favicon.ico
// ==/UserScript==

(function () {
  'use strict';

  // ---------- KEYS ----------
  const SETTINGS_KEY   = 'scribdEnhancerSettings';
  const UI_MENU_KEY    = 'scribdEnhancer_ui_menu';
  const UI_GEAR_KEY    = 'scribdEnhancer_ui_gear';
  const UI_PREVIEW_POS = 'scribdEnhancer_ui_preview';

  // ---------- SETTINGS ----------
  const defaultSettings = {
    unblur: true,
    autoScrape: false,
    darkMode: false,
    showPreview: true,       // panel toggle (still available)
    previewCollapsed: false, // NEW: remembers quick-hide state
    enableOCR: true,
    ocrLang: 'auto',
    splitEvery: 0,

    // Snapshot controls
    pageRange: 'all',     // 'all' | '1-25' | '5,7,10-12'
    snapshotScale: 2,     // 1..4
    snapshotQuality: 0.92, // 0.8 | 0.92 | 1.0

    // Rich HTML layer preference: 'auto' | 'preferText' | 'preferImage'
    richPref: 'auto',

    // NEW: External downloader
    // Supports {url} template. If not present, appends ?url=<encoded>.
    downloaderUrl: 'https://scribd.vdownloaders.com/?url={url}',
  };
  const settings = { ...defaultSettings, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') };
  const saveSettings = () => localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

  // ---------- LIBS ----------
  const loadScript = (src) => { const s = document.createElement('script'); s.src = src; document.head.appendChild(s); return s; };
  loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@4.0.2/dist/tesseract.min.js');
  loadScript('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js');
  loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js');

  // ---------- STYLES ----------
  const style = document.createElement('style');
  style.textContent = `
    #se-gear {
      position: fixed; width: 40px; height: 40px; line-height: 40px; text-align: center;
      background:#2b2b2b; color:#fff; border-radius: 50%; cursor: pointer;
      box-shadow: 0 2px 10px rgba(0,0,0,.45); z-index: 2147483647; user-select:none;
      font-size: 20px;
    }
    #se-panel {
      position: fixed; background:#1e1f22; color:#f1f1f1; width: 340px; border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,.6); z-index: 2147483646; font-family: system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
      display: none;
    }
    #se-header {
      display:flex; align-items:center; justify-content:space-between; padding:8px 10px; cursor:move;
      background:#2a2b2f; border-top-left-radius:12px; border-top-right-radius:12px;
      font-weight:600;
    }
    #se-header .controls { display:flex; gap:6px; }
    #se-header .btn {
      width:24px; height:24px; line-height:24px; text-align:center; border-radius:6px; background:#3a3b41; cursor:pointer;
      user-select:none;
    }
    #se-body { padding:8px 10px 10px; max-height: 70vh; overflow:auto; }
    #se-body label { display:flex; align-items:center; gap:6px; font-size:13px; margin:4px 0; }
    #se-body .row { display:flex; gap:8px; }
    #se-body .row > * { flex:1; }
    #se-body input[type="text"], #se-body select {
      width:100%; padding:6px; border-radius:6px; border:1px solid #444; background:#121316; color:#eee; font-size:13px;
    }
    #se-body button {
      width:100%; padding:8px; margin-top:6px; border:none; border-radius:8px; background:#3b3d45; color:#fff;
      cursor:pointer; font-size:13px;
    }
    #se-body button:hover { filter:brightness(1.08); }
    #se-preview {
      position: fixed; right: 20px; bottom: 80px; width: 380px; top: 12px;
      background:#111; color:#eee; border:1px solid #444; border-radius:10px;
      padding:0; font-family: ui-monospace,Menlo,Consolas,monospace; font-size:12px; white-space:pre-wrap;
      overflow:auto; z-index: 2147483645;
    }
    #se-preview.collapsed { display:none !important; }
    #se-preview .bar {
      display:flex; align-items:center; justify-content:space-between; gap:6px;
      padding:6px 8px; background:#202225; border-bottom:1px solid #333; border-top-left-radius:10px; border-top-right-radius:10px;
      user-select:none;
    }
    #se-preview .bar .title { font-size:12px; opacity:.9 }
    #se-preview .bar .btns { display:flex; gap:6px; }
    #se-preview .bar .btn {
      width:20px; height:20px; line-height:20px; text-align:center; border-radius:5px; background:#2f3136; cursor:pointer;
    }
    #se-preview .content { padding:8px; }
    .se-dark #se-preview { background:#222; color:#eee; border-color:#555; }
  `;
  document.head.appendChild(style);

  // ---------- HELPERS ----------
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const safe  = (s) => (s || '').toString();

  function applyDarkMode() {
    document.documentElement.classList.toggle('se-dark', settings.darkMode);
    document.body.classList.toggle('se-dark', settings.darkMode);
  }

  function unblurContent() {
    if (!settings.unblur) return;
    const cleanup = () => {
      document.querySelectorAll('.blurred_page, .promo_div, [unselectable="on"]').forEach(el => el.remove());
      document.querySelectorAll('*').forEach(el => {
        const cs = getComputedStyle(el);
        if (cs.color === 'transparent') el.style.color = '#111';
        if (cs.textShadow && cs.textShadow.includes('white')) el.style.textShadow = 'none';
      });
    };
    cleanup();
    new MutationObserver(cleanup).observe(document.body, { childList: true, subtree: true });
  }

  function cleanOCRText(text) {
    return text.split('\n').map(t => t.trim())
      .filter(line => line.length >= 3 && /[a-zA-Z]/.test(line) && !/^[^a-zA-Z0-9]{3,}$/.test(line))
      .join('\n');
  }

  function detectLanguage(text) {
    const map = { spa:/[ñáéíóúü]/i, fra:/[éèêëàâôûùç]/i, deu:/[äöüß]/i, ron:/[șțăîâ]/i };
    for (const [k,re] of Object.entries(map)) if (re.test(text)) return k;
    return 'eng';
  }

  async function preprocessImage(src) {
    return new Promise(resolve => {
      const img = new Image(); img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (img.naturalWidth < 100 || img.naturalHeight < 100 || /logo|icon|watermark/i.test(src)) return resolve(null);
        const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
        const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0);
        const d = ctx.getImageData(0,0,c.width,c.height);
        for (let i=0; i<d.data.length; i+=4) {
          const avg = (d.data[i]+d.data[i+1]+d.data[i+2])/3;
          d.data[i]=d.data[i+1]=d.data[i+2]=avg;
        }
        ctx.putImageData(d,0,0);
        resolve(c.toDataURL('image/png'));
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  function getScribdPages() {
    return [...document.querySelectorAll(
      '.page, .reader_column, [id^="page_container"], .outer_page, .abs_page, .scribd_page, .text_layer'
    )];
  }

  function parsePageRange(rangeText, totalPages) {
    const txt = safe(rangeText).trim().toLowerCase();
    if (!txt || txt === 'all') return Array.from({length: totalPages}, (_,i)=>i);
    const set = new Set();
    for (const part of txt.split(/[,;]\s*/)) {
      const m = part.match(/^(\d+)\s*-\s*(\d+)$/);
      if (m) {
        let a = clamp(+m[1],1,totalPages), b = clamp(+m[2],1,totalPages);
        if (a>b) [a,b]=[b,a];
        for (let p=a; p<=b; p++) set.add(p-1);
      } else {
        const n = clamp(parseInt(part,10),1,totalPages);
        if (!isNaN(n)) set.add(n-1);
      }
    }
    return [...set].sort((x,y)=>x-y);
  }

  // ---------- EXPORTS ----------
  function exportOutput(content, ext) {
    const split = settings.splitEvery | 0;
    const parts = content.split(/(?=\[Page \d+])/);
    if (!split || split < 1) {
      const blob = new Blob([content], { type: ext==='html' ? 'text/html' : 'text/plain' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `scribd_output.${ext}`; a.click();
      return;
    }
    for (let i=0; i<parts.length; i+=split) {
      const chunk = parts.slice(i,i+split).join('\n');
      const blob = new Blob([chunk], { type: ext==='html' ? 'text/html' : 'text/plain' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `scribd_part${Math.floor(i/split)+1}.${ext}`; a.click();
    }
  }

  function printToPDF(content) {
    const win = window.open('', 'PrintView');
    win.document.write(`<html><head><title>Scribd Print</title></head><body><pre>${content}</pre></body></html>`);
    win.document.close(); win.focus(); setTimeout(() => win.print(), 600);
  }

  async function exportSnapshotPDF(allPages) {
    await new Promise(r => { const chk = () => (window.html2canvas && window.jspdf) ? r() : setTimeout(chk,100); chk(); });
    const pages = getPagesInRange(allPages); if (!pages.length) return alert('No pages selected.');

    const scale   = clamp(+settings.snapshotScale || 2, 1, 4);
    const quality = +settings.snapshotQuality || 0.92;

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit:'pt', format:'a4', compress:true });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    for (let i=0; i<pages.length; i++) {
      const node = pages[i];
      node.scrollIntoView({block:'center'}); await sleep(220);
      const canvas = await window.html2canvas(node, { useCORS:true, allowTaint:true, backgroundColor:'#ffffff', scale });
      const imgData = canvas.toDataURL('image/jpeg', quality);
      const imgW = pageW, imgH = (canvas.height/canvas.width) * imgW;
      if (i>0) pdf.addPage();
      const finalH = imgH > pageH ? pageH : imgH;
      const finalW = imgH > pageH ? (pageH/imgH)*imgW : imgW;
      pdf.addImage(imgData, 'JPEG', 0, 0, finalW, finalH);
      if (i % 10 === 0) await sleep(40);
    }
    pdf.save('scribd_snapshot.pdf');
  }
  function getPagesInRange(allPages) {
    const idxs = parsePageRange(settings.pageRange, allPages.length);
    return idxs.map(i => allPages[i]).filter(Boolean);
  }

  // --- Rich HTML (DOM clone + images inlined) with layer de-dup ---
  async function exportRichHTML(allPages) {
    const pages = getPagesInRange(allPages); if (!pages.length) return alert('No pages selected.');
    const sections = [];

    for (let i=0; i<pages.length; i++) {
      const clone = pages[i].cloneNode(true);

      // Remove hidden bits that can become visible offline
      clone.querySelectorAll('[aria-hidden="true"], [style*="opacity:0"], [style*="opacity: 0"], [style*="visibility:hidden"]').forEach(n => n.remove());

      // Decide which layer to keep
      const hasTextLayer = !!clone.querySelector('.text_layer, [class*="textLayer"]');
      const preferText = settings.richPref === 'preferText' || (settings.richPref === 'auto' && hasTextLayer);

      if (preferText) {
        clone.querySelectorAll('canvas').forEach(n => n.remove());
        clone.querySelectorAll('img').forEach(img => {
          const cls = img.className || '';
          const w = (img.getAttribute('width') || '') + (img.style?.width || '');
          const h = (img.getAttribute('height') || '') + (img.style?.height || '');
          if (/page|render|canvas|background/i.test(cls) || /100%/.test(w+h)) img.remove();
        });
      } else {
        clone.querySelectorAll('.text_layer, [class*="textLayer"]').forEach(n => n.remove());
      }

      // Inline images (best effort)
      const imgs = [...clone.querySelectorAll('img')];
      await Promise.all(imgs.map(async (img) => {
        try {
          const src = img.getAttribute('src') || img.src;
          if (!src) return;
          img.setAttribute('src', await imageToDataURL(src));
        } catch { /* keep original src */ }
      }));

      clone.querySelectorAll('script, link[rel="stylesheet"]').forEach(n => n.remove());
      sections.push(`<section style="page-break-after:always">${clone.outerHTML}</section>`);
      if (i % 20 === 0) await sleep(15);
    }

    const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Scribd Rich Export</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  *{transform:none !important}
  body{margin:16px;font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;}
  section{margin:0 auto; max-width:900px;}
  img{max-width:100%; height:auto;}
</style>
</head>
<body>
${sections.join('\n')}
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'scribd_rich.html';
    a.click();
  }

  function imageToDataURL(src) {
    return new Promise(resolve => {
      const img = new Image(); img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
          const ctx = c.getContext('2d'); ctx.drawImage(img,0,0); resolve(c.toDataURL('image/png'));
        } catch { resolve(src); }
      };
      img.onerror = () => resolve(src);
      const bust = src.includes('?') ? '&' : '?'; img.src = src + bust + 'x=' + Date.now();
    });
  }

  // ---------- SCRAPER ----------
  async function scrapePages(pages, previewEl) {
    const contentEl = previewEl.querySelector('.content');
    const concurrency = 4; let index = 0; const firstText = [];
    async function scrape(page, i) {
      page.scrollIntoView(); await sleep(300);
      let found = false;
      const text = page.innerText.trim();
      if (text) { contentEl.textContent += `[Page ${i+1}] ✅\n${text}\n\n`; firstText.push(text); found = true; }
      if (settings.enableOCR && window.Tesseract) {
        const imgs = page.querySelectorAll('img');
        for (let img of imgs) {
          const src = img.src || ''; const processed = await preprocessImage(src);
          if (!processed) continue;
          const lang = settings.ocrLang === 'auto' ? detectLanguage(firstText.join(' ')) : settings.ocrLang;
          try {
            const res = await window.Tesseract.recognize(processed, lang);
            const ocrText = cleanOCRText(res.data.text || '');
            if (ocrText) { contentEl.textContent += `[OCR] ${ocrText}\n\n`; found = true; }
          } catch {}
        }
      }
      if (!found) contentEl.textContent += `[Page ${i+1}] ❌ No content\n\n`;
    }
    const workers = Array(concurrency).fill().map(async ()=>{ while (index < pages.length) { const i = index++; await scrape(pages[i], i); }});
    await Promise.all(workers);
    alert(`✅ Scraped ${pages.length} pages.`);
  }

  // ---------- DRAGGABLE + UI ----------
  function makeDraggable(el, storageKey, fallbackPos) {
    el.style.position = 'fixed'; el.style.touchAction = 'none';
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) {
        el.style.left = saved.x + 'px'; el.style.top = saved.y + 'px';
      } else if (fallbackPos) {
        const {x,y} = fallbackPos(); el.style.left = x + 'px'; el.style.top = y + 'px';
      }
    } catch {}
    let startX, startY, startL, startT, moved=false;
    const onDown = (e) => {
      moved = false;
      const p = e.touches ? e.touches[0] : e;
      startX=p.clientX; startY=p.clientY;
      const r = el.getBoundingClientRect(); startL=r.left; startT=r.top;
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      document.addEventListener('touchmove', onMove, {passive:false});
      document.addEventListener('touchend', onUp);
    };
    const onMove = (e) => {
      const p = e.touches ? e.touches[0] : e;
      if (e.cancelable) e.preventDefault();
      moved = true;
      const nx = clamp(startL + (p.clientX-startX), 0, window.innerWidth - el.offsetWidth);
      const ny = clamp(startT + (p.clientY-startY), 0, window.innerHeight - el.offsetHeight);
      el.style.left = nx + 'px'; el.style.top = ny + 'px';
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
      const r = el.getBoundingClientRect();
      localStorage.setItem(storageKey, JSON.stringify({x:r.left, y:r.top}));
      if (moved) { el.dataset.justDragged = '1'; setTimeout(()=>delete el.dataset.justDragged,150); }
    };
    el.addEventListener('mousedown', onDown);
    el.addEventListener('touchstart', onDown, {passive:false});
  }

  function buildUI(previewEl) {
    // Gear
    const gear = document.createElement('div');
    gear.id = 'se-gear'; gear.textContent = '⚙️';
    document.body.appendChild(gear);
    makeDraggable(gear, UI_GEAR_KEY, () => ({ x: window.innerWidth - 70, y: window.innerHeight - 70 }));

    // Panel
    const panel = document.createElement('div'); panel.id = 'se-panel';
    panel.innerHTML = `
      <div id="se-header">
        <div>📚 Scribd Enhancer</div>
        <div class="controls">
          <div id="se-min" class="btn" title="Collapse">–</div>
          <div id="se-close" class="btn" title="Close">✕</div>
        </div>
      </div>
      <div id="se-body">
        <label><input type="checkbox" id="opt-unblur"> Unblur</label>
        <label><input type="checkbox" id="opt-autoscrape"> Auto Scrape</label>
        <label><input type="checkbox" id="opt-dark"> Dark Mode</label>

        <div class="row">
          <label style="flex:1"><input type="checkbox" id="opt-preview"> Show Preview</label>
          <button id="btn-toggle-preview" title="Quick hide/show (hotkey: P)">👁️ Toggle Preview</button>
        </div>

        <div class="row">
          <label style="flex:1">OCR
            <select id="opt-lang">
              <option value="auto">Auto</option>
              <option value="eng">English</option>
              <option value="spa">Spanish</option>
              <option value="fra">French</option>
              <option value="deu">German</option>
            </select>
          </label>
          <label style="flex:1">Split
            <select id="opt-split">
              <option value="0">Off</option>
              <option value="100">100</option>
              <option value="250">250</option>
              <option value="500">500</option>
            </select>
          </label>
        </div>

        <label>Export Page Range
          <input id="opt-range" type="text" placeholder="all | 1-25 | 5,7,10-12">
        </label>

        <div class="row">
          <label>Scale
            <select id="opt-scale">
              <option value="1">1x</option>
              <option value="2">2x</option>
              <option value="3">3x</option>
              <option value="4">4x</option>
            </select>
          </label>
          <label>JPEG
            <select id="opt-quality">
              <option value="0.8">0.80</option>
              <option value="0.92">0.92</option>
              <option value="1.0">1.00</option>
            </select>
          </label>
        </div>

        <label>Rich Export Preference
          <select id="opt-richpref">
            <option value="auto">Auto (prefer text layer if present)</option>
            <option value="preferText">Keep Text (remove page images)</option>
            <option value="preferImage">Keep Images (remove text layer)</option>
          </select>
        </label>

        <hr style="border-color:#333">

        <label>External Downloader URL
          <input id="opt-downloader" type="text" placeholder="https://scribd.vdownloaders.com/?url={url}">
        </label>
        <div class="row">
          <button id="btn-open-downloader">⬇️ Open Downloader</button>
          <button id="btn-copy-url" title="Copy current page URL">📋 Copy URL</button>
        </div>

        <button id="btn-scrape">📖 Scrape Pages (Text/OCR)</button>
        <button id="btn-export">💾 Export TXT</button>
        <button id="btn-html">🧾 Export Plain HTML</button>
        <button id="btn-print">🖨️ Print (Text)</button>
        <button id="btn-snapshot-pdf">📸 Export Snapshot PDF</button>
        <button id="btn-rich-html">🖼️ Export Rich HTML</button>
      </div>
    `;
    document.body.appendChild(panel);
    makeDraggable(panel, UI_MENU_KEY, () => ({ x: window.innerWidth - 360, y: window.innerHeight - 360 }));

    // Open/Close & collapse
    const togglePanel = () => {
      if (gear.dataset.justDragged) return;
      panel.style.display = (panel.style.display === 'none' || !panel.style.display) ? 'block' : 'none';
    };
    gear.addEventListener('click', togglePanel);
    panel.querySelector('#se-close').addEventListener('click', () => panel.style.display = 'none');

    const body = panel.querySelector('#se-body');
    let collapsed = false;
    panel.querySelector('#se-min').addEventListener('click', () => {
      collapsed = !collapsed;
      body.style.display = collapsed ? 'none' : 'block';
      panel.querySelector('#se-min').textContent = collapsed ? '+' : '–';
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'g') togglePanel();
      if (e.key.toLowerCase() === 'p') togglePreview(previewEl); // NEW hotkey
      if (e.key === 'Escape') panel.style.display = 'none';
    });

    // Bind controls
    const bind = (sel, prop, parser = v=>v) => {
      const el = panel.querySelector(sel);
      el.value = (prop in settings) ? settings[prop] : el.value;
      if (el.type === 'checkbox') el.checked = !!settings[prop];
      el.addEventListener('change', () => {
        settings[prop] = el.type === 'checkbox' ? el.checked : parser(el.value);
        saveSettings();
        applyDarkMode();
        if (prop === 'showPreview') {
          // If turned on, ensure preview exists and respects collapsed state
          if (settings.showPreview && !document.getElementById('se-preview')) {
            document.body.appendChild(previewEl);
          }
          previewEl.classList.toggle('collapsed', !settings.showPreview || settings.previewCollapsed);
        }
      });
      return el;
    };

    bind('#opt-unblur',   'unblur');
    bind('#opt-autoscrape','autoScrape');
    bind('#opt-dark',     'darkMode');
    bind('#opt-preview',  'showPreview');
    bind('#opt-lang',     'ocrLang');
    bind('#opt-split',    'splitEvery', v=>parseInt(v,10)||0);
    bind('#opt-range',    'pageRange',  v=>safe(v)||'all');
    bind('#opt-scale',    'snapshotScale', v=>clamp(parseInt(v,10)||2,1,4));
    bind('#opt-quality',  'snapshotQuality', v=>Number(v)||0.92);
    bind('#opt-richpref', 'richPref');
    bind('#opt-downloader','downloaderUrl', v=>safe(v).trim() || defaultSettings.downloaderUrl);

    // Actions
    panel.querySelector('#btn-toggle-preview').onclick = () => togglePreview(previewEl);

    panel.querySelector('#btn-open-downloader').onclick = () => {
      const srcUrl = location.href;
      const tpl = settings.downloaderUrl || defaultSettings.downloaderUrl;
      const target = tpl.includes('{url}')
        ? tpl.replace('{url}', encodeURIComponent(srcUrl))
        : (tpl.includes('?') ? `${tpl}&url=${encodeURIComponent(srcUrl)}` : `${tpl}?url=${encodeURIComponent(srcUrl)}`);
      window.open(target, '_blank', 'noopener');
      // best-effort clipboard for convenience
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(srcUrl).catch(()=>{});
    };
    panel.querySelector('#btn-copy-url').onclick = async () => {
      try { await navigator.clipboard.writeText(location.href); alert('✅ URL copied.'); }
      catch { prompt('Copy URL:', location.href); }
    };

    panel.querySelector('#btn-scrape').onclick = () => {
      const pages = getScribdPages();
      if (!pages.length) return alert('❌ No pages found.');
      if (settings.showPreview && !document.getElementById('se-preview')) document.body.appendChild(previewEl);
      previewEl.classList.remove('collapsed'); settings.previewCollapsed = false; saveSettings();
      scrapePages(pages, previewEl);
    };
    panel.querySelector('#btn-export').onclick = () => exportOutput(previewEl.querySelector('.content').textContent, 'txt');
    panel.querySelector('#btn-html').onclick   = () => exportOutput(`<html><body><pre>${previewEl.querySelector('.content').textContent}</pre></body></html>`, 'html');
    panel.querySelector('#btn-print').onclick  = () => printToPDF(previewEl.querySelector('.content').textContent);
    panel.querySelector('#btn-snapshot-pdf').onclick = async () => {
      const pages = getScribdPages();
      if (!pages.length) return alert('❌ No pages found.');
      try { await exportSnapshotPDF(pages); } catch (e) { console.error(e); alert('Snapshot export failed. Try Rich HTML.'); }
    };
    panel.querySelector('#btn-rich-html').onclick = async () => {
      const pages = getScribdPages();
      if (!pages.length) return alert('❌ No pages found.');
      try { await exportRichHTML(pages); } catch (e) { console.error(e); alert('Rich HTML export failed.'); }
    };

    return { gear, panel };
  }

  // Preview box (with quick-hide and drag memory)
  function createPreview() {
    const preview = document.createElement('div');
    preview.id = 'se-preview';
    preview.innerHTML = `
      <div class="bar">
        <div class="title">Preview</div>
        <div class="btns">
          <div class="btn" id="se-prev-clear" title="Clear">🧹</div>
          <div class="btn" id="se-prev-hide" title="Hide (hotkey: P)">👁️</div>
        </div>
      </div>
      <div class="content">[Preview Initialized]\n</div>
    `;
    // drag support (optional): keep it fixed but remember position
    makeDraggable(preview, UI_PREVIEW_POS, () => ({ x: window.innerWidth - 420, y: 12 }));

    if (settings.showPreview) document.body.appendChild(preview);
    preview.classList.toggle('collapsed', settings.previewCollapsed || !settings.showPreview);

    preview.querySelector('#se-prev-clear').addEventListener('click', () => {
      preview.querySelector('.content').textContent = '';
    });
    preview.querySelector('#se-prev-hide').addEventListener('click', () => {
      togglePreview(preview);
    });

    return preview;
  }

  function togglePreview(preview) {
    const willHide = !preview.classList.contains('collapsed') || !settings.showPreview;
    if (willHide) {
      preview.classList.add('collapsed');
      settings.previewCollapsed = true;
      settings.showPreview = false; // reflect in panel checkbox as well
    } else {
      preview.classList.remove('collapsed');
      settings.previewCollapsed = false;
      settings.showPreview = true;
      if (!document.getElementById('se-preview')) document.body.appendChild(preview);
    }
    saveSettings();
    // Sync panel checkbox if present
    const chk = document.querySelector('#opt-preview');
    if (chk) chk.checked = settings.showPreview;
  }

  // ---------- BOOT ----------
  applyDarkMode();
  unblurContent();
  const preview = createPreview();
  const { gear } = buildUI(preview);
  makeDraggable(gear, UI_GEAR_KEY, () => ({ x: window.innerWidth - 70, y: window.innerHeight - 70 }));

  // If we happen to be on scribd.vdownloaders.com and a ?url= param exists, try to assist
  (function assistOnDownloaderPage() {
    if (!/scribd\.vdownloaders\.com$/i.test(location.hostname)) return;
    const params = new URLSearchParams(location.search);
    const u = params.get('url');
    if (!u) return;
    // best effort: try to fill first URL-like input
    const candidate = document.querySelector('input[type="url"], input[name*="url" i], input[placeholder*="link" i], input[placeholder*="url" i]');
    if (candidate && !candidate.value) candidate.value = u;
  })();

  // Auto-scrape if desired
  if (settings.autoScrape) {
    const pages = getScribdPages();
    if (pages.length && settings.showPreview && !document.getElementById('se-preview')) document.body.appendChild(preview);
    if (pages.length) scrapePages(pages, preview);
  }
})();

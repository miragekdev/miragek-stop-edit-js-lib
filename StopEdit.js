/**
 * StopEdit - Content Protection Library
 * @author Godsent / Miragek
 * @version 2.1.0
 */
class StopEdit {
  static DEFAULTS = {
    selector: 'body',
    heartbeat: 100000,
    debug: false,
    whitelist: [],
    noCopy: false,
    customCopyText: null,
    noPrint: false,
    noScreenshot: false,
    autoBlur: false,
    clickLimit: 10,
    clickInterval: 3000,
    onBlocked: null,
    detectAdblock: false,
    onAdblockDetected: null,
    adblockRecheckDelay: 5000,
    selectionBackground: null,
    selectionTextColor: 'red',
    password: null,
  };

  constructor(options = {}) {
    this.cfg = { ...StopEdit.DEFAULTS, ...options };
    this._clicks = 0;
    this._clickTimeout = null;
    this._blocked = false;
    this._resetting = false;
    this._mutationTimeout = null;
    this._heartbeatInterval = null;
    this._adblockOverlay = null;
    this._adblockCheckInterval = null;
    this._originalContent = null;
    this._observer = null;
    this._whitelistMap = new Map();
    this._editableElements = new Set();
    this._protected = new Set();

    this.cfg.onBlocked = this.cfg.onBlocked || (() => alert('⚠ You are blocked from interacting due to excessive clicking.'));
    this.cfg.onAdblockDetected = this.cfg.onAdblockDetected || (() => this._defaultAdblockAlert());
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  init() {
    const ready = (fn) =>
      document.readyState === 'loading'
        ? document.addEventListener('DOMContentLoaded', fn)
        : fn();

    ready(() => {
      if (this.cfg.password && localStorage.getItem('stopedit_authenticated') !== 'true') {
        this._showLoginOverlay(() => this._boot());
      } else {
        this._boot();
      }
    });
  }

  disable() {
    this._observer?.disconnect();
    clearInterval(this._heartbeatInterval);
    clearInterval(this._adblockCheckInterval);
    this._adblockOverlay?.remove();
    this._adblockOverlay = null;
    this._log('Protection disabled.');
  }

  // ─── Boot ──────────────────────────────────────────────────────────────────

  _boot() {
    this._initProtections();
    if (this.cfg.detectAdblock) this._checkAdblock();
  }

  _initProtections() {
    const target = document.querySelector(this.cfg.selector);
    if (!target) return console.error(`StopEdit: Selector "${this.cfg.selector}" not found.`);

    this._disableDirectEditing(target);
    this._originalContent = this._cloneContent(target);
    this._storeWhitelistElements(target);
    this._startObserving(target);
    this._initImageProtection(target);

    if (this.cfg.heartbeat) this._startHeartbeat(target);

    this._addGlobalProtection(target);
    this._monitorClicks();
    this._applySelectionStyle();

    // Only hook copy/attribution when copying is allowed
    if (!this.cfg.noCopy) this._hookCopyEvent(target);

    if (this.cfg.noPrint)      this._initNoPrint();
    if (this.cfg.noCopy)       this._initNoCopy(target);
    if (this.cfg.autoBlur)     this._initAutoBlur();
    if (this.cfg.noScreenshot) this._initNoScreenshot();

    this._log('Initialized. Protecting:', this.cfg.selector);
  }

  // ─── Copy — allowed, with attribution ─────────────────────────────────────

  _hookCopyEvent(target) {
    // Block cut always — never remove content from the page
    document.addEventListener('cut', (e) => {
      const range = this._selectionRange();
      if (range && (target.contains(range.startContainer) || target.contains(range.endContainer)))
        e.preventDefault();
    });

    document.addEventListener('copy', (e) => {
      const sel = window.getSelection();
      if (!sel.rangeCount) return;
      const range = sel.getRangeAt(0);
      if (!target.contains(range.startContainer) && !target.contains(range.endContainer)) return;

      const notice = this.cfg.customCopyText || `Copied from ${window.location.href}`;

      // Plain text with notice
      e.clipboardData.setData('text/plain', `${sel.toString()}\n\n${notice}`);

      // HTML with notice appended
      const wrapper = document.createElement('div');
      wrapper.appendChild(range.cloneContents());
      const credit = document.createElement('p');
      credit.style.cssText = 'font-size:0.8em;color:#999;margin-top:8px;';
      credit.textContent = notice;
      wrapper.appendChild(credit);
      e.clipboardData.setData('text/html', wrapper.innerHTML);

      e.preventDefault();
    });
  }

  // ─── noCopy — block all selection and copying ──────────────────────────────

  _initNoCopy(target) {
    const sel = this.cfg.selector;

    // CSS: kill user-select on the whole target, restore it for whitelisted children
    const whitelistRestore = this.cfg.whitelist.length
      ? `${this.cfg.whitelist.map(w => `${sel} ${w}`).join(',')}{-webkit-user-select:text;user-select:text;}`
      : '';

    const style = document.createElement('style');
    style.textContent =
      `${sel},${sel} *{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;}` +
      whitelistRestore;
    document.head.appendChild(style);

    // Block selectstart except inside whitelisted elements
    target.addEventListener('selectstart', (e) => {
      if (!this._isWhitelisted(e.target)) e.preventDefault();
    }, true);

    // Block drag
    target.addEventListener('dragstart', (e) => {
      if (!this._isWhitelisted(e.target)) e.preventDefault();
    }, true);

    // Block right-click context menu on protected content
    target.addEventListener('contextmenu', (e) => {
      if (!this._isWhitelisted(e.target)) e.preventDefault();
    }, true);
  }

  // ─── Global Key Protection ─────────────────────────────────────────────────

  _addGlobalProtection(target) {
    document.addEventListener('keydown', (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;

      const k = e.key.toLowerCase();

      // Always block save & print
      if (k === 's' || k === 'p') { e.preventDefault(); return; }

      // When noCopy: block select-all, copy, cut
      if (this.cfg.noCopy && (k === 'a' || k === 'c' || k === 'x')) {
        // Only block if focus/selection is inside the protected target
        const active = document.activeElement;
        const inTarget = target.contains(active) || active === target;
        const selRange = this._selectionRange();
        const selInTarget = selRange && (target.contains(selRange.startContainer) || target.contains(selRange.endContainer));

        if (inTarget || selInTarget || k === 'a') {
          e.preventDefault();
        }
      }
    });

    document.addEventListener('contextmenu', (e) => {
      if (this._isProtected(e.target)) e.preventDefault();
    });
  }

  // ─── Print ─────────────────────────────────────────────────────────────────

  _initNoPrint() {
    const style = Object.assign(document.createElement('style'), {
      type: 'text/css', media: 'print',
      textContent: 'body{display:none!important;}',
    });
    document.head.appendChild(style);

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') e.preventDefault();
    });
  }

  // ─── Auto Blur ─────────────────────────────────────────────────────────────

  _initAutoBlur() {
    document.onmouseleave = () => this._applyBlur(true);
    document.onmouseenter = () => this._applyBlur(false);
    document.onblur = () => this._applyBlur(true);
  }

  _applyBlur(on) {
    const v = on ? 'blur(5px)' : 'blur(0)';
    document.body.style.cssText = `-webkit-filter:${v};filter:${v};`;
  }

  // ─── Screenshot ────────────────────────────────────────────────────────────

  _initNoScreenshot() {
    document.addEventListener('keyup', (e) => {
      if (e.key === 'PrintScreen') navigator.clipboard.writeText('');
    });
  }

  // ─── Click Rate Limiting ───────────────────────────────────────────────────

  _monitorClicks() {
    document.addEventListener('click', () => {
      if (this._blocked) { this.cfg.onBlocked(); return; }
      if (++this._clicks >= this.cfg.clickLimit) { this._blockUser(); return; }
      this._clickTimeout ??= setTimeout(() => {
        this._clicks = 0;
        this._clickTimeout = null;
      }, this.cfg.clickInterval);
    });
  }

  _blockUser() {
    this._blocked = true;
    document.body.style.overflow = 'hidden';
    const noScroll = (e) => e.preventDefault();
    document.addEventListener('wheel', noScroll, { passive: false });
    document.addEventListener('touchmove', noScroll, { passive: false });
    this.cfg.onBlocked();
  }

  // ─── Text Selection Style ──────────────────────────────────────────────────

  _applySelectionStyle() {
    const { selectionTextColor, selectionBackground, selector } = this.cfg;
    if (this.cfg.noCopy) return; // no point styling selection if it's blocked
    const style = document.createElement('style');
    style.textContent = `${selector} ::selection{color:${selectionTextColor};${selectionBackground ? `background:${selectionBackground};` : ''}}`;
    document.head.appendChild(style);
  }

  // ─── DOM Mutation / Heartbeat ──────────────────────────────────────────────

  _startObserving(target) {
    this._observer = new MutationObserver((mutations) => {
      this._log('Mutations detected', mutations);
      const affectsWhitelist = mutations.some((m) =>
        this.cfg.whitelist.some((sel) => m.target.matches?.(sel) || m.target.closest?.(sel))
      );
      if (!affectsWhitelist) {
        clearTimeout(this._mutationTimeout);
        this._mutationTimeout = setTimeout(() => this._resetIfChanged(target), 200);
      }
    });
    this._observer.observe(target, { childList: true, subtree: true, characterData: true });
  }

  _startHeartbeat(target) {
    clearInterval(this._heartbeatInterval);
    this._heartbeatInterval = setInterval(() => {
      this._log('Heartbeat check.');
      this._resetIfChanged(target);
    }, this.cfg.heartbeat);
  }

  _resetIfChanged(target) {
    if (this._resetting) return;
    this._resetting = true;
    this._observer.disconnect();

    const liveContent = new Map();
    this.cfg.whitelist.forEach((sel) =>
      target.querySelectorAll(sel).forEach((el, i) =>
        liveContent.set(`${sel}-${i}`, el.innerHTML)
      )
    );

    target.innerHTML = this._originalContent.innerHTML;

    this.cfg.whitelist.forEach((sel) => {
      target.querySelectorAll(`[data-whitelist-placeholder="${sel}"]`).forEach((ph, i) => {
        const saved = this._whitelistMap.get(`${sel}-${i}`);
        if (saved) {
          const el = saved.cloneNode(true);
          el.innerHTML = liveContent.get(`${sel}-${i}`) ?? el.innerHTML;
          ph.replaceWith(el);
        }
      });
    });

    this._initImageProtection(target);
    this._startObserving(target);
    this._resetting = false;
  }

  // ─── Whitelist Helpers ─────────────────────────────────────────────────────

  _disableDirectEditing(target) {
    target.querySelectorAll('[contenteditable="true"]').forEach((el) => {
      if (!this._isWhitelisted(el)) el.contentEditable = 'inherit';
      else this._editableElements.add(el);
    });
  }

  _storeWhitelistElements(target) {
    this.cfg.whitelist.forEach((sel) =>
      target.querySelectorAll(sel).forEach((el, i) => {
        const clone = el.cloneNode(true);
        clone.contentEditable = el.contentEditable;
        this._whitelistMap.set(`${sel}-${i}`, clone);
      })
    );
  }

  _cloneContent(target) {
    const clone = target.cloneNode(true);
    this.cfg.whitelist.forEach((sel) =>
      clone.querySelectorAll(sel).forEach((el) => {
        const ph = document.createElement('div');
        ph.dataset.whitelistPlaceholder = sel;
        el.replaceWith(ph);
      })
    );
    return clone;
  }

  _isWhitelisted(node) {
    return this.cfg.whitelist.some((sel) => node.matches?.(sel) || node.closest?.(sel));
  }

  // ─── Image Protection ──────────────────────────────────────────────────────

  _initImageProtection(target) {
    const labelled = Array.from(target.getElementsByTagName('img')).filter((img) =>
      img.hasAttribute('protected')
    );
    if (labelled.length) this._protectImages(labelled);

    new MutationObserver((mutations) =>
      mutations.forEach((m) =>
        m.addedNodes.forEach((n) => {
          if (n.nodeName === 'IMG' && n.hasAttribute('protected')) this._protectImages([n]);
        })
      )
    ).observe(target, { childList: true, subtree: true });
  }

  _protectImages(images) {
    images.forEach((img) => {
      if (!img.complete) img.addEventListener('load', () => this._applyImageProtection(img));
      else this._applyImageProtection(img);
    });
  }

  _applyImageProtection(img) {
    if (this._protected.has(img)) return;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 150;
    canvas.getContext('2d').drawImage(img, 0, 0, 150, 150);
    canvas.className = img.className;
    canvas.id = img.id;
    canvas.setAttribute('protected', '');
    canvas.style.cssText = getComputedStyle(img).cssText;
    canvas.style.width = canvas.style.height = '150px';
    ['contextmenu', 'dragstart', 'selectstart', 'copy', 'cut'].forEach((ev) =>
      canvas.addEventListener(ev, (e) => { e.preventDefault(); e.stopPropagation(); })
    );
    img.replaceWith(canvas);
    this._protected.add(canvas);
  }

  _isProtected(el) {
    return el.hasAttribute?.('protected') || this._protected.has(el);
  }

  // ─── Login Overlay ─────────────────────────────────────────────────────────

  _showLoginOverlay(callback) {
    const overlay = this._createElement('div', {
      position: 'fixed', inset: '0', background: 'white',
      zIndex: '9999', display: 'flex', justifyContent: 'center', alignItems: 'center',
    });
    overlay.innerHTML = `
      <form style="display:flex;flex-direction:column;gap:12px;padding:32px;background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.15);">
        <h2 style="margin:0;font-family:sans-serif;color:#1a5276;">🔐 Enter Password</h2>
        <input type="password" placeholder="Password (eg: 123)" style="padding:10px 14px;border:1px solid #ccc;border-radius:6px;font-size:1em;">
        <button type="submit" style="padding:10px;background:#3498db;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:1em;">Unlock</button>
        <p class="err" style="color:#e74c3c;margin:0;display:none;">Incorrect password</p>
      </form>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('form').addEventListener('submit', (e) => {
      e.preventDefault();
      const input = overlay.querySelector('input');
      if (input.value === this.cfg.password) {
        localStorage.setItem('stopedit_authenticated', 'true');
        overlay.remove();
        callback();
      } else {
        overlay.querySelector('.err').style.display = 'block';
        input.value = '';
        input.focus();
      }
    });
  }

  // ─── Adblock Detection ─────────────────────────────────────────────────────

  _checkAdblock() {
    const bait = Object.assign(document.createElement('div'), { className: 'ad-banner ads ad-unit' });
    Object.assign(bait.style, { position: 'absolute', top: '-9999px', width: '1px', height: '1px' });
    document.body.appendChild(bait);

    setTimeout(() => {
      const blocked = bait.offsetWidth === 0 || bait.offsetHeight === 0 || getComputedStyle(bait).display === 'none';
      bait.remove();
      if (blocked) {
        this._log('Adblocker detected.');
        this.cfg.onAdblockDetected();
        this._adblockCheckInterval = setInterval(() => {
          if (!this._adblockOverlay || !document.body.contains(this._adblockOverlay))
            this.cfg.onAdblockDetected();
        }, this.cfg.adblockRecheckDelay);
      } else {
        this._log('No adblocker.');
        clearInterval(this._adblockCheckInterval);
      }
    }, 100);
  }

  _defaultAdblockAlert() {
    if (this._adblockOverlay && document.body.contains(this._adblockOverlay)) return;
    this._adblockOverlay = this._createElement('div', {
      position: 'fixed', inset: '0', background: 'rgba(0,0,0,.85)',
      zIndex: '10000', display: 'flex', justifyContent: 'center', alignItems: 'center',
      fontFamily: 'sans-serif', color: '#fff', textAlign: 'center',
    });
    this._adblockOverlay.innerHTML = `
      <div style="background:#e74c3c;padding:28px 32px;border-radius:10px;max-width:480px;">
        <h2 style="margin:0 0 12px">🚫 Adblocker Detected</h2>
        <p>Please disable your adblocker to support this site.</p>
        <button style="background:#3498db;color:#fff;padding:10px 22px;border:none;border-radius:6px;cursor:pointer;margin-top:8px;">Try Again</button>
      </div>
    `;
    document.body.appendChild(this._adblockOverlay);
    this._adblockOverlay.querySelector('button').addEventListener('click', () => {
      this._adblockOverlay.remove();
      this._adblockOverlay = null;
    });
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  _selectionRange() {
    const sel = window.getSelection();
    return sel && sel.rangeCount ? sel.getRangeAt(0) : null;
  }

  _createElement(tag, styles = {}) {
    const el = document.createElement(tag);
    Object.assign(el.style, styles);
    return el;
  }

  _log(...args) {
    if (this.cfg.debug) console.log('StopEdit:', ...args);
  }
}
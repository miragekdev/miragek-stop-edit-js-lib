class StopEdit {
  constructor(options = {}) {
    this.selector = options.selector || 'body';
    this.heartbeat = options.heartbeat || 100000;
    this.debug = options.debug || false;
    this.whitelist = options.whitelist || [];
    this.noCopy = options.noCopy || false;
    this.customCopyText = options.customCopyText || null;
    this.noPrint = options.noPrint || false;
    this.noScreenshot = options.noScreenshot || false;
    this.autoBlur = options.autoBlur || false;
    this.clickLimit = options.clickLimit || 10;
    this.clickInterval = options.clickInterval || 3000;
    this.onBlocked = options.onBlocked || this.defaultBlockedAlert;
    this.detectAdblock = options.detectAdblock || false;
    this.onAdblockDetected = options.onAdblockDetected || this.defaultAdblockAlert;
    this.adblockRecheckDelay = options.adblockRecheckDelay || 5000; // Delay before re-showing overlay (ms)
    this.clicks = 0;
    this.clickTimeout = null;
    this.blocked = false;

    this.originalContent = null;
    this.observer = null;
    this.whitelistMap = new Map();
    this.resetting = false;
    this.mutationTimeout = null;
    this.heartbeatInterval = null;
    this.editableElements = new Set();
    this.protected = new Set();
    this.adblockOverlay = null; // Store overlay for re-showing
    this.adblockCheckInterval = null; // Interval for re-checking adblock

    // Selection customization
    this.selectionBackground = options.selectionBackground || null;
    this.selectionTextColor = options.selectionTextColor || 'red';

    // Lockout feature: Hardcoded password (configurable via options)
    this.password = options.password || 'default_password';
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      // Check authentication state
      if (this.password && localStorage.getItem('stopedit_authenticated') !== 'true') {
        this.showLoginOverlay(() => {
          this.initializeProtections();
          if (this.detectAdblock) this.checkAdblock();
        });
      } else {
        this.initializeProtections();
        if (this.detectAdblock) this.checkAdblock();
      }
    });
  }

  checkAdblock() {
    const bait = document.createElement('div');
    bait.setAttribute('class', 'ad-banner ads ad-unit');
    bait.style.position = 'absolute';
    bait.style.top = '-9999px';
    bait.style.width = '1px';
    bait.style.height = '1px';
    document.body.appendChild(bait);

    setTimeout(() => {
      const isBlocked = bait.offsetWidth === 0 || bait.offsetHeight === 0 || window.getComputedStyle(bait).display === 'none';
      document.body.removeChild(bait);

      if (isBlocked) {
        if (this.debug) console.log('StopEdit: Adblocker detected! Showing persistent overlay.');
        this.onAdblockDetected();
        // Start re-checking to ensure adblocker is still active
        this.adblockCheckInterval = setInterval(() => {
          if (!this.adblockOverlay || !document.body.contains(this.adblockOverlay)) {
            if (this.debug) console.log('StopEdit: Adblock overlay closed, re-showing after delay.');
            this.onAdblockDetected();
          }
        }, this.adblockRecheckDelay);
      } else {
        if (this.debug) console.log('StopEdit: No adblocker detected.');
        if (this.adblockCheckInterval) {
          clearInterval(this.adblockCheckInterval);
          this.adblockCheckInterval = null;
        }
      }
    }, 100);
  }

  defaultAdblockAlert() {
    if (this.adblockOverlay && document.body.contains(this.adblockOverlay)) {
      return; // Prevent multiple overlays
    }

    this.adblockOverlay = document.createElement('div');
    this.adblockOverlay.className = 'stopedit-adblock-overlay';
    this.adblockOverlay.style.position = 'fixed';
    this.adblockOverlay.style.top = '0';
    this.adblockOverlay.style.left = '0';
    this.adblockOverlay.style.width = '100%';
    this.adblockOverlay.style.height = '100%';
    this.adblockOverlay.style.background = 'rgba(0, 0, 0, 0.85)';
    this.adblockOverlay.style.zIndex = '10000';
    this.adblockOverlay.style.display = 'flex';
    this.adblockOverlay.style.justifyContent = 'center';
    this.adblockOverlay.style.alignItems = 'center';
    this.adblockOverlay.style.color = '#fff';
    this.adblockOverlay.style.fontFamily = 'Arial, sans-serif';
    this.adblockOverlay.style.textAlign = 'center';

    this.adblockOverlay.innerHTML = `
      <div style="background: #e74c3c; padding: 20px; border-radius: 8px; max-width: 500px;">
        <h2>🚫 Adblocker Detected! 😭</h2>
        <p>Please disable your adblocker to support this site. Ads keep us running! 💸</p>
        <p>Click below to try again, but we’ll keep asking until you do! 😜</p>
        <button class="stopedit-adblock-close" style="background: #3498db; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px;">Try Again</button>
      </div>
    `;

    document.body.appendChild(this.adblockOverlay);

    const closeButton = this.adblockOverlay.querySelector('.stopedit-adblock-close');
    closeButton.addEventListener('click', () => {
      if (this.debug) console.log('StopEdit: Adblock overlay closed by user.');
      document.body.removeChild(this.adblockOverlay);
      this.adblockOverlay = null;
      // Overlay will reappear due to adblockCheckInterval
    });
  }

  initializeProtections() {
    const target = document.querySelector(this.selector);
    if (!target) {
      console.error(`StopEdit: Selector "${this.selector}" not found.`);
      return;
    }

    this.disableDirectEditing(target);
    this.originalContent = this.cloneContent(target);
    this.storeWhitelistElements(target);
    this.startObserving(target);
    this.initializeImageProtection(target);

    if (this.heartbeat) {
      this.startHeartbeat(target);
    }

    if (this.debug) {
      console.log('StopEdit initialized: Protecting', this.selector);
    }

    this.addGlobalProtection();

    if (this.noCopy || this.noPrint || this.noScreenshot || this.autoBlur) {
      this.initializeNoPrintFeatures();
    }

    this.monitorClicks();

    // Apply text selection style
    this.applySelectionStyle();

    // Add copyright feature for copying
    document.addEventListener('copy', (event) => {
      let selection = window.getSelection();
      if (selection.rangeCount > 0) {
        let range = selection.getRangeAt(0);
        if (target.contains(range.startContainer) || target.contains(range.endContainer)) {
          if (this.noCopy) {
            event.preventDefault();
          } else {
            let clonedSelection = range.cloneContents();
            let div = document.createElement('div');
            div.appendChild(clonedSelection);
            let html = div.innerHTML;
            let selectedText = selection.toString();
            let copyrightNotice = this.customCopyText || `Copied from ${window.location.href}`;
            let textToCopy = `${selectedText}\n\n${copyrightNotice}`;
            event.clipboardData.setData('text/plain', textToCopy);
            event.clipboardData.setData('text/html', html);
            event.preventDefault();
          }
        }
      }
    });
  }

  showLoginOverlay(callback) {
    const overlay = document.createElement('div');
    overlay.className = 'stopedit-login-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'white';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';

    const form = document.createElement('form');
    form.className = 'stopedit-login-form';
    form.innerHTML = `
      <input type="password" class="stopedit-login-input" placeholder="Enter password">
      <button type="submit" class="stopedit-login-button">Login</button>
    `;

    overlay.appendChild(form);
    document.body.appendChild(overlay);

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = form.querySelector('.stopedit-login-input');
      if (input.value === this.password) {
        localStorage.setItem('stopedit_authenticated', 'true');
        document.body.removeChild(overlay);
        callback();
      } else {
        alert('Incorrect password');
      }
    });
  }

  applySelectionStyle() {
    let style = document.createElement('style');
    style.innerHTML = `
      ${this.selector} ::selection {
        color: ${this.selectionTextColor};
        ${this.selectionBackground ? `background: ${this.selectionBackground};` : ''}
      }
    `;
    document.head.appendChild(style);
  }

  monitorClicks() {
    document.addEventListener('click', () => {
      if (this.blocked) {
        this.onBlocked();
        return;
      }

      this.clicks++;

      if (this.clicks >= this.clickLimit) {
        this.blockUser();
        return;
      }

      if (!this.clickTimeout) {
        this.clickTimeout = setTimeout(() => {
          this.clicks = 0;
          this.clickTimeout = null;
        }, this.clickInterval);
      }
    });
  }

  blockUser() {
    this.blocked = true;
    this.disableScrolling();
    this.onBlocked();
  }

  disableScrolling() {
    document.body.style.overflow = 'hidden';
    document.addEventListener(
      'wheel',
      (e) => e.preventDefault(),
      { passive: false }
    );
    document.addEventListener(
      'touchmove',
      (e) => e.preventDefault(),
      { passive: false }
    );
  }

  defaultBlockedAlert() {
    alert('⚠ You are blocked from interacting due to excessive clicking.');
  }

  initializeNoPrintFeatures() {
    if (this.noCopy) {
      document.body.oncopy = () => false;
      document.body.oncontextmenu = () => false;
      document.body.onselectstart = document.body.ondrag = () => false;
    }

    if (this.noPrint) {
      const printBlockerStyle = document.createElement('style');
      printBlockerStyle.type = 'text/css';
      printBlockerStyle.media = 'print';
      printBlockerStyle.innerHTML = 'body { display: none !important; }';
      document.head.appendChild(printBlockerStyle);

      document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'p') {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      });
    }

    if (this.autoBlur) {
      document.onmouseleave = () => this.applyBlur(true);
      document.onmouseenter = () => this.applyBlur(false);
      document.onblur = () => this.applyBlur(true);
    }

    if (this.noScreenshot) {
      document.addEventListener('keyup', (e) => {
        if (e.key === 'PrintScreen') {
          navigator.clipboard.writeText('');
        }
      });
    }

    const noSelectStyle = document.createElement('style');
    noSelectStyle.type = 'text/css';
    noSelectStyle.innerHTML =
      'div, body {-webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;}';
    document.head.appendChild(noSelectStyle);
  }

  applyBlur(shouldBlur) {
    const blurValue = shouldBlur ? 'blur(5px)' : 'blur(0px)';
    document.body.style.cssText = `-webkit-filter: ${blurValue}; -moz-filter: ${blurValue}; -ms-filter: ${blurValue}; -o-filter: ${blurValue}; filter: ${blurValue};`;
  }

  addGlobalProtection() {
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) &&
          (e.key === 'c' || e.key === 'C' ||
           e.key === 'x' || e.key === 'X' ||
           e.key === 's' || e.key === 'S' ||
           e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        return false;
      }
    });

    document.addEventListener('contextmenu', (e) => {
      if (this.isProtected(e.target)) {
        e.preventDefault();
        return false;
      }
    });
  }

  initializeImageProtection(target) {
    const protectedImages = this.getLabelledImages(target);
    if (protectedImages.length > 0) {
      this.protect(protectedImages);
    }

    this.observeNewImages(target);
  }

  observeNewImages(target) {
    const imageObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'IMG' && node.hasAttribute('protected')) {
            this.protect([node]);
          }
        });
      });
    });

    imageObserver.observe(target, {
      childList: true,
      subtree: true
    });
  }

  getLabelledImages(target) {
    return Array.from(target.getElementsByTagName('img'))
      .filter(img => img.hasAttribute('protected'));
  }

  protect(images) {
    images.forEach(img => {
      try {
        if (!img.complete) {
          img.addEventListener('load', () => this.applyImageProtection(img));
        } else {
          this.applyImageProtection(img);
        }
      } catch (error) {
        if (this.debug) {
          console.error('Failed to protect image:', error);
        }
      }
    });
  }

  applyImageProtection(img) {
    if (this.protected.has(img)) return;

    const canvas = document.createElement('canvas');
    const width = 150;
    const height = 150;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);

    canvas.className = img.className;
    canvas.id = img.id;
    canvas.setAttribute('protected', '');
    canvas.style.cssText = window.getComputedStyle(img).cssText;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    this.addProtectionEvents(canvas);
    img.parentNode.insertBefore(canvas, img);
    img.remove();
    this.protected.add(canvas);
  }

  addProtectionEvents(element) {
    const events = ['contextmenu', 'dragstart', 'selectstart', 'copy', 'cut'];
    events.forEach(event => {
      element.addEventListener(event, this.preventDefaultEvent);
    });
  }

  preventDefaultEvent(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  isProtected(element) {
    return element.hasAttribute('protected') || this.protected.has(element);
  }

  startHeartbeat(target) {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.debug) {
        console.log('StopEdit: Heartbeat check.');
      }
      this.resetIfChanged(target);
    }, this.heartbeat);
  }

  disableDirectEditing(target) {
    const allEditableElements = target.querySelectorAll('[contenteditable="true"]');
    allEditableElements.forEach(el => {
      if (!this.isWhitelisted(el)) {
        el.contentEditable = "inherit";
      } else {
        this.editableElements.add(el);
      }
    });
  }

  storeWhitelistElements(target) {
    this.whitelist.forEach(selector => {
      const elements = target.querySelectorAll(selector);
      elements.forEach((el, index) => {
        const key = `${selector}-${index}`;
        const clone = el.cloneNode(true);
        clone.contentEditable = el.contentEditable;
        this.whitelistMap.set(key, clone);
      });
    });
  }

  cloneContent(target) {
    const clone = target.cloneNode(true);
    this.whitelist.forEach(selector => {
      const elements = clone.querySelectorAll(selector);
      elements.forEach(el => {
        const placeholder = document.createElement('div');
        placeholder.dataset.whitelistPlaceholder = selector;
        el.parentNode.replaceChild(placeholder, el);
      });
    });
    return clone;
  }

  startObserving(target) {
    this.observer = new MutationObserver(mutations => {
      if (this.debug) {
        console.log('StopEdit: Detected mutations', mutations);
      }

      const affectsWhitelist = mutations.some(mutation => {
        return this.whitelist.some(selector => {
          return mutation.target.matches?.(selector) ||
                 mutation.target.closest?.(selector);
        });
      });

      if (!affectsWhitelist) {
        clearTimeout(this.mutationTimeout);
        this.mutationTimeout = setTimeout(() => this.resetIfChanged(target), 200);
      }
    });

    this.observer.observe(target, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: false,
    });
  }

  resetIfChanged(target) {
    if (this.resetting) return;

    this.resetting = true;
    this.observer.disconnect();

    const whitelistContent = new Map();
    this.whitelist.forEach(selector => {
      const elements = target.querySelectorAll(selector);
      elements.forEach((el, index) => {
        whitelistContent.set(`${selector}-${index}`, el.innerHTML);
      });
    });

    target.innerHTML = this.originalContent.innerHTML;

    this.whitelist.forEach(selector => {
      const placeholders = target.querySelectorAll(`[data-whitelist-placeholder="${selector}"]`);
      placeholders.forEach((placeholder, index) => {
        const key = `${selector}-${index}`;
        const savedElement = this.whitelistMap.get(key);
        if (savedElement) {
          const restored = savedElement.cloneNode(true);
          restored.innerHTML = whitelistContent.get(key) || restored.innerHTML;
          placeholder.parentNode.replaceChild(restored, placeholder);
        }
      });
    });

    this.initializeImageProtection(target);
    this.startObserving(target);
    this.resetting = false;
  }

  isWhitelisted(node) {
    return this.whitelist.some(selector => {
      return node.matches?.(selector) || node.closest?.(selector);
    });
  }

  disable() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.adblockCheckInterval) {
      clearInterval(this.adblockCheckInterval);
    }
    if (this.adblockOverlay) {
      document.body.removeChild(this.adblockOverlay);
      this.adblockOverlay = null;
    }
    if (this.debug) {
      console.log('StopEdit: Protection disabled.');
    }
  }
}
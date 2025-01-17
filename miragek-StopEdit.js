class StopEdit {
  constructor(options = {}) {
    this.selector = options.selector || 'body';
    this.heartbeat = options.heartbeat || 100000;
    this.debug = options.debug || false;
    this.whitelist = options.whitelist || [];
    this.noCopy = options.noCopy || false;
    this.noPrint = options.noPrint || false;
    this.noScreenshot = options.noScreenshot || false;
    this.autoBlur = options.autoBlur || false;
    this.originalContent = null;
    this.observer = null;
    this.whitelistMap = new Map();
    this.resetting = false;
    this.mutationTimeout = null;
    this.heartbeatInterval = null;
    this.editableElements = new Set();
    this.protected = new Set();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
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

      // Add NoPrint.js features
      if (this.noCopy || this.noPrint || this.noScreenshot || this.autoBlur) {
        this.initializeNoPrintFeatures();
      }
    });
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
    // Prevent common keyboard shortcuts
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

    // Prevent right-click on protected elements
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

    // Watch for dynamically added images
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

    // Use specified dimensions for consistent sizing
    const width = 150; // Desired width
    const height = 150; // Desired height
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');

    // Apply smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw image scaled to the specified dimensions
    ctx.drawImage(img, 0, 0, width, height);

    // Preserve original image attributes
    canvas.className = img.className;
    canvas.id = img.id;
    canvas.setAttribute('protected', '');

    // Apply the same inline styles as the original image
    canvas.style.cssText = window.getComputedStyle(img).cssText;

    // Override size-specific styles to ensure proper dimensions
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Add protection (e.g., disable interaction or prevent saving)
    this.addProtectionEvents(canvas);

    // Replace original image
    img.parentNode.insertBefore(canvas, img);
    img.remove();

    // Mark as protected
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
    // Remove contenteditable from non-whitelisted elements
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

            // Preserve the original contentEditable state from the HTML
            clone.contentEditable = el.contentEditable;

            this.whitelistMap.set(key, clone);
        });
    });
}


  cloneContent(target) {
    const clone = target.cloneNode(true);
    
    // Remove whitelisted elements from the clone
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

      // Check if mutations affect whitelisted elements
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

    // Store current whitelist content
    const whitelistContent = new Map();
    this.whitelist.forEach(selector => {
      const elements = target.querySelectorAll(selector);
      elements.forEach((el, index) => {
        whitelistContent.set(`${selector}-${index}`, el.innerHTML);
      });
    });

    // Reset to original content
    target.innerHTML = this.originalContent.innerHTML;

    // Restore whitelist elements with their current content
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

    // Reapply image protection after reset
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
    if (this.debug) {
      console.log('StopEdit: Protection disabled.');
    }
  }
}
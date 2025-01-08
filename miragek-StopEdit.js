class StopEdit {
    constructor(options = {}) {
      this.selector = options.selector || 'body'; // Default to protecting the entire <body>
      this.heartbeat = options.heartbeat || 1000; // Default check interval
      this.debug = options.debug || false; // Debugging mode
      this.originalContent = null; // Store the original content
      this.observer = null;
    }
  
    // Initialize the library
    init() {
      const target = document.querySelector(this.selector);
      if (!target) {
        console.error(`StopEdit: Selector "${this.selector}" not found.`);
        return;
      }
  
      // Store the original content as a clone
      this.originalContent = target.cloneNode(true);
  
      // Debug logging
      if (this.debug) {
        console.log('StopEdit initialized: Protecting', this.selector);
      }
  
      // Start observing changes
      this.startObserving(target);
    }
  
    // Start the MutationObserver
    startObserving(target) {
      this.observer = new MutationObserver((mutations) => {
        if (this.debug) {
          console.log('StopEdit: Detected mutations', mutations);
        }
  
        // Check for any changes and reset the DOM if needed
        this.resetIfChanged(target);
      });
  
      this.observer.observe(target, {
        childList: true,
        attributes: true,
        subtree: true,
        characterData: true,
      });
  
      // Periodic heartbeat (if enabled)
      if (this.heartbeat) {
        setInterval(() => this.resetIfChanged(target), this.heartbeat);
      }
    }
  
    // Reset the DOM if changes are detected
    resetIfChanged(target) {
      const currentHTML = target.innerHTML;
      const originalHTML = this.originalContent.innerHTML;
  
      if (currentHTML !== originalHTML) {
        if (this.debug) {
          console.warn('StopEdit: Changes detected! Resetting content.');
        }
        target.innerHTML = originalHTML; // Reset to the original content
      }
    }
  
    // Disable the guard
    disable() {
      if (this.observer) {
        this.observer.disconnect();
      }
      if (this.debug) {
        console.log('StopEdit: Protection disabled.');
      }
    }
  }
  
  // usage

  // <script src="js/miragek-StopEdit.js"></script>

  // <script>
  //   const guard = new StopEdit({
  //     selector: 'body',  // Protect the entire page (default)
  //     heartbeat: 1000,   // Check every second
  //     debug: true        // Enable debug logs
  //   });
  
  //   guard.init();
  // </script>
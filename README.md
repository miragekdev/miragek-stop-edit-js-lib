# StopEdit - JavaScript Library to Prevent Page Edits 🛡️

**StopEdit** is a lightweight JavaScript library designed to protect your webpage from unauthorized edits. It monitors the DOM for changes and resets any modifications back to the original state. Say goodbye to tricksters using "Inspect Element" or "View Page Source" to mess with your content! 🚫👀

---

## 📚 Table of Contents
1. [Features](#features)  
2. [Installation](#installation)  
3. [Usage](#usage)  
4. [Basic HTML Example](#basic-html-example)  
5. [Options](#options)  
6. [How It Works](#how-it-works)  
7. [Changelog](#changelog)  
8. [To-Do List](#to-do-list)  
9. [Contributing](#contributing)  
10. [License](#license)  
11. [Author](#author)  

---

## ✨ Features

- **Protect your page or specific elements**: Choose to safeguard the entire page or selected parts (default is `<body>`).  
- **Automatic reset**: Detects and reverses any unauthorized changes.  
- **Customizable heartbeat**: Periodically checks for edits to ensure integrity.  
- **Debugging support**: Logs actions and changes in the console for troubleshooting.  

---

## ⚙️ Installation

Download the `StopEdit.js` file and include it in your HTML page:

```html
<script src="path/to/StopEdit.js"></script>
```

---

## 🛠️ Usage

### Initialize StopEdit
To protect your content, include the script and initialize the library with your desired options.  

```html
<script>
  const guard = new StopEdit({
    selector: 'body',  // Protects the entire page by default
    heartbeat: 1000,   // Checks every second
    debug: true        // Enable debugging mode
  });

  guard.init();  // Start monitoring
</script>
```

---

## 🧩 Basic HTML Example

Here’s a complete example of how to use StopEdit in an HTML page:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StopEdit Example</title>
</head>
<body>
  <h1>Protected Content</h1>
  <p>This content cannot be edited. Try modifying it, and it will reset automatically.</p>

  <!-- Include the StopEdit library -->
  <script src="path/to/StopEdit.js"></script>
  <script>
    // Initialize StopEdit
    const guard = new StopEdit({
      selector: 'body',  // Protects everything inside the body tag
      heartbeat: 1000,   // Checks every second
      debug: true        // Logs actions in the console
    });

    guard.init();  // Start monitoring
  </script>
</body>
</html>
```

---

## 🔧 Options

- `selector` *(default: `'body'`)*: Specify a CSS selector for the element(s) to protect.  
- `heartbeat` *(default: `1000` ms)*: Frequency (in milliseconds) for checking DOM integrity.  
- `debug` *(default: `false`)*: Enable console logs for debugging.

---

## 🔍 How It Works

1. **Original Content Storage**: Clones and stores the original content when initialized.  
2. **Real-Time Monitoring**: Uses `MutationObserver` to detect DOM changes instantly.  
3. **Periodic Check** *(optional)*: Heartbeat checks reinforce content protection over time.  

---

## 📜 Changelog

### [Unreleased]
- In development... 🛠️  

---

### [1.1.0] - Initial Release 🎉
- Added core StopEdit functionality.  
- Updated README documentation.  

---

## 📝 To-Do List

### Features in Progress 🚀
- [x] Test on more browsers 🌐  
- [ ] Hide image URLs 🔒  
- [ ] Prevent code theft completely 🔍  
- [ ] Disable content copying 📄  

### Upcoming Enhancements 🔧
- [ ] Server-side integration with PHP and Node.js.  
- [ ] Host comprehensive docs on Miragek with sandbox examples.  

---

## 🤝 Contributing

We love contributions! Whether you’re fixing bugs, adding features, or improving documentation, your help is appreciated. Here’s how to contribute:

1. **Fork the repo**: [Click here](https://github.com/miragekdev/miragek-stop-edit-js-lib) and fork it! 🍴  
2. **Clone your fork**:  
   ```bash
   git clone https://github.com/YOUR_USERNAME/miragek-stop-edit-js-lib.git
   ```
3. **Create a branch**:  
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes** and commit them:  
   ```bash
   git add .
   git commit -m "Add: Describe your changes"
   ```
5. **Push your changes**:  
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Open a Pull Request (PR)**: Go to the [main repo](https://github.com/miragekdev/miragek-stop-edit-js-lib) and submit your PR.  

---

### Contribution Guidelines
- Write clear and concise commit messages.  
- Follow the existing coding style and conventions.  
- Test your changes thoroughly.  

Feel free to ask questions by opening an issue or starting a discussion! 💬  

---

## 📄 License

StopEdit is open-source and licensed under the MIT License. See the `LICENSE` file for details.  

---

## 👤 Author

**Created by Godsent for Miragek**  

---

## 🚀 Final Notes

StopEdit is a simple yet powerful tool to protect your content. It's lightweight, customizable, and perfect for securing your pages from meddling hands. If you have feedback, ideas, or questions, don't hesitate to reach out! 🎉


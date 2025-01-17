---
>-
  1. [Features](#features) 2. [Installation](#installation) 3. [Usage](#usage)
  4. [Example](#example) 5. [Options](#options) 6. [How It Works](#how-it-works)
  7. [Changelog](#changelog) 8. [To-Do List](#to-do-list) 9.
  [Contributing](#contributing) 10. [License](#license) 11. [Author](#author)
---

# StopEdit - A Lightweight JavaScript Library to Protect Your Page 🛡️

StopEdit is a simple JavaScript library designed to keep your webpage safe from unwanted changes. It actively monitors your page for edits and resets everything back to its original state. Whether it's someone tampering with "Inspect Element" or trying to edit your content directly, StopEdit has you covered.

## ✨ Features

- **Customizable Protection**: Guard your entire page or just specific elements (default: `<body>`).
- **Automatic Reversion**: Detects unauthorized changes and immediately reverts them.
- **Heartbeat Monitoring**: Periodic checks to ensure content integrity.
- **Debugging Tools**: Enables detailed logging in the console for easy debugging.

--------------------------------------------------------------------------------

## ⚙️ Installation

To install StopEdit, simply download the `StopEdit.js` file and include it in your HTML file:

```html
<script src="path/to/StopEdit.js"></script>
```

--------------------------------------------------------------------------------

## 🛠️ Usage

Here's how you can set it up:

### Core Feature

```html
<script>
  const guard = new StopEdit({
    selector: 'body',  // Protect the entire page by default
    heartbeat: 1000,   // Checks every second
    debug: true        // Logs actions in the console
  });

  guard.init();  // Start monitoring
</script>
```

### Image protection

```html
<img src="example.jpg" alt="anything" class="anyclass" protected>
```

--------------------------------------------------------------------------------

## 🧩 Example

Here's a complete example to get you started:

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
  <p>This text is protected. Any changes made to it will be automatically undone.</p>

  <div class="container">
      <h2>Protected Text</h2>
      <div id="editable-section" class="editable" contenteditable="true">
          This section is editable! Feel free to type here. 🤦‍♂️
      </div>
      <div id="editable-section" class="" contenteditable="true">
          This section is editable! Feel free to type here ✍️
      </div>
  </div>

  <div class="container">
      <h2>Protected Text</h2>
      <div id="editable-section" class="editable" contenteditable="false">
          This section is editable! Feel free to type here but only via inspect element 🔴
      </div>
      <div id="editable-section" class="" contenteditable="false">
          This section is editable! Feel free to type here but only via inspect element 😎
      </div>
  </div>

  <div class="container">
      <h2>Protected Text</h2>
      <div id="editable-section" class="editable">
          This section is not editable! Why? because we did not add the editable-section id😃
      </div>
      <!-- the contenteditable="true will be ignored below -->
      <div id="" class="" contenteditable="true">
          This section is not editable! Why? because we did not add the editable-section id ✍️
      </div>
  </div>

<!-- protected img -->
<img src="example.jpg" alt="anything" class="anything" protected>
<br>
<!-- unprotected img -->
<img src="example.jpg" alt="anything" class="anything">


  <!-- Include the StopEdit library -->
  <script src="path/to/StopEdit.js"></script>
  <script>
    const guard = new StopEdit({
      selector: 'body',  
      heartbeat: 1000,   
      debug: true        
    });

    guard.init(); 
  </script>
</body>
</html>
```

Please refer to the example.html for more complete examples with code snippets you can edit and play with to better understand the library. Please do this before you drop any hate speech. Say no to cyber bully. This lib/plugin is made by a PHP developer 😂. But feel safe and free to take it serious.

--------------------------------------------------------------------------------

## 🔧 Options

- **`selector`** _(default: `'body'`)_: Target specific elements for protection.
- **`heartbeat`** _(default: `1000` ms)_: Set the interval (in milliseconds) for monitoring changes.
- **`debug`** _(default: `false`)_: Turn on logging to track actions in the console.

--------------------------------------------------------------------------------

## 🔍 How It Works

1. **Content Backup**: When initialized, StopEdit saves a copy of the original content.
2. **Live Monitoring**: It uses `MutationObserver` to track real-time changes.
3. **Regular Checks**: Optional heartbeat checks provide an added layer of security.

--------------------------------------------------------------------------------

## 📜 Changelog

### [Unreleased]

- Video protection
- Print blocker
- Adblock detect
- Device Blocker
- Prevent Copy
- Block suspected dangerous users
- Lock page with password

### [1.2.0] - Current ✌

- Image protection
- Readme doc updated

### [1.1.0] - Initial Release 🎉

- Core functionality for monitoring and resetting content.
- Documentation added.

--------------------------------------------------------------------------------

## 📝 To-Do List

### Current Progress 🚀

- [x] Browser compatibility testing.
- [x] Improved protection for image URLs.
- [ ] Enhanced anti-theft measures for code.
- [ ] Prevent copying of page content.

### Future Enhancements 🔧

- [ ] Server-side integration (PHP, Node.js).
- [ ] Detailed online documentation with examples.

--------------------------------------------------------------------------------

## 🤝 Contributing

We welcome contributions! Whether it's fixing a bug, adding new features, or improving the documentation, your input is valuable. Here's how to contribute:

1. **Fork the repository**: [Visit the repo here](https://github.com/miragekdev/miragek-stop-edit-js-lib).
2. **Clone your fork**:

  ```bash
  git clone https://github.com/YOUR_USERNAME/miragek-stop-edit-js-lib.git
  ```

3. **Create a branch**:

  ```bash
  git checkout -b feature/your-feature-name
  ```

4. **Make your changes and commit**:

  ```bash
  git add .
  git commit -m "Description of your changes"
  ```

5. **Push your changes**:

  ```bash
  git push origin feature/your-feature-name
  ```

6. **Submit a Pull Request**: Open a PR in the main repository.

--------------------------------------------------------------------------------

### Guidelines

- Ensure your changes are well-tested.
- Keep your commit messages clear and concise.
- Follow the repository's coding standards.

Have questions? Feel free to open an issue or start a discussion!

--------------------------------------------------------------------------------

## 📄 License

StopEdit is licensed under the MIT License. See the `LICENSE` file for more details.

--------------------------------------------------------------------------------

## 👤 Author

**Created by Godsent for Miragek**

--------------------------------------------------------------------------------

## 🚀 Final Notes

StopEdit is a straightforward solution to protect your webpage content. It's lightweight, easy to set up, and highly effective. If you have suggestions, questions, or feedback, don't hesitate to get in touch!

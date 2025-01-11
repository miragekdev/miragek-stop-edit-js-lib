# StopEdit - JavaScript Library to Prevent Page Edits

StopEdit is a lightweight JavaScript library that prevents users from modifying the content of your webpage. It monitors changes to the DOM and resets any modifications back to the original state. Perfect for protecting text and elements from unwanted edits! So, trickers will not be able to change texts or anything on your website by using `inspact elelemnt or view page code`

## Features

- **Protects entire page or specific elements**: You can choose which part of your page to protect from truckers who use inpect elelemnt to modify and redesign your website just before your eyes live. (default is the `<body>`).
- **Automatic reset**: If any changes are made, the library automatically resets the content to its original state.
- **Customizable heartbeat**: Periodic checks to ensure content remains unedited.
- **Debugging support**: Optional debugging mode to log actions and mutations.

## Installation

Simply download the `StopEdit.js` file and include it in your HTML page.

```html
<script src="path/to/StopEdit.js"></script>
```

## Usage

1. **Include the Script**: Add the `StopEdit` JavaScript file to your HTML.

    ```html
    <script src="js/StopEdit.js"></script>
    ```

2. **Initialize StopEdit**: Create a new instance of `StopEdit` and configure it with your desired options.

    ```html
    <script>
      const guard = new StopEdit({
        selector: 'body',  // Protect the entire page (default)
        heartbeat: 1000,   // Check every second
        debug: true        // Enable debug logs (optional)
      });

      guard.init();  // Initialize the library
    </script>
    ```

## Options

- `selector` (optional): A CSS selector for the element to protect. Default is `'body'`.
- `heartbeat` (optional): Time interval in milliseconds (default: `1000ms`). This determines how often the DOM will be checked for changes.
- `debug` (optional): Enable debugging mode to log changes to the console. Default is `false`.

## Example

### Protect the Entire Page

This will protect everything inside the `<body>` tag from being edited:

```html
<script>
  const guard = new StopEdit({
    selector: 'body',  // Protect the entire page
    heartbeat: 1000,   // Check every second
    debug: true        // Enable debug logs
  });

  guard.init();  // Initialize StopEdit
</script>
```

### Protect a Specific Element

You can also protect a specific element by using a CSS selector.

```html
<script>
  const guard = new StopEdit({
    selector: '#protected',  // Protect only the element with ID "protected"
    heartbeat: 1000,         // Check every second
    debug: true              // Enable debug logs
  });

  guard.init();  // Initialize StopEdit
</script>
```

## How It Works

1. **Clone and Store Original Content**: When `init()` is called, StopEdit stores a clone of the original content for comparison.
2. **MutationObserver**: It uses a `MutationObserver` to monitor the DOM for changes. If any modifications are detected, the content is automatically reset.
3. **Heartbeat**: If enabled, StopEdit checks the content periodically (e.g., every second) to ensure it remains unaltered.

## Methods

### `init()`
Initializes the library and starts protecting the specified element.

### `disable()`
Disables the protection and stops monitoring changes.

## Example HTML Structure

Here's an example of a full HTML page using `StopEdit`:

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
  <p>This content cannot be edited. Try modifying it, and it will reset.</p>

  <script src="path/to/StopEdit.js"></script>
  <script>
    const guard = new StopEdit({
      selector: 'body',  // Protect the entire page
      heartbeat: 1000,   // Check every second
      debug: true        // Enable debug logs
    });

    guard.init();  // Initialize StopEdit
  </script>
</body>
</html>
```

# 📜 Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]
- We are cooking 🛠️

---

## [1.1.0] - initial release
### 🚀 Added
- StopEdit Core features
- Updated Readme (doc)

---

## 📝 Current To-Do List

Here are the main tasks and features we’re working on to make this project even better:

### 🚀 Features in Progress
- [x] Test on more browsers 👀
- [ ] Hide image urls 🔐
- [ ] Completely hide web code from thiefs 🔍
- [ ] Disable content copying 📬

### 🛠 Upcomming
- [ ] Integrate with PHP and NodeJs (serverside) to make it nearly impossible to bypass ⚙️
- [ ] Create a more proper doc hosted in miragek with more code examples and test sandbox 📦

---

Here's an updated **Contributing** section for your README that integrates your GitHub URL! 🎉 This structure will make it easy for people to contribute while staying professional and user-friendly.

---

### Contributing

```markdown
## 🤝 Contributing

We welcome contributions from everyone! Whether it’s fixing a bug, adding a feature, or improving documentation, your help is appreciated. Follow these steps to get started:

### How to Contribute
1. **Fork the repository**  
   Click the `Fork` button at the top-right corner of the [repo](https://github.com/miragekdev/miragek-stop-edit-js-lib). 🍴

2. **Clone your fork**  
   Use the following command to clone the fork to your local machine:  
   ```bash
   git clone https://github.com/YOUR_USERNAME/miragek-stop-edit-js-lib.git
   ```

3. **Create a branch**  
   Make sure to create a branch for your changes:  
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes**  
   Implement your feature or fix, then stage and commit the changes:  
   ```bash
   git add .
   git commit -m "Add: Short description of your changes"
   ```

5. **Push your changes**  
   Push your branch to your forked repository:  
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Submit a Pull Request (PR)**  
   Go to the [original repository](https://github.com/miragekdev/miragek-stop-edit-js-lib) and open a Pull Request from your forked repository.  
   - Ensure your PR clearly describes the purpose of your changes.  
   - Add relevant details about the problem or feature for context.  

---

### Code Guidelines
To maintain code quality, please follow these guidelines:
- Use meaningful commit messages 📝.
- Write clear and concise comments where necessary ✍️.
- Ensure the code passes linting and tests (if available) ✅.
- Follow the existing code style and conventions ⚡.

---

### Feedback and Questions
If you have any questions about contributing or need help, feel free to open an issue [here](https://github.com/miragekdev/miragek-stop-edit-js-lib/issues) or start a discussion. We’re here to help! 💬

---

Thank you for contributing and helping make this project better! 🎉

Let me know if you'd like to add anything else, such as example contribution workflows or testing instructions! 😄

## License

StopEdit is open-source and available under the MIT License.


## Author

Created by Godsent for Miragek

## Final Notes

StopEdit is a simple and effective tool for preventing page edits. It’s lightweight, easy to use, and highly customizable for your needs. If you have any questions or feedback, don’t hesitate to reach out!


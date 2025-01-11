# StopEdit - JavaScript Library to Prevent Page Edits

StopEdit is a lightweight JavaScript library that prevents users from modifying the content of your webpage. It monitors changes to the DOM and resets any modifications back to the original state. Perfect for protecting text and elements from unwanted edits! So, trickers will not be able to change texts or anything on your website by using '*inspact elelemnt or view page code*'

## Features

- **Protects entire page or specific elements**: You can choose which part of your page to protect using a CSS selector (default is the `<body>`).
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

## License

StopEdit is open-source and available under the MIT License.

## Contributing

Feel free to contribute! Open a pull request or create an issue if you have suggestions or bug fixes.

## Author

Created by Godsent for Miragek

## Final Notes

StopEdit is a simple and effective tool for preventing page edits. It’s lightweight, easy to use, and highly customizable for your needs. If you have any questions or feedback, don’t hesitate to reach out!


# StopEdit - A Lightweight JavaScript Library to Protect Your Page 🛡️

StopEdit is a simple JavaScript library designed to keep your webpage safe from unwanted changes. It actively monitors your page for edits and resets everything back to its original state. Whether it's someone tampering with "Inspect Element" or trying to edit your content directly, StopEdit has you covered.

## ✨ Features

- **Customizable Protection**: Lock down the whole page or just specific elements (default: `<body>`).
- **Automatic Reversion**: Detects and reverts unauthorized changes in real-time using `MutationObserver`.
- **Heartbeat Monitoring**: Periodic checks to ensure your content stays pristine.
- **Click Monitoring**: Blocks users who click too fast (looking at you, script kiddies).
- **Copy Protection**: Disable copying or slap a custom copyright notice on copied text.
- **Print Protection**: Stops users from printing your page.
- **Screenshot Prevention**: Experimental feature to block screenshots (not foolproof, but we try!).
- **Auto Blur**: Blurs the page when users leave to keep prying eyes at bay.
- **Image Protection**: Converts protected images to canvas to block easy downloads.
- **Password Protection**: Locks the page behind a password for extra security.
- **Custom Text Selection**: Style selected text with custom colors for that extra flair.
- **Whitelist Support**: Exempt specific elements from protection for user-friendly interactions.
- **Debugging Tools**: Detailed console logs to help you debug like a pro.

--------------------------------------------------------------------------------

## 🔰 Basic Explanation

A lot of people are asking me, "Godsent! What have you got up there again? We don't understand it". And most times, I just tell them, "Go read the description again."

So, what actually is this my lib about? The shortest anser is that, "It let you stop bad guys from editing anything in your live website by manipulating the frontend. Some bad guys can add extra CSS, HTML, JS, etc and even make themselves or their names verified in your site to trick unsuspecting people.

So, how did i fix a lot of problems by kicking thousands of potential attackers or bad guys away? I created STOPEDIT which by the end of this season would be able to do a lot of things. For now, the To-Do would keep you posted on what has been done. So, what is the motivation?

Here’s the deal:
- Stops frontend tampering via "Inspect Element" or dev tools.
- Protects images from being downloaded or having their URLs exposed.
- Blocks content scraping by nosy aliens trying to steal your awesome site.
- Locks down suspicious activities like excessive clicking or unauthorized edits.
- Disables copying, adds watermarks, prevents printing, and more.
- Lets you whitelist elements you *want* users to interact with.

Motivation? Keep your site yours. Let the bad guys build their own and exploit that instead. 😎🔥

--------------------------------------------------------------------------------

## ⚙️ Installation

Grab StopEdit and plug it into your project:

### Using CDN (Coming Soon)
```html
<script src="./scripts/stopeditor.min.js"></script>
```

### Local Installation
1. Download `StopEdit.js` from the [releases page](https://github.com/miragekdev/miragek-stop-edit-js-lib/releases).
2. Include it in your HTML:
```html
<script src="path/to/StopEdit.js"></script>
```

--------------------------------------------------------------------------------

## 🛠️ Usage

Setting up StopEdit is as easy as roasting a script kiddie. Here’s how to get started:

### Core Feature
Protect your page with a simple setup:

```javascript
const guard = new StopEdit({
  selector: 'body', // Protect the entire body
  heartbeat: 60000, // Check for changes every 60 seconds
  debug: true, // Log everything for debugging
  noCopy: true, // Block copying
  noPrint: true, // Block printing
  noScreenshot: true, // Try to block screenshots
});
guard.init(); // Start the protection
```

### Image Protection
Mark images as protected to prevent downloads or right-clicks:

```html
<img src="example.jpg" alt="My Image" protected>
```

### Password Protection
Enable a password to lock the page until authenticated:

```javascript
const guard = new StopEdit({
  selector: '#protected-content',
  password: 'superSecret123'
});
guard.init(); // Shows a login overlay until the correct password is entered
```

--------------------------------------------------------------------------------

## 🧩 Example

Here’s a full example to see StopEdit in action:

```html
<!DOCTYPE html>
<head>
  <title>StopEdit Example</title>
</head>
<body>
  <h1>Protected Content</h1>
  <p>This text is locked down. Try editing it—StopEdit will reset it!</p>

  <div class="container">
    <h2>Editable Section</h2>
    <div id="editable-section" class="editable" contenteditable="true">
      This section is whitelisted! Type away. ✍️
    </div>
    <div id="protected-section" contenteditable="false">
      This section is locked. Try editing via Inspect Element—good luck! 🔴
    </div>
  </div>

  <div class="container">
    <h2>Image Protection</h2>
    <img src="example.jpg" alt="Protected Image" protected>
    <img src="example2.jpg" alt="Unprotected Image">
  </div>

  <!-- Include the StopEdit library -->
  <script src="path/to/StopEdit.js"></script>
  <script>
    const guard = new StopEdit({
      selector: 'body',
      heartbeat: 1000,
      debug: true,
      noCopy: true,
      whitelist: ['#editable-section'],
      password: 'mySecretPass123',
      clickLimit: 5,
      clickInterval: 2000,
      onBlocked: () => alert('Chill out, too many clicks! 😭'),
      selectionBackground: 'yellow'
    });
    guard.init();
  </script>
</body>
</html>
```

Check out `example.html` in the repo for more snippets to play with. Test it before you roast it—say no to cyberbullying! This lib is crafted by a PHP dev (yours truly 😂), but it’s serious about protecting your site. Backend features are coming to make it 100% bulletproof. Tell those hackers to go build their own site! 💀🔥

--------------------------------------------------------------------------------

## 🔧 Options

### JavaScript Options
| Option                | Type     | Default                 | Description                                                                 |
|-----------------------|----------|-------------------------|-----------------------------------------------------------------------------|
| `selector`            | String   | `'body'`                | CSS selector for protected elements.                                        |
| `heartbeat`           | Number   | `100000`                | Interval (ms) for content change checks. Set to `0` to disable.             |
| `debug`               | Boolean  | `false`                 | Enable console logs for debugging.                                          |
| `whitelist`           | Array    | `[]`                    | CSS selectors for elements exempt from protection.                          |
| `noCopy`              | Boolean  | `false`                 | Prevent copying of content.                                                 |
| `customCopyText`      | String   | `null`                  | Custom text appended to copied content.                                     |
| `noPrint`             | Boolean  | `false`                 | Prevent printing of the page.                                               |
| `noScreenshot`        | Boolean  | `false`                 | Attempt to block screenshots (experimental).                                |
| `autoBlur`            | Boolean  | `false`                 | Blur content when the user leaves the page.                                 |
| `clickLimit`          | Number   | `10`                    | Max clicks allowed within `clickInterval`.                                  |
| `clickInterval`       | Number   | `3000`                  | Time window (ms) for counting clicks.                                       |
| `onBlocked`           | Function | `defaultBlockedAlert`   | Callback when user is blocked due to excessive clicking.                    |
| `selectionBackground` | String   | `null`                  | Background color for selected text.                                         |

| `detectAdblock` | Boolean   | `false`                  | Prevent people with adblockers.                                        |


| `selectionTextColor`  | String   | `'red'`                 | Text color for selected text.                                              |
| `password`            | String   | `'default_password'`    | Password for accessing protected content.                                   |

### HTML Attributes
| Attribute            | Default | Description                                                                 |
|----------------------|---------|-----------------------------------------------------------------------------|
| `contenteditable`    | `true`  | Allow live editing if whitelisted. Example: `<div contenteditable="true">`   |
| `protected`          | `false` | Protect images from downloads/right-clicks. Example: `<img protected>`       |

--------------------------------------------------------------------------------

## 🔍 How It Works

1. **Content Backup**: StopEdit saves a snapshot of your original content on initialization.
2. **Live Monitoring**: Uses `MutationObserver` to catch DOM changes in real-time.
3. **Heartbeat Checks**: Optional periodic scans to ensure nothing slips through.
4. **Click Tracking**: Monitors clicks to block rapid-fire interactions.
5. **Protection Layers**: Disables copying, printing, and right-clicks; protects images; and adds a password overlay if set.
6. **Text Styling**: Customizes selected text appearance for a polished look.

--------------------------------------------------------------------------------

## 📜 Changelog

### [Unreleased]
- Video protection
- Device blocking
- Enhanced anti-copy measures
- Suspicious user detection
- Server-side integration (PHP, Node.js)

## [1.5.0] Latest
- Adblock detection
- Lib slightly improved
- Documentation readme updated
- Example html updated

### [1.4.0]
- Added click monitoring to block excessive interactions.
- Introduced password protection with a login overlay.
- Added custom text selection styling (`selectionBackground`, `selectionTextColor`).
- Improved copy protection with custom copyright text.

### [1.3.0]
- Added `noCopy`, `noPrint`, `noScreenshot`, and `autoBlur` features.
- Enhanced image protection with canvas conversion.

### [1.2.0]
- Added image protection for `<img protected>`.
- Updated README with better examples.

### [1.1.0] - Initial Release 🎉
- Core functionality for monitoring and resetting content.
- Basic documentation added.

--------------------------------------------------------------------------------

## 📝 To-Do List

### Current Progress 🚀
- [ ] Enhanced anti-theft measures for code.
- [ ] Advanced anti-copy protections.

### Future Enhancements 🔧
- [ ] Server-side integration (PHP, Node.js) for backend validation.
- [ ] Detailed online documentation with interactive examples.
- [ ] Video protection for embedded media.

--------------------------------------------------------------------------------

## 🤝 Contributing

We love contributions! Got a bug fix, new feature, or docs improvement? Jump in:

1. **Fork the repo**: [miragek-stop-edit-js-lib](https://github.com/miragekdev/miragek-stop-edit-js-lib).
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/miragek-stop-edit-js-lib.git
   ```
3. **Create a branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Commit changes**:
   ```bash
   git add .
   git commit -m "Added my awesome feature"
   ```
5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Submit a Pull Request**: Open a PR in the main repo.

### Guidelines
- Test your changes thoroughly.
- Keep commit messages clear and descriptive.
- Follow the repo’s coding style (no messy code, please!).

Questions? Open an issue or start a discussion. Let’s build something epic! 🔥

--------------------------------------------------------------------------------

## 📄 License

StopEdit is licensed under the MIT License. See the `LICENSE` file for details.

--------------------------------------------------------------------------------

## 👤 Author

**Created by Godsent for Miragek**

Built with 💀 and a sprinkle of PHP dev chaos. 😭😂

--------------------------------------------------------------------------------

## 🚀 Final Notes

StopEdit is your lightweight, no-nonsense shield against frontend tampering. It’s easy to set up, packs a punch, and keeps your site safe from those pesky dev tool abusers. Got ideas or feedback? Hit me up on GitHub. Let’s keep the web safe and the fire burning! 🔥💀
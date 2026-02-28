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

## Features

| Feature | Option | Default |
|---|---|---|
| Block text selection & copy | `noCopy` | `false` |
| Copy with attribution watermark | `customCopyText` | URL of page |
| Block printing | `noPrint` | `false` |
| Blur on mouse leave | `autoBlur` | `false` |
| Block PrintScreen | `noScreenshot` | `false` |
| DOM mutation revert | `heartbeat` | `100000` ms |
| Click rate limiting | `clickLimit` | `10` |
| Adblock detection | `detectAdblock` | `false` |
| Password gate | `password` | `null` |
| Image canvas protection | `protected` attr on `<img>` | — |
| Whitelisted editable zones | `whitelist` | `[]` |

---

## Installation

Drop the script into your page. No npm, no build step.

```html
<script src="StopEdit.js"></script>
```

---

## Quick Start

```js
const protection = new StopEdit({
  selector: '#my-content',
  noCopy: true,
  noPrint: true,
});
protection.init();
```

---

## Options

### `selector` · `string` · default `'body'`
CSS selector for the element to protect. Use a specific ID for precision — avoid `:first-of-type` / `:last-of-type` which resolve by tag, not class.

```js
selector: '#article-body'
```

---

### `noCopy` · `boolean` · default `false`
When `true`, disables all text selection and copying inside the protected element — mouse drag, Ctrl+A, Ctrl+C, and right-click are all blocked.

When `false`, copy is permitted but a copyright notice is appended to the clipboard in both `text/plain` and `text/html` formats.

```js
noCopy: true
```

---

### `customCopyText` · `string | null` · default `null`
The attribution string appended when `noCopy: false`. Defaults to the current page URL.

```js
customCopyText: 'Copied from My Site — https://example.com'
```

---

### `whitelist` · `string[]` · default `[]`
CSS selectors for child elements that should remain editable and selectable even when `noCopy: true`. The matching elements are also restored after any DOM mutation revert.

```js
whitelist: ['#comment-box', '.user-input']
```

---

### `noPrint` · `boolean` · default `false`
Intercepts Ctrl+P and injects a print stylesheet that hides `body`, preventing the page from printing.

```js
noPrint: true
```

---

### `autoBlur` · `boolean` · default `false`
Applies a `blur(5px)` CSS filter to `body` when the cursor leaves the browser window or the page loses focus. Clears on re-entry.

```js
autoBlur: true
```

---

### `noScreenshot` · `boolean` · default `false`
Clears the clipboard immediately after the PrintScreen key is released, nullifying most screenshot-to-clipboard workflows.

```js
noScreenshot: true
```

---

### `heartbeat` · `number` · default `100000` (ms)
Interval in milliseconds at which StopEdit checks for DOM mutations and reverts any unauthorised changes. Set to `0` to disable.

```js
heartbeat: 5000   // check every 5 seconds
```

---

### `clickLimit` · `number` · default `10`  
### `clickInterval` · `number` · default `3000` (ms)
If the user clicks more than `clickLimit` times within `clickInterval` milliseconds, they are blocked from further interaction. Triggers `onBlocked`.

```js
clickLimit: 5,
clickInterval: 2000,
```

---

### `onBlocked` · `function`
Callback fired when the click limit is exceeded. Defaults to a plain `alert`.

```js
onBlocked: () => showToast('Too many clicks — slow down!')
```

---

### `detectAdblock` · `boolean` · default `false`
Injects a hidden bait element on boot. If an adblocker hides it, `onAdblockDetected` is called. The check re-runs every `adblockRecheckDelay` ms to re-show the overlay if dismissed.

```js
detectAdblock: true,
adblockRecheckDelay: 5000,
```

---

### `onAdblockDetected` · `function`
Callback fired when an adblocker is detected. Defaults to a full-screen overlay with a "Try Again" button.

```js
onAdblockDetected: () => document.getElementById('adblock-banner').style.display = 'block'
```

---

### `password` · `string | null` · default `null`
When set, shows a full-screen password overlay on load. The correct password is stored in `localStorage` so returning visitors are not re-prompted. Clear `localStorage.removeItem('stopedit_authenticated')` to force re-authentication.

```js
password: 'mysecret'
```

---

### `selectionBackground` · `string | null`  
### `selectionTextColor` · `string` · default `'red'`
Styles the `::selection` pseudo-element within the protected selector. Only applied when `noCopy: false` (pointless to style a selection that can't be made).

```js
selectionBackground: 'yellow',
selectionTextColor: 'green',
```

---

## Image Protection

Add the `protected` attribute to any `<img>` inside the protected selector. StopEdit replaces it with a `<canvas>` at load time, blocking right-click save, drag-and-drop, and clipboard copy.

```html
<img src="photo.jpg" alt="My photo" protected>
```

New protected images added dynamically are detected automatically via a `MutationObserver`.

---

## Multiple Zones

You can run multiple independent StopEdit instances on the same page, each targeting a different element with different settings.

```js
// Zone A — fully locked
new StopEdit({ selector: '#locked', noCopy: true }).init();

// Zone B — copyable with watermark
new StopEdit({ selector: '#article', noCopy: false, customCopyText: '© My Site' }).init();
```

> **Note:** Use IDs for selectors when targeting specific elements. Class-based pseudo-selectors like `:first-of-type` match by tag, not class, and may silently fail to resolve.

---

## Public API

```js
const guard = new StopEdit({ selector: '#content' });

guard.init();      // Start protection
guard.disable();   // Stop all observers, intervals, and remove overlays
```

---

## Browser Support

All modern browsers. No polyfills required. Uses `MutationObserver`, `canvas`, `navigator.clipboard`, and CSS `user-select`.

---

## License

MIT — built by Godsent for [Miragek](https://miragek.com).
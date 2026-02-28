# StopEdit 🛡️

A lightweight, zero-dependency JavaScript library designed to keep your webpage safe from unwanted frontend tampering. StopEdit actively monitors your page for edits and resets everything back to its original state. Whether it's someone messing with Inspect Element, trying to scrape your content, or just being a general menace — StopEdit has you covered.

---

## ✨ Features

- **Customizable Protection** — Lock down the whole page or just specific elements.
- **Automatic Reversion** — Detects and reverts unauthorised changes in real-time using `MutationObserver`.
- **Heartbeat Monitoring** — Periodic checks to ensure your content stays pristine.
- **Click Monitoring** — Blocks users who click too fast (looking at you, script kiddies).
- **Copy Protection** — Disable copying entirely, or slap a custom copyright notice on copied text (both plain text and HTML).
- **Print Protection** — Stops users from printing your page.
- **Screenshot Prevention** — Experimental feature to clear the clipboard after PrintScreen.
- **Auto Blur** — Blurs the page when users leave to keep prying eyes at bay.
- **Image Protection** — Converts protected images to canvas to block right-click saves and drag-and-drop.
- **Password Protection** — Locks the page behind a password for extra security.
- **Custom Text Selection** — Style selected text with custom colours.
- **Whitelist Support** — Exempt specific elements from protection for user-friendly interactions.
- **Adblock Detection** — Show an overlay when an adblocker is detected.
- **Global Instance + Per-page Override** — Set defaults once in a shared file, override only what changes per page.

---

## 🔰 What is this?

A lot of people ask: *"What does this actually do?"*

Short answer: it stops bad guys from editing your live website by manipulating the frontend. Some bad guys use Inspect Element to add extra CSS, HTML, or JS — making themselves look verified on your site to trick unsuspecting visitors.

StopEdit fights back by:
- Stopping frontend tampering via Inspect Element and dev tools.
- Protecting images from being downloaded or having their URLs exposed.
- Blocking content scraping by nosy aliens trying to steal your awesome site.
- Locking down suspicious activity like excessive clicking or unauthorised edits.
- Disabling copying, adding watermarks, preventing printing, and more.
- Letting you whitelist elements you *want* users to interact with.

Motivation? Keep your site yours. Let the bad guys build their own. 😎🔥

---

## ⚙️ Installation

No npm. No build step. Just drop it in.

### CDN *(Coming Soon)*
```html
<script src="./scripts/stopedit.min.js"></script>
```

### Local
1. Download `miragek-StopEdit.js` from the [releases page](https://github.com/miragekdev/miragek-stop-edit-js-lib/releases).
2. Include it in your HTML:
```html
<script src="path/to/miragek-StopEdit.js"></script>
```

---

## 🚀 Quick Start

```js
const protection = new StopEdit({
  selector: '#app',
  noCopy: true,
  noPrint: true,
});
protection.init();
```

---

## 📋 Options Reference

| Option | Type | Default | Description |
|---|---|---|---|
| `selector` | `string` | `'body'` | Element to protect |
| `noCopy` | `boolean` | `false` | Block all selection and copying |
| `customCopyText` | `string\|null` | `null` | Watermark appended on copy |
| `whitelist` | `string[]` | `[]` | Selectors exempt from protection |
| `lockDOM` | `boolean` | `false` | Enable mutation observer + heartbeat revert |
| `heartbeat` | `number` | `100000` | Revert check interval in ms (`0` to disable) |
| `noPrint` | `boolean` | `false` | Block printing |
| `autoBlur` | `boolean` | `false` | Blur page on mouse leave |
| `noScreenshot` | `boolean` | `false` | Clear clipboard after PrintScreen |
| `clickLimit` | `number` | `10` | Max clicks before user is blocked |
| `clickInterval` | `number` | `3000` | Window in ms for click counting |
| `onBlocked` | `function` | `alert` | Callback when click limit is hit |
| `detectAdblock` | `boolean` | `false` | Detect and respond to adblockers |
| `adblockRecheckDelay` | `number` | `5000` | Ms between adblock rechecks |
| `onAdblockDetected` | `function` | overlay | Callback when adblocker is found |
| `password` | `string\|null` | `null` | Password gate on page load |
| `selectionBackground` | `string\|null` | `null` | `::selection` background colour |
| `selectionTextColor` | `string` | `'red'` | `::selection` text colour |

---

## 🔧 Options Detail

### `selector` · `string` · default `'body'`
CSS selector for the element to protect. Always use a stable ID.

```js
selector: '#app'
```

> ⚠️ **Avoid using `body` as your selector when `lockDOM: true`.** StopEdit snapshots the target's `innerHTML` on init. Transient elements that live on `body` — preloaders, toasts, modals — get baked into that snapshot. When they remove themselves, the heartbeat sees a diff and restores them, causing them to reappear forever.
>
> **Fix:** wrap your actual page content in a stable container and target that.
>
> ```html
> <!-- ✅ Do this -->
> <main id="app"> ... page content ... </main>
> <script>
>   new StopEdit({ selector: '#app', lockDOM: true }).init();
> </script>
> ```
>
> ```html
> <!-- ❌ Not this -->
> <script>
>   new StopEdit({ selector: 'body', lockDOM: true }).init();
> </script>
> ```

---

### `lockDOM` · `boolean` · default `false`
When `true`, enables the mutation observer and heartbeat — any DOM change outside a whitelisted element is detected and reverted. This is the core tamper-protection feature.

When `false`, only copy/key/blur protections are active. Your own JavaScript can freely modify the DOM without being reverted.

```js
lockDOM: true   // full tamper protection
lockDOM: false  // protection without DOM revert (safe for dynamic pages)
```

> If your page runs JavaScript that modifies the DOM after load (rendering tables, charts, dynamic content), use `lockDOM: false` or add those elements to `whitelist`.

---

### `noCopy` · `boolean` · default `false`
When `true`, disables all text selection and copying — mouse drag, Ctrl+A, Ctrl+C, and right-click are all blocked.

When `false`, copying is allowed but a copyright notice is appended to the clipboard in both `text/plain` and `text/html` formats.

```js
noCopy: true
```

---

### `customCopyText` · `string | null` · default `null`
The attribution string appended to the clipboard when `noCopy: false`. Defaults to the current page URL.

```js
customCopyText: 'Copied from My Site — https://example.com'
```

---

### `whitelist` · `string[]` · default `[]`
CSS selectors for child elements that stay editable and selectable even when `noCopy: true`. Whitelisted elements are also excluded from DOM revert when `lockDOM: true`.

```js
whitelist: ['#comment-box', '#search-input']
```

---

### `heartbeat` · `number` · default `100000` (ms)
How often (in ms) StopEdit checks for DOM drift and reverts it. Only active when `lockDOM: true`. Set to `0` to disable periodic checks (mutations are still caught in real-time by the observer).

```js
heartbeat: 5000   // check every 5 seconds
```

---

### `noPrint` · `boolean` · default `false`
Intercepts Ctrl+P and injects a print stylesheet that hides `body`.

```js
noPrint: true
```

---

### `autoBlur` · `boolean` · default `false`
Applies `blur(5px)` to `body` when the cursor leaves the browser window or the tab loses focus. Clears on re-entry.

```js
autoBlur: true
```

---

### `noScreenshot` · `boolean` · default `false`
Clears the clipboard immediately after the PrintScreen key is released.

```js
noScreenshot: true
```

---

### `clickLimit` · `number` · default `10` / `clickInterval` · `number` · default `3000`
If a user exceeds `clickLimit` clicks within `clickInterval` milliseconds, they are blocked and `onBlocked` is fired.

```js
clickLimit: 5,
clickInterval: 2000,
```

---

### `onBlocked` · `function`
Callback fired when the click limit is exceeded.

```js
onBlocked: () => showToast('Too many clicks — slow down!')
```

---

### `detectAdblock` · `boolean` · default `false`
Injects a hidden bait element. If an adblocker hides it, `onAdblockDetected` fires. Rechecks every `adblockRecheckDelay` ms.

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
Shows a full-screen password overlay on load. Auth state is stored in `localStorage` so returning visitors aren't re-prompted. To force re-auth: `localStorage.removeItem('stopedit_authenticated')`.

```js
password: 'mysecret'
```

---

### `selectionBackground` · `string | null` / `selectionTextColor` · `string` · default `'red'`
Styles the `::selection` pseudo-element. Only applied when `noCopy: false`.

```js
selectionBackground: 'yellow',
selectionTextColor: 'green',
```

---

## 🖼️ Image Protection

Add the `protected` attribute to any `<img>` inside the protected element. StopEdit silently replaces it with a `<canvas>` at load time — right-click save, drag-and-drop, and clipboard copy are all blocked.

```html
<img src="photo.jpg" alt="My photo" protected>
```

Dynamically added protected images are picked up automatically.

---

## 🌐 Multiple Zones

Run independent instances on the same page, each with different settings.

```js
// Fully locked zone
new StopEdit({ selector: '#docs', noCopy: true, lockDOM: true }).init();

// Copyable zone with watermark
new StopEdit({ selector: '#article', noCopy: false, customCopyText: '© My Site' }).init();
```

---

## 🔁 Global Instance + Per-page Override

Set your defaults once (e.g. in a shared preloader file) and call `configure()` on individual pages to override only what needs to change. Options are **merged** — you don't need to repeat everything.

**Shared file (e.g. `preloader.php`):**
```js
window._stopEdit = new StopEdit({
  selector: '#app',
  noCopy: true,
  noPrint: true,
  autoBlur: true,
  detectAdblock: true,
  lockDOM: true,
});
window._stopEdit.init();
```

**Per-page override:**
```js
// Disable DOM revert on this page (has dynamic content)
window._stopEdit.configure({ lockDOM: false });

// Add a new whitelisted element — existing whitelist entries are kept
window._stopEdit.configure({ lockDOM: false, whitelist: ['#data-table'] });
```

> `configure()` tears down the current protection, deep-merges the new options (whitelist arrays are **unioned**, not replaced), then re-initialises.

---

## 📡 Public API

```js
const guard = new StopEdit({ selector: '#app' });

guard.init();                    // Start protection
guard.disable();                 // Stop all observers, intervals, remove overlays
guard.configure({ lockDOM: false }); // Merge new options and restart
```

---

## 🌍 Browser Support

All modern browsers. No polyfills required. Uses `MutationObserver`, `canvas`, `navigator.clipboard`, and CSS `user-select`.

---

## 📄 License

MIT — built by Godsent for [Miragek](https://miragek.com).
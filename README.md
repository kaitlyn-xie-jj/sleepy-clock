# Sleepy Clock 💤

A tiny expressive new-tab clock that gets sleepy at bedtime, cheers you on in the morning, and wakes up if you gently poke its face. No backend, analytics, network requests, or dependencies.

## Live preview

The clock also runs as a normal webpage, so you can try it without installing the extension. Once GitHub Pages is enabled for this repository, open [the live demo](https://kaitlyn-xie-jj.github.io/sleepy-clock/). The clock uses your local time; the online preview does not replace your new tab.

## Install

1. Open `chrome://extensions`, then enable **Developer mode**.
2. Click **Load unpacked**, then choose the repository folder.
3. Open a new tab.

## Play

- **Wake the clock:** click its face, or focus it with Tab and press Enter / Space. At bedtime it perks up for three seconds, then goes back to sleep.
- **Switch time format:** click the **24-hour clock** / **12-hour clock** button. The preference is stored locally in your browser.
- **Watch it change moods:** daytime (07:00–17:59), evening (18:00–22:59), and bedtime (23:00–06:59) use your local time.
- If your system prefers reduced motion, decorative animations are disabled.

## Test

Requires Node.js 22+ and no installation step:

```sh
npm run check
npm test
```

Five dependency-free tests cover time boundaries, 12/24-hour formatting, preference persistence, temporary wake state, reduced motion, and keyboard-focus markup. GitHub Actions runs checks on every push and pull request. The browser UI was also smoke-tested with headless Chromium; the `chrome://newtab` extension override itself is not yet covered by automated installation testing.

MIT License.

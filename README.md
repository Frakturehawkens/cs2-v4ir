> ### 🌐 **[Open the tool →](https://frakturehawkens.github.io/cs2-v4ir/)**

---

# CS2 V4ir

A web tool for collecting CS2 crosshairs you actually use, decoding share codes (both old and new formats), and packing them into a single ready-to-use `.cfg` with Numpad 1–9 binds for instant switching in-game.

## What it does

- **Decode** — paste one or more share codes and get the full parameter list. Supports:
  - **New format** — `CS…` codes from the October 2026 CS2 update, including outline color, scope dot scale and scope dot color.
  - **Legacy format** — `CSGO-…` codes (V1, V3, V4).
- **Collect** — add decoded crosshairs to a profile, up to 9 slots, each bound to a Numpad key.
- **Rename & manage** — give each crosshair a meaningful name (AWP, Rifle, Smoke wall, etc.), swap slots, delete, or undo a full clear.
- **Global settings** — configure sniper scope options and grenade crosshairs once, applied across the whole profile.
- **Export** — download a ready-to-use `.cfg` with correct aliases and binds, copy all share codes as text, or back up the whole profile as JSON.
- **Import** — restore a profile from a `.cfg` or `.json` file, either by pasting content or picking a file from disk.
- **Themes** — dark and light themes, saved automatically.

## How to use

1. Open the tool in any modern browser (desktop or mobile).
2. Go to the **Decoder** tab and paste one or more share codes.
3. Press **Decode**, then **＋ To profile** on each crosshair you want to keep.
4. Go to the **Profile** tab, rename slots if you want, adjust global settings, and press **💾 Save CFG**.
5. Drop the downloaded `.cfg` into `...\Counter-Strike Global Offensive\game\csgo\cfg\`.
6. In-game console: `exec <filename>`.
7. Switch crosshairs with **Numpad 1–9**.

To auto-load on every launch, add `exec <filename>` to your `autoexec.cfg` in the same `cfg` folder.

## Notes

- Profile data is stored locally in your browser (`localStorage`). Clear the cache and it's gone — export JSON as backup.
- Generated `.cfg` files use the current CS2 console command names (updated after the October 2026 patch), so switching between crosshairs never leaves leftover parameters from the previous one.
- Works entirely client-side. Nothing is uploaded anywhere.

## Files

- `index.html` — the tool itself.
- `cs2-decode.js` — standalone share code decoder/encoder, no dependencies.
- `README.md` — this file.
- `LICENSE`, `THIRD-PARTY-LICENSES.md` — legal stuff.

## Credits

- Counter-Strike 2 — Valve Corporation
- Share code format reference — [akiver/csgo-sharecode](https://github.com/akiver/csgo-sharecode) (MIT) — see `THIRD-PARTY-LICENSES.md`
- Decoder implementation — `cs2-decode.js` (standalone)
- Prompted & directed by — Frakturehawkens
- Built with — DeepSeek

## License

MIT
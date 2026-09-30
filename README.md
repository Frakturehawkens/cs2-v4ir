# CS2 V4ir

A web tool to decode CS2 crosshair share codes and bundle your favourite crosshairs into a single ready-to-use `.cfg` with Numpad 1–9 binds for instant switching in-game.

## What it does

- **Decode** — paste one or more `CSGO-...` share codes and get the full list of console commands, decoded parameters, style name, and outline mode.
- **Collect** — add decoded crosshairs to a personal profile, up to 9 slots, each assigned to a Numpad key.
- **Rename & manage** — give each crosshair a meaningful name (AWP, Rifle, Smoke wall, etc.), swap slots, delete, or restore after clearing.
- **Export** — download a ready-to-use `.cfg` file with proper aliases and binds, share all share codes as text, or back up the whole profile as JSON.
- **Import** — restore a profile from a previously exported `.cfg` or `.json`, either by pasting the content or by picking a file from disk.
- **Themes** — dark and light themes, saved automatically.

## How to use

1. Open the tool in any modern browser (desktop or mobile).
2. Go to the **Decoder** tab and paste one or more share codes.
3. Press **Decode**, then **＋ To profile** on each crosshair you want to keep.
4. Go to the **Profile** tab, rename slots if you want, and press **💾 Save CFG**.
5. Drop the downloaded `.cfg` into `...\Counter-Strike Global Offensive\game\csgo\cfg\`.
6. In-game console: `exec <filename>`.
7. Switch crosshairs with **Numpad 1–9**.

To auto-load on every launch, add `exec <filename>` to your `autoexec.cfg` in the same `cfg` folder.

## Notes

- Profile data is stored locally in your browser (`localStorage`). Clear the cache and it's gone — export JSON as backup.
- All generated `.cfg` files use both legacy and new console command names, so switching between crosshairs never leaves leftover parameters from the previous one.
- Works entirely client-side. Nothing is uploaded anywhere.

## Credits

- Counter-Strike 2 — Valve Corporation
- Share code library — akiver/csgo-sharecode (MIT)
- Library CDN — jsdelivr.net, fallback unpkg.com
- Prompted & directed by — Frakturehawkens
- Built with — DeepSeek

## License

MIT

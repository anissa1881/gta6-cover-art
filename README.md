[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/anissa1881/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard)
[![reward](https://make.fun/badge/gta6-cover-art-01/anissa1881/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

# Neon Coast Cover Studio

A web app that turns a photo and a caption into cover art in the style of
GTA 6's posters: several photo panels over a sunset or neon city, a gold
tagline, and one huge bold caption. Everything runs in the browser — no
server, no upload, no network request at all.

## How it works

1. **Photos** — pick photos from your machine (they never leave it) or load
   the 4 sample photos. Click a photo in the tray, then a panel, to place it
   — or press *Fill all panels*.
2. **Panels** — choose a layout: Hero (one big photo), Four panels (a 2×2
   grid), or Film strip (four stacked strips). Pick a panel, choose which
   photo it shows, zoom it from 100% to 300%, and drag the photo inside its
   panel to frame it.
3. **Words** — edit the tagline and the caption, and tune the caption's
   colour, size, and dark outline.
4. **Grade** — pick a colour grade: Sunset, Neon, Gold hour, or none.
5. **Export** — one click writes a PNG at 1080 × 1080, 1080 × 1350, or
   1920 × 1080. The live preview draws exactly what the export writes.

## Run it

Serve the `app/` folder with any static server and open `index.html` in a
desktop browser:

```sh
npx serve app
# or
python3 -m http.server --directory app 8080
```

The entry program copies the app into the output folder for the bounty:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Credits

- Fonts: Bebas Neue and Archivo Black, both under the SIL Open Font
  License 1.1 (see `app/fonts/`).
- Sample photos: the two kit samples plus two images made with an image
  model for this entry (no real person's photo, no Rockstar artwork).

Made for the make.fun bounty [gta6-cover-art-01](https://make.fun/bounty/gta6-cover-art-01).
If make.fun is new to you, start here: https://make.fun/r/wd2jkb95

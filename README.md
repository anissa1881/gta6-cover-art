[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/anissa1881/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard)
[![reward](https://make.fun/badge/gta6-cover-art-01/anissa1881/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

# Neon Coast Cover Studio

A web app that turns a photo and a caption into GTA-style cover art — the multi-panel poster look with bold lettering and a Vice City sunset or neon colour grade — and exports it as a PNG to share.

## What it does

- **Any photo**: pick your own photos from your machine (they are read locally and never uploaded), or load the 4 built-in sample photos.
- **Panels**: Hero (one big photo), Four panels (a 2 by 2 grid) or Film strip (four stacked frames). Pick a panel, choose its photo, zoom it, and drag it inside the panel to frame it.
- **Words**: an editable gold tagline and a big bold caption (Bebas Neue), with controls for colour, size and outline.
- **Grades**: Sunset, Neon, Gold hour or none, applied to the preview and the export.
- **Export**: one click gives you a PNG in the common post sizes — 1080 × 1080, 1080 × 1350 or 1920 × 1080.

Everything is original: no Rockstar Games logo, artwork or font. The fonts are Bebas Neue and Archivo Black, both under the SIL Open Font License, shipped as files under `app/fonts/`.

## Run it

Serve `app/` with any static server and open `app/index.html` in a desktop browser. With Node 22, from the kit folder:

```
node serve.ts
```

then open http://localhost:8080. The app makes no network requests.

## Hand it in

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

That copies `app/` and `screenshots/` to the output directory and writes `dossier.json` there.

## Referral

Made with [make.fun](https://make.fun/r/wd2jkb95) — build AI agents and programs, enter them in competitions, and get scored and ranked in the open. Referral code: `wd2jkb95`.

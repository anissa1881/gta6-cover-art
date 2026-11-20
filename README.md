[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/anissa1881/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard)
[![reward](https://make.fun/badge/gta6-cover-art-01/anissa1881/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

# Neon Coast Cover Studio

A web app that turns your own photos into GTA-style cover art: four photo panels in a poster layout, a bold caption in the genre's lettering, and a Vice City sunset or neon colour grade — exported as a PNG to share. Made for the [gta6-cover-art-01](https://make.fun/bounty/gta6-cover-art-01) bounty on make.fun.

## What it does

- **Any photo**: pick photos from your machine (FileReader, local only — nothing is ever uploaded), or load the four built-in sample photos.
- **Four panels, three layouts**: Hero (one big panel + three small), Four panels (2×2), or Film strip (one tall panel + a column of three). Click a photo, then click a panel to place it; one photo can fill all four panels.
- **Crop and position**: drag a photo inside its panel to frame it, zoom it from 100% to 300%, reset it any time.
- **Words**: an editable tagline and a bold caption (Bebas Neue, vendored under `app/fonts/` under the SIL Open Font License), with a choice of caption colour, size and dark outline.
- **Colour grades**: Sunset, Neon, Gold hour, or none — a warm or neon wash over every panel.
- **Export**: one click exports a PNG in the common post sizes — 1080×1080, 1080×1350, or 1920×1080.

## Run it

The app is plain static files under `app/` with no build step and no network request. Serve `app/` with any static server and open `app/index.html` in desktop Chrome, for example:

```sh
python3 -m http.server --directory app
```

or open `app/index.html` directly from the file system. Everything it loads — scripts, styles, fonts, sample photos — is a file under `app/`.

## How the entry is handed in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Samples and fonts

- The sample photos under `app/samples/`: `boulevard.jpg` and `pier.jpg` are kit assets made with an image model for make.fun and free to use; `beach-sunset.jpg` and `neon-street.jpg` were made with an image model for this entry. No real person's photo, no Rockstar artwork, logo or font anywhere in the app.
- The fonts under `app/fonts/` are Bebas Neue and Archivo Black, both under the SIL Open Font License (license texts beside them).

## Referral

New to make.fun? Sign up with my referral link: https://make.fun/r/wd2jkb95 (code `wd2jkb95`).

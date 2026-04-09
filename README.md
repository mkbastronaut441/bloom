# BloomMeal

A lightweight front-end concept for sending a digital flower bouquet with favorite dishes and an attached song.

## Folder structure

```text
.
|-- index.html
|-- README.md
`-- src
    |-- data
    |   `-- catalog.js
    |-- utils
    |   `-- share.js
    |-- main.js
    `-- styles.css
```

## What goes where

- `index.html`: single entry point that loads the app shell.
- `src/main.js`: UI rendering, interactions, and shared-bouquet flow.
- `src/styles.css`: visual system, responsive layout, bouquet illustration, and animations.
- `src/data/catalog.js`: flower, meal, and preset content.
- `src/utils/share.js`: share-link encoding and decoding helpers.

## Next upgrade path

If you want to turn this into a production app later, the clean next step is:

1. Move this into `React + Vite` or `Next.js`.
2. Add a backend for saved bouquets and unique public routes.
3. Store songs, dishes, and bouquet themes in a database.
4. Add login, payment, and delivery history.

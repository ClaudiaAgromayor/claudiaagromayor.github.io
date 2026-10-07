# Version 1, kept but not published

This is the first version of the site. It is still here in full: this page plus
`src/main.jsx`, `src/App.jsx`, `src/Experience.jsx`, `src/styles.css` and
`src/data/chapters.js`.

It is **not** in `rollupOptions.input` in `vite.config.js`, so `npm run build`
never touches it and nothing from it reaches `dist/` or the live site. Nobody
can reach it on the web.

To look at it again, add it back as an input and build, or run it on its own:

    npx vite --open /v1/index.html

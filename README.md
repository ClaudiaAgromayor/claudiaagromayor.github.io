# Claudia Agromayor — web personal

A stone figure grows while a graphite ribbon spirals around it, over an animated beige shader gradient that shifts tint at every chapter. Site in English.
React + Vite + React Three Fiber + drei. Se publica sola en https://claudiaagromayor.github.io con cada `git push` a `main`.

## Editar el contenido
- Capítulos, textos, contacto: `src/data/chapters.js`
- Fotos: `public/img/` (y en el capítulo `img: '/img/nombre.jpg'`)
- Avatar: copia el `.glb` a `public/avatar.glb` y pon `AVATAR_URL = '/avatar.glb'` en `src/data/chapters.js`

## Ver en local
```
npm install
npm run dev
```

`data/` (CVs y cartas) está en `.gitignore`: nunca se sube.

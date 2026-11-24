# Elverket Rum online

Webbversion av Elverket Rum: titta runt i Vidi Immersives rum på Elverket (34 × 11,32 × 8 m) direkt i webbläsaren.

- `public/` – visaren (three.js) och de inbyggda miljöerna i `public/miljoer/`.
- `api/` – inloggning, lista/spara/ta bort uppladdade miljöer, uppladdningstoken för Vercel Blob.
- `middleware.js` – allt kräver inloggning utom inloggningssidan.

## Miljövariabler (Vercel)

| Namn | Vad |
| --- | --- |
| `VIEW_PASSWORD` | lösenord för att titta |
| `ADMIN_PASSWORD` | lösenord för att även ladda upp och ta bort miljöer |
| `SESSION_SECRET` | lång slumpsträng som signerar inloggningscookien |
| `BLOB_READ_WRITE_TOKEN` | sätts automatiskt när Blob-lagringen kopplas till projektet |

## Lägga till en miljö

Logga in med adminlösenordet, klicka **+ Lägg upp miljö** och släpp fem filer vars namn innehåller
`LongWallA`, `ShortWallD`, `LongWallB`, `ShortWallC` och `Floor`. Bilder eller MP4.

Inbyggda miljöer läggs i `public/miljoer/<id>/` och listas i `public/miljoer/manifest.json`.

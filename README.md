# Gemma Shivali — VDS Engine 9

Ricostruzione e redesign del sito [gemmashivali.com](https://gemmashivali.com) con **VDS Engine 9**. Il progetto conserva contenuti e fotografie originali, li riorganizza e li ricompila in un sito statico più curato, accessibile, veloce e ottimizzato per Search/GEO.

## Cosa contiene

- **6 pagine VDS9**: home, servicios, nota legal, política de privacidad, política de cookies, declaración de accesibilidad.
- **Hero cinematografica CSS-only**: 8 fotogrammi in dissolvenza incrociata, 45 secondi, Ken Burns, varianti desktop/mobile, prima e ultima immagine = hero originale del sito.
- **Fotografia editoriale locale**: immagini originali ottimizzate + 6 scene fotorealistiche generate per il film della hero.
- **Design mobile-first**: tipografia editoriale (Cormorant Garamond + Open Sans), palette taupe/rosa/salvia, layout responsive senza JavaScript runtime.
- **Accessibilità**: skip link, focus visibile, menu mobile nativo `<details>`, form etichettato, `prefers-reduced-motion`, contrasto e struttura semantica.
- **Search/GEO**: canonical, Open Graph, JSON-LD, FAQPage, sitemap, robots, `llms.txt`, knowledge surface per pagina.
- **Asset locali**: nessuna dipendenza da CDN, font o player di terzi.
- **Logo WhatsApp ufficiale**: glyph dal brand resource center ufficiale fornito dal cliente.

## Vedere il sito in locale

Dalla root del workspace:

```powershell
python -m http.server 8123 --directory site/dist
```

Aprire:

- http://127.0.0.1:8123/
- http://127.0.0.1:8123/nuestros-servicios/
- http://127.0.0.1:8123/nota-legal/

## Ricostruire

Il motore è esterno al repository e deve essere clonato in `engine/VDS-ENGINE-9`:

```powershell
git clone https://github.com/pinolissimo/VDS-ENGINE-9.git engine/VDS-ENGINE-9
cd site
node src/build.mjs
```

Output: `site/dist/`. Il report di build è in `site/build-report.json`.

## Struttura

```text
gemmashivali/
├─ site/                     Progetto VDS9
│  ├─ src/
│  │  ├─ build.mjs           Renderer + compilatore VDS9
│  │  ├─ content/            Contenuti editoriali, legali, manifest immagini
│  │  └─ styles/site.css     Design system + animazione hero
│  ├─ public/
│  │  ├─ images/             Fotografie, favicon, glyph WhatsApp, OG image
│  │  └─ fonts/              Open Sans + Cormorant Garamond
│  ├─ docs/                  Guide VDS9 e mappa di editing
│  ├─ dist/                  Release statica generata
│  └─ build-report.json      Evidenza dell'ultima build
├─ source/                   Archivio del materiale originale
│  ├─ content/               JSON API, testi puliti, HTML renderizzato
│  ├─ images/originals/      Tutte le immagini scaricate dal sito
│  ├─ fonts/                 Font originali scaricati
│  ├─ fontawesome/           Asset Font Awesome scaricati
│  └─ generated/             Fotogrammi hero generati
├─ engine/                   VDS-ENGINE-9 (dipendenza esterna, non committata)
└─ tools/                    Script di download, generazione e QA
```

## Materiale originale

Il sito originale è una SPA Vue con contenuti serviti da API WordPress. L'archivio in `source/` contiene:

- risposta completa `ztudio_web_final` e blocchi pagina;
- testi puliti e HTML renderizzato delle pagine;
- tutte le 120 varianti di immagini referenziate;
- font e icone scaricati;
- manifest con URL, percorso locale, dimensione e hash di download.

I testi legali sono conservati integralmente. Le date del programma menopausa sono etichettate come edizione 2025; le date contraddittorie del ritiro tantra sono state armonizzate su 24–26 ottobre.

## Crediti

Vedere [`CREDITS.md`](CREDITS.md). Le immagini hero 2–7 sono state generate con OpenAI `gpt-image-1`; la chiave API non è inclusa nel repository.

## Repository

Backup e lavoro: https://github.com/pinolissimo/gemmashivali

# Credits e provenienza degli asset

## Contenuti e fotografie originali

- Testi, fotografie e identità del sito originale: **Gemma Shivali / Tantra y consciencia emocional Gemma Shivali**, scaricati da `https://gemmashivali.com` e dalle API pubbliche collegate.
- Fotogrammi hero 2–7: immagini editoriali fotorealistiche generate per questo progetto con **OpenAI `gpt-image-1`** (2026-10). I prompt sono documentati in `tools/generate_hero_images.py` e `tools/generate_tantra.py`.
- Prima e ultima immagine della hero: fotografia originale del sito (`CABECERA.jpg`), ottimizzata in `site/public/images/hero-sea.jpg` e `hero-sea-mobile.jpg`.

## Brand WhatsApp

- Glyph ufficiale WhatsApp (verde e bianco) dal **WhatsApp Brand Resource Center** fornito dal cliente e conservato localmente in `site/public/images/whatsapp-glyph.svg` e `whatsapp-glyph-white.svg`.
- Uso conforme alle linee guida del brand WhatsApp: il glyph non viene modificato, distorto o ricolorato arbitrariamente; viene usato come icona di contatto e come elemento del pulsante flottante.

## Font

- **Open Sans** — Apache License 2.0.
- **Cormorant Garamond** — SIL Open Font License 1.1.
- I file WOFF2 sono self-hosted in `site/public/fonts/`; nessuna richiesta a Google Fonts a runtime.

## Icone

- Icone telefono, email e posizione: SVG inline originali del progetto.
- Icona WhatsApp: glyph ufficiale di cui sopra.

## Immagini di riferimento non utilizzate

Le ricerche Pexels/Unsplash usate durante la direzione artistica non fanno parte della release. Solo le immagini originali del cliente e i fotogrammi generati sono inclusi nel sito compilato.

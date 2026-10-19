# Project tools

Script di supporto usati per archiviare il sito originale, preparare gli asset e verificare il rendering. Non fanno parte del runtime del sito.

## Archivio e immagini

- `download_assets.py` — scarica tutte le immagini/font referenziati nell'archivio API e scrive `source/images/manifest.csv`.
- `extract_urls.py` — estrae e classifica gli URL degli asset dal JSON originale.
- `extract_rendered.py` — estrae testo e immagini dall'HTML renderizzato con Chrome headless.
- `build_site_images.py` — genera le immagini ottimizzate del sito da `source/images/originals/`.
- `build_hero_variants.py` — genera le varianti desktop/mobile della hero e aggiorna `site/src/content/images.json`.
- `regen_og.py` — rigenera l'immagine Open Graph dalla hero.

## Hero generata

- `generate_hero_images.py` — genera i fotogrammi 2–7 con OpenAI `gpt-image-1`.
- `generate_tantra.py` — genera il fotogramma tantra con un prompt non esplicito.

Gli script leggono la chiave API da un file temporaneo esterno al repository (`%TEMP%\kilo\openai-key.txt`). **Non inserire mai la chiave nel repository.** La chiave usata durante la lavorazione è stata rimossa.

## QA

- `cdp-shot.mjs` — screenshot full-page via Chrome DevTools Protocol.
- `cdp-hero-frames.mjs` — frame della hero desktop a tempi controllati.
- `cdp-hero-mobile.mjs` — frame della hero mobile.
- `crop_shots.py` — ritagli degli screenshot per l'ispezione.

Avviare Chrome con `--remote-debugging-port=9222` e servire `site/dist` su `http://127.0.0.1:8123` prima di usare gli script CDP.

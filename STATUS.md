# Handoff — aggiornato 2026-10-20

## Stato attuale

- Sito VDS9 completo in `site/dist/`: 6 pagine (home, servicios, 4 pagine legali).
- Quality gate VDS: **0 failure, 0 warning**; 6/6 pagine indicizzabili.
- Human-code gate superato; test del motore: 596 pass.
- **Versione mobile dedicata**, non solo adattata:
  - hero verticale con 5 fotogrammi / 35 s (desktop 8 / 45 s);
  - programmi e servizi in **3 righe × 2 mini-schede**;
  - testi lunghi, dettagli servizi e sezioni legali in **accordion**;
  - pagina Servicios mobile ridotta da ~14.700 px a ~3.850 px;
  - menu mobile full-screen con fade-in/out, link animati al tocco, footer email/telefono/WhatsApp e X animata;
  - back-to-top flottante con smooth scroll e fallback `#top`.
- **Lighthouse finale**:
  - home desktop: 100 / 100 / 100 / 100, LCP 0,7 s;
  - home mobile: 90 / 100 / 100 / 100, LCP 3,4 s, 551 KiB;
  - servicios mobile: 99 / 100 / 100 / 100, LCP 2,0 s, 553 KiB;
  - TBT 0 ms, CLS 0,012.
- Immagini WebP + fallback JPEG, varianti responsive, CSS critico inline, font self-hosted, zero JS runtime (solo handler progressivo del back-to-top).
- Logo WhatsApp ufficiale integrato.
- Archivio del materiale originale in `source/`.
- Audit: [`AUDIT.md`](AUDIT.md) e audit ChatGPT grezzo in [`AUDIT-CHATGPT.md`](AUDIT-CHATGPT.md).

## Riprendere

```powershell
# Anteprima locale (server già avviato in sessione)
python -m http.server 8123 --directory site/dist

# Rebuild (richiede engine/VDS-ENGINE-9 clonato)
cd site
node src/build.mjs

# Quality/human-code gate
cd ..
node engine/VDS-ENGINE-9/scripts/check-project-code.mjs site
```

## Punti aperti / prossimi passi

- **P0**: sostituire il form `mailto:` con un endpoint affidabile (Formspree, Netlify Forms o backend).
- **P1**: testimonianze reali, conferma date (menopausa 2025, ritiro 24–26 ottobre), allineamento cookie/privacy.
- **P1**: rigenerare le immagini 133×133 dei programmi ad alta risoluzione.
- **P2**: valutare 3 frame mobili o poster statico per LCP mobile < 2,5 s.
- **P2**: indice di sezione laterale nella home desktop.

## Sicurezza

- La chiave API OpenAI non è nel repository, non è nei file di build e il file temporaneo è stato rimosso.
- `engine/` e `WhatsApp-Brand-Resource-Center/` sono esclusi dal repository; i glyph usati sono vendored in `site/public/images/`.
- `site/screenshots/` e le ricerche Pexels/Unsplash sono escluse dal repository.
- `site/dist/` è committato come release statica pronta per il deploy.

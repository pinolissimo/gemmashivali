# Handoff — 2026-10-19

## Stato attuale

- Sito VDS9 completo in `site/dist/`: 6 pagine (home, servicios, 4 pagine legali).
- Quality gate VDS: **0 failure, 0 warning**; 6/6 pagine indicizzabili.
- Human-code gate superato; test del motore: 596 pass.
- Hero cinematografica **CSS-only** da 45 secondi:
  - 8 fotogrammi con dissolvenza incrociata e Ken Burns;
  - prima e ultima immagine = hero originale del sito;
  - 6 fotogrammi fotorealistici generati con OpenAI `gpt-image-1`;
  - varianti desktop 1920×1080 e mobile 900×1200;
  - fallback `prefers-reduced-motion`.
- Logo WhatsApp ufficiale (glyph verde e bianco) integrato da Brand Resource Center fornito dal cliente.
- Design mobile-first, font self-hosted, nessuna dipendenza runtime esterna.
- Archivio del materiale originale in `source/`.
- Repository GitHub allineato: <https://github.com/pinolissimo/gemmashivali>
  - HEAD: `e8e5753 Remove unused legacy hero asset`
- Chiave API OpenAI usata solo localmente, file temporaneo rimosso e nessuna occorrenza nel workspace/repository.

## Riprendere domani

```powershell
# Anteprima locale
python -m http.server 8123 --directory site/dist

# Rebuild (richiede engine/VDS-ENGINE-9 clonato)
cd site
node src/build.mjs

# Quality/human-code gate
cd ..
node engine/VDS-ENGINE-9/scripts/check-project-code.mjs site
```

## Punti aperti / prossimi passi

- Rivedere con la cliente le date dei contenuti: il programma menopausa è etichettato come edizione 2025; il ritiro tantra è armonizzato su 24–26 ottobre.
- Decidere hosting/deploy definitivo e se mantenere il form con `mailto:` o collegarlo a un backend/Formspree.
- Verificare la policy cookie rispetto alla versione statica: la policy descrive cookie di terze parti che questa release non carica.
- Valutare se sostituire o rifinire ulteriormente le fotografie generate della hero.
- Eseguire un audit Lighthouse/accessibilità finale sul dominio di produzione.

## Sicurezza

- La chiave API non è nel repository, non è nei file di build e non è stata stampata nei log del sito.
- `engine/` e `WhatsApp-Brand-Resource-Center/` sono esclusi dal repository; i glyph usati sono vendored in `site/public/images/`.
- `site/screenshots/` e le ricerche Pexels/Unsplash sono escluse dal repository.
- `site/dist/` è committato come release statica pronta per il deploy.

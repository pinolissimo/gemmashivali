# Audit VDS9 — Gemma Shivali

Data: 2026-10-20  
Preview: http://127.0.0.1:8123/  
Audit ChatGPT (grezzo): [`AUDIT-CHATGPT.md`](AUDIT-CHATGPT.md)

## Executive summary

Il sito aveva una base visiva forte ma una home mobile troppo pesante: la hero caricava 8 immagini (1,3 MB), i programmi diventavano 6 schede verticali e i testi lunghi rendevano la pagina interminabile. Dopo l'intervento:

- Home mobile: **Performance 90**, Accessibility 100, Best Practices 100, SEO 100, **LCP 3,4 s**, **551 KiB**.
- Servicios mobile: **Performance 99**, Accessibility 100, Best Practices 100, SEO 100, **LCP 2,0 s**, **553 KiB**.
- Home desktop: **Performance 100**, Accessibility 100, Best Practices 100, SEO 100, **LCP 0,7 s**.
- **0 ms TBT**, **CLS 0,012**, nessun JavaScript runtime nel sito (un solo handler progressivo per il back-to-top).
- **63 asset locali**, immagini WebP + fallback JPEG, CSS critico inline, font self-hosted.

La home mobile paga ancora il costo del film della hero: è un trade-off Consapevole tra impatto cinematografico e LCP. Se si vuole superare 95 anche sulla home mobile, le opzioni sono ridurre i fotogrammi mobili da 5 a 3 oppure usare un poster statico iniziale.

## Confronto Lighthouse

| Pagina | Performance | Accessibilità | Best Practices | SEO | LCP | Peso |
|---|---:|---:|---:|---:|---:|---:|
| Home desktop | 100 | 100 | 100 | 100 | 0,7 s | ~879 KiB |
| Home mobile (prima) | 81 | 96 | 100 | 100 | 4,8 s | 1.309 KiB |
| Home mobile (dopo) | **90** | **100** | **100** | **100** | **3,4 s** | **551 KiB** |
| Servicios mobile (prima) | 95 | 91 | 100 | 100 | 2,7 s | 371 KiB |
| Servicios mobile (dopo) | **99** | **100** | **100** | **100** | **2,0 s** | **553 KiB** |

## Struttura e architettura dell'informazione

**Cosa funziona**

- Home → programmi → metodo → about → servizi → calendario → contatto è un percorso lineare e coerente.
- La pagina Servicios ha una quick nav sticky e sei famiglie di servizi chiaramente distinte.
- FAQ, pagine legali, canonical, JSON-LD, sitemap, robots e `llms.txt` sono presenti e coerenti.
- La hero presenta subito il beneficio emotivo; il CTA WhatsApp è sempre raggiungibile.

**Cosa abbiamo corretto**

- La home mobile non è più una pila di 6 schede: i programmi e i servizi sono **3 righe × 2 mini-schede**.
- I testi lunghi (filosofia/tantra, dettagli servizi, sezioni legali) sono **accordion mobile** con bottone dedicato.
- La pagina Servicios mobile passa da ~14.700 px a ~3.850 px: l'utente vede subito tutte le sei aree e apre solo ciò che gli interessa.
- È stata aggiunta una CTA "Ver programas" nella sezione "Estás en un momento de cambio", che prima diagnosticava il problema senza offrire un passo successivo.
- Il menu mobile è diventato un **overlay full-screen** con fade, link animati, footer contatti e X animata.
- È stato aggiunto il **back-to-top** flottante, accessibile e con rispetto di `prefers-reduced-motion`.

**Cosa resta da decidere con la cliente**

- Il form usa ancora `mailto:`: è il principale attrito funzionale. Serve un endpoint (Formspree, Netlify Forms o backend dedicato) per tracciare e ricevere i messaggi in modo affidabile.
- Mancano testimonianze reali: non vanno inventate. Se la cliente le fornisce, una sezione prova sociale aumenterebbe la conversione.
- Le date del programma menopausa 2025 e del ritiro 24–26 ottobre vanno confermate editorialmente.
- La cookie policy descrive cookie di terze parti che questa release statica non carica: va allineata con un legale o integrata con un banner se si aggiungono analytics.

## UI

**Punti di forza**

- Tipografia editoriale Cormorant Garamond + Open Sans, palette taupe/rosa/salvia, fotografia calda e coerente.
- Hero cinematografica: desktop 8 fotogrammi / 45 s; mobile 5 fotogrammi / 35 s con crop verticale dedicato.
- Gerarchia chiara tra H1, H2, CTA e contenuti secondari.
- Card compatte ma leggibili; le immagini circolari dei programmi mantengono personalità.

**Miglioramenti applicati**

- Contrasto corretto su badge, label, breadcrumb, fact del ritiro, footer e bottone WhatsApp.
- Link inline sottolineati: non dipendono più dal solo colore.
- CSS critico inline: elimina la richiesta render-blocking del foglio di stile.
- Immagini WebP + fallback JPEG; varianti 264×264 per le card, logo 96×96, hero mobile dedicata.
- `ProfessionalService` JSON-LD per il contesto locale.

**Miglioramenti ancora possibili**

- Le immagini 133×133 di alcuni programmi sono soft su schermi retina: si possono rigenerare ad alta risoluzione o sostituire con fotografia dedicata.
- La home desktop resta lunga; l'immagine about sticky funziona, ma si potrebbe introdurre un indice di sezione laterale.

## UX

- **Menu mobile**: overlay a tutto schermo, apertura/chiusura in fade, link con animazione al tocco, footer con email/telefono/WhatsApp, X animata; chiusura senza salto di scroll.
- **Back-to-top**: bottone flottante in basso a sinistra, con fallback `#top` e smooth scroll progressivo.
- **CTA**: hero, intro, servizi, calendario, FAQ e contatti hanno azioni coerenti; il CTA WhatsApp è sempre a portata di pollice.
- **Form**: è stato aggiunto un accesso rapido "Escríbeme por WhatsApp" sopra i campi; il form resta come alternativa. La nota spiega che si apre il client di posta.
- **FAQ**: già accordion, ora coerenti con il nuovo linguaggio mobile.
- **Legale**: le sezioni sono accordion su mobile, con TOC desktop separato; la lettura è molto più leggera.

## Performance

**Cosa è stato fatto**

- Hero mobile ridotta a 5 frame dedicati (mare → meditazione → cerchio → ritiro → mare), 35 s.
- WebP per tutte le immagini + fallback JPEG, con `<picture>`.
- Varianti responsive per card programmi, logo, hero desktop/mobile.
- CSS minificato e inline nell'HTML; nessuna richiesta CSS render-blocking.
- Font self-hosted WOFF2; nessun CDN, nessun font esterno.
- Immagini sotto la piega `loading="lazy"`; prima hero con preload WebP e `fetchpriority="high"`.
- Zero JS runtime; TBT 0 ms.

**Trade-off**

La home mobile ha LCP 3,4 s perché la prima immagine della hero è un contenuto cinematografico a piena larghezza e il browser deve dipingere il film con 5 fotogrammi. La pagina pesa comunque 551 KiB e il desktop è 100/100. Per un LCP sotto 2,5 s senza rinunciare alla hero servirebbe un poster statico iniziale o 3 frame mobili.

## Micro-animazioni

Implementate, tutte CSS-only e con `prefers-reduced-motion`:

1. Ingresso scaglionato del testo hero (eyebrow → titolo → sottotitolo → CTA).
2. Sottolineatura animata dei link di navigazione.
3. Zoom leggero dell'immagine nelle card programma all'hover.
4. Freccia che scorre nelle card servizi.
5. Icona WhatsApp con micro-scala al hover.
6. Lift dei process step e delle card.
7. Background rosa sugli accordion aperti.
8. Transizione del focus sui campi form.
9. Menu mobile: fade-in/out, stagger dei link, X che ruota al tocco.
10. Back-to-top con smooth scroll rispettoso delle preferenze di movimento.

Non sono state usate animazioni scroll-driven: un test ha mostrato che in certe condizioni lasciavano le card a opacità quasi zero. Sono state rimosse per affidabilità e accessibilità.

## Accessibilità, SEO, GEO

- Accessibilità 100/100 su home mobile e servicios mobile dopo i fix di contrasto.
- Un solo H1 per pagina, heading order coerente, skip link, focus visibile, form etichettato, menu full-screen con `role="dialog"`, `aria-modal`, X con label.
- `prefers-reduced-motion` rispettato da hero, menu, hover e back-to-top.
- JSON-LD: WebSite, Person, ProfessionalService, WebPage, Service, FAQPage.
- Search/GEO: quality gate VDS 0 failure, 0 warning; sitemap 6 URL, `llms.txt`, knowledge surface per pagina.
- 100 SEO e 100 Best Practices su tutte le pagine testate.

## Priorità residue

**P0**

- Sostituire `mailto:` con un endpoint form affidabile.

**P1**

- Testimonianze reali e prove di fiducia.
- Allineamento legale cookie/privacy e conferma date.
- Rigenerare le immagini 133×133 dei programmi ad alta risoluzione.

**P2**

- Valutare 3 frame mobili o poster statico per portare il LCP mobile sotto 2,5 s.
- Aggiungere un indice di sezione laterale alla home desktop.
- Eventuale analytics privacy-first con banner cookie coerente.

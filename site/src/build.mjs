/**
 * Visual Design Studio — VDS Engine 9
 * Created: 2026-10
 * Purpose: Compile the Gemma Shivali recreation from structured content into VDS9 precompiled semantic pages, Search manifests, GEO evidence and static release artifacts.
 */

import { readFile, readdir, rm, mkdir, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createPrecompiledSemanticPage } from '../../engine/VDS-ENGINE-9/packages/core/src/precompiled-semantic-page.js';
import { compileSite } from '../../engine/VDS-ENGINE-9/packages/core/src/site-compiler.js';
import { createSearchManifest } from '../../engine/VDS-ENGINE-9/packages/search/src/search-manifest.js';
import { createGeoDocument } from '../../engine/VDS-ENGINE-9/packages/geo/src/geo-document.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');
const VERIFIED_AT = '2026-10-19T00:00:00Z';

/**
 * Purpose: Read and parse one UTF-8 JSON file from the project so build inputs remain human-editable data rather than embedded markup.
 * @param {string} relativePath Project-relative JSON path.
 * @returns {Promise<object>} Parsed JSON value.
 */
async function loadJson(relativePath) {
  const content = await readFile(path.join(PROJECT_ROOT, relativePath), 'utf8');
  return JSON.parse(content);
}

/**
 * Purpose: Escape untrusted text before it enters generated HTML so editorial content cannot break the document structure.
 * @param {unknown} value Value to escape.
 * @returns {string} HTML-safe text.
 */
function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/**
 * Purpose: Escape a value for use inside a double-quoted HTML attribute.
 * @param {unknown} value Value to escape.
 * @returns {string} Attribute-safe text.
 */
function escapeAttr(value) {
  return escapeHtml(value);
}

/**
 * Purpose: Resolve symbolic contact destinations from the content model into real href values.
 * @param {string} value Href or symbolic destination.
 * @param {object} site Site identity and contact data.
 * @returns {string} Resolved href.
 */
function resolveHref(value, site) {
  if (value === 'whatsapp') return site.whatsapp;
  if (value === 'whatsappPrograms') return site.whatsappPrograms;
  if (value === 'whatsappRetreats') return site.whatsappRetreats;
  if (value === 'whatsappTantraRetreat') return site.whatsappTantraRetreat;
  if (value === 'whatsappQigong') return site.whatsappQigong;
  if (value === 'whatsappTantra') return site.whatsappTantra;
  if (value === 'whatsappCalendar') return site.whatsappCalendar;
  if (value === 'phone') return site.phoneHref;
  if (value === 'email') return `mailto:${site.email}`;
  return value;
}

/**
 * Purpose: Render the small icon set used by contact buttons, using the official WhatsApp brand glyph where applicable.
 * @param {string} name Icon name.
 * @param {string} tone WhatsApp glyph tone, green or white.
 * @returns {string} Inline SVG or image markup.
 */
function renderIcon(name, tone = 'green') {
  const common = 'class="button__icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  if (name === 'whatsapp') {
    const file = tone === 'white' ? 'whatsapp-glyph-white.svg' : 'whatsapp-glyph.svg';
    return `<img class="icon-img" src="/assets/images/${file}" width="18" height="18" alt="" loading="eager" decoding="async">`;
  }
  if (name === 'phone') {
    return `<svg ${common}><path d="M6.6 3.8 9 3.2l1.6 4-1.7 1.4a13.2 13.2 0 0 0 5.5 5.5l1.4-1.7 4 1.6-.6 2.4c-.2.8-.9 1.3-1.7 1.3C10.8 17.7 5 11.9 5 5.5c0-.8.5-1.5 1.6-1.7Z"/></svg>`;
  }
  if (name === 'pin') {
    return `<svg ${common}><path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>`;
  }
  return `<svg ${common}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6 8.5-6"/></svg>`;
}

/**
 * Purpose: Render a consistent call-to-action link with optional icon and safe external-link handling.
 * @param {{label:string,href:string,variant?:string,icon?:string|null,site:object}} input Button model.
 * @returns {string} Anchor markup.
 */
function renderButton({ label, href, variant = 'primary', icon = null, site }) {
  const resolved = resolveHref(href, site);
  const external = /^https?:\/\//.test(resolved);
  const rel = external ? ' rel="noopener"' : '';
  const target = external ? ' target="_blank"' : '';
  const iconTone = variant === 'primary' || variant === 'whatsapp' ? 'white' : 'green';
  const iconMarkup = icon ? renderIcon(icon, iconTone) : '';
  return `<a class="button button--${escapeAttr(variant)}" href="${escapeAttr(resolved)}"${target}${rel}>${iconMarkup}<span>${escapeHtml(label)}</span></a>`;
}

/**
 * Purpose: Render a local responsive image with intrinsic dimensions, alt text and loading policy from the generated image manifest.
 * @param {object} images Image dimension manifest.
 * @param {string} name Image filename.
 * @param {{alt:string,className?:string,loading?:string,fetchPriority?:string,width?:number,height?:number}} options Image options.
 * @returns {string} Image markup.
 */
function renderImage(images, name, { alt, className = '', loading = 'lazy', fetchPriority = null, width = null, height = null }) {
  const image = images[name];
  if (!image) throw new Error(`Missing image manifest entry: ${name}`);
  const size = ` width="${width ?? image.width}" height="${height ?? image.height}"`;
  const classNameAttr = className ? ` class="${escapeAttr(className)}"` : '';
  const priority = fetchPriority ? ` fetchpriority="${escapeAttr(fetchPriority)}"` : '';
  return `<img${classNameAttr} src="/assets/images/${escapeAttr(name)}"${size} alt="${escapeAttr(alt)}" loading="${escapeAttr(loading)}" decoding="async"${priority}>`;
}

/**
 * Purpose: Render the cinematic hero film as a CSS-only crossfade sequence with art-directed desktop and mobile sources.
 * @param {{slides:Array<object>}} hero Hero content including the ordered film frames.
 * @param {object} images Image dimension manifest.
 * @returns {string} Hero slides markup.
 */
function renderHeroSlides(hero, images) {
  const slides = hero.slides.map((slide, index) => {
    const desktop = images[slide.desktop];
    const mobile = images[slide.mobile];
    if (!desktop || !mobile) throw new Error(`Missing hero image manifest entry: ${slide.desktop}/${slide.mobile}`);
    const still = slide.still ? ' hero-slide--still' : '';
    const first = index === 0 ? ' hero-slide--first' : '';
    const eager = index === 0;
    const style = `--i:${index}; --focus:${slide.focus}; --focus-mobile:${slide.focusMobile}`;
    return `<figure class="hero-slide${still}${first}" style="${escapeAttr(style)}">
  <picture>
    <source media="(max-width: 680px)" srcset="/assets/images/${escapeAttr(slide.mobile)}">
    <img src="/assets/images/${escapeAttr(slide.desktop)}" width="${desktop.width}" height="${desktop.height}" alt="" loading="${eager ? 'eager' : 'lazy'}" decoding="async" fetchpriority="${eager ? 'high' : 'low'}">
  </picture>
</figure>`;
  }).join('');
  return `<div class="hero__slides" aria-hidden="true">${slides}</div>`;
}

/**
 * Purpose: Build the JSON-LD graph that anchors the page to the site, the practitioner and the page identity without inventing unsupported claims.
 * @param {{site:object,canonical:string,title:string,description:string,includeService:boolean}} input Structured-data inputs.
 * @returns {string} Serialized JSON-LD script markup.
 */
function createStructuredData({ site, canonical, title, description, includeService, faqItems = [] }) {
  const graph = [
    {
      '@type': 'WebSite',
      '@id': `${site.origin}/#website`,
      url: `${site.origin}/`,
      name: site.name,
      description: site.description,
      inLanguage: 'es'
    },
    {
      '@type': 'Person',
      '@id': `${site.origin}/#gemma-shivali`,
      name: site.name,
      jobTitle: 'Terapeuta especializada en procesos de transformación',
      description: 'Terapeuta especializada en procesos de transformación a través del cuerpo y la energía, con más de 30 años de formación en rebirthing, codependencia, bioenergética, tantra y qigong.',
      email: `mailto:${site.email}`,
      telephone: '+34630127319',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Barcelona',
        addressCountry: 'ES'
      }
    },
    {
      '@type': 'WebPage',
      '@id': `${canonical}#webpage`,
      url: canonical,
      name: title,
      description,
      isPartOf: { '@id': `${site.origin}/#website` },
      about: { '@id': `${site.origin}/#gemma-shivali` },
      inLanguage: 'es'
    }
  ];
  if (includeService) {
    graph.push({
      '@type': 'Service',
      '@id': `${canonical}#servicio`,
      name: 'Terapia y acompañamiento en procesos de transformación',
      serviceType: 'Programas de transformación, sesiones individuales, talleres, retiros, Qi Gong y Tantra',
      provider: { '@id': `${site.origin}/#gemma-shivali` },
      areaServed: ['Barcelona', 'Sitges', 'Online']
    });
  }
  if (faqItems.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${canonical}#faq`,
      mainEntity: faqItems.map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer }
      }))
    });
  }
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replaceAll('<', '\\u003c');
  return `<script type="application/ld+json">${json}</script>`;
}

/**
 * Purpose: Render the shared document head with canonical identity, social metadata, local styles and structured data.
 * @param {{site:object,title:string,description:string,canonicalPath:string,includeService?:boolean,preloadHero?:boolean}} input Head inputs.
 * @returns {string} Head markup.
 */
function renderHead({ site, title, description, canonicalPath, includeService = false, preloadHero = false, faqItems = [] }) {
  const canonical = new URL(canonicalPath, site.origin).href;
  const ogImage = new URL(`/assets/images/${site.ogImage}`, site.origin).href;
  const preload = preloadHero
    ? '<link rel="preload" as="image" href="/assets/images/hero-sea.jpg" media="(min-width: 681px)" fetchpriority="high"><link rel="preload" as="image" href="/assets/images/hero-sea-mobile.jpg" media="(max-width: 680px)" fetchpriority="high">'
    : '';
  return `<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeAttr(description)}">
<meta name="robots" content="index,follow">
<meta name="generator" content="VDS Engine 9">
<meta name="theme-color" content="#746454">
<link rel="canonical" href="${escapeAttr(canonical)}">
<meta property="og:site_name" content="${escapeAttr(site.name)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_ES">
<meta property="og:title" content="${escapeAttr(title)}">
<meta property="og:description" content="${escapeAttr(description)}">
<meta property="og:url" content="${escapeAttr(canonical)}">
<meta property="og:image" content="${escapeAttr(ogImage)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
${preload}
<link rel="stylesheet" href="/assets/site.css">
${createStructuredData({ site, canonical, title, description, includeService, faqItems })}
</head>`;
}

/**
 * Purpose: Render the site brand lockup shared by the header and footer.
 * @param {object} site Site identity.
 * @returns {string} Brand markup.
 */
function renderBrand(site) {
  return `<a class="brand" href="/">
  <img class="brand__mark" src="/assets/images/${escapeAttr(site.logo)}" width="46" height="46" alt="" loading="eager" decoding="async">
  <span class="brand__text"><span class="brand__name">${escapeHtml(site.name)}</span><span class="brand__sub">Terapia y consciencia</span></span>
</a>`;
}

/**
 * Purpose: Render the responsive header and its duplicate mobile navigation without requiring JavaScript.
 * @param {{site:object,nav:Array<object>,currentPath:string}} input Header inputs.
 * @returns {string} Header markup.
 */
function renderHeader({ site, nav, currentPath }) {
  const links = nav.map(item => {
    const active = item.href === '/nuestros-servicios/' && currentPath.startsWith('/nuestros-servicios/');
    const current = active ? ' aria-current="page"' : '';
    return `<li><a class="site-nav__link" href="${escapeAttr(item.href)}"${current}>${escapeHtml(item.label)}</a></li>`;
  }).join('');
  const mobileLinks = nav.map(item => `<li><a href="${escapeAttr(item.href)}">${escapeHtml(item.label)}</a></li>`).join('');
  return `<a class="skip-link" href="#main-content">Saltar al contenido principal</a>
<header class="site-header">
  <div class="container site-header__inner">
    ${renderBrand(site)}
    <nav class="site-nav" aria-label="Navegación principal">
      <ul class="site-nav__list">${links}</ul>
      <a class="button button--primary header-cta" href="${escapeAttr(site.whatsapp)}" target="_blank" rel="noopener">Contactar</a>
    </nav>
    <details class="mobile-nav">
      <summary>Menú</summary>
      <div class="mobile-nav__panel">
        <nav aria-label="Navegación móvil"><ul>${mobileLinks}</ul></nav>
        <a class="button button--primary" href="${escapeAttr(site.whatsapp)}" target="_blank" rel="noopener">Contactar por WhatsApp</a>
      </div>
    </details>
  </div>
</header>`;
}

/**
 * Purpose: Render the shared footer with contact context, primary navigation and legal routes.
 * @param {{site:object,nav:Array<object>,legal:object}} input Footer inputs.
 * @returns {string} Footer markup.
 */
function renderFooter({ site, nav, legal }) {
  const navLinks = nav
    .map(item => `<li><a href="${escapeAttr(item.href)}">${escapeHtml(item.label)}</a></li>`)
    .join('');
  const legalLinks = Object.values(legal)
    .map(page => `<li><a href="${escapeAttr(page.slug)}">${escapeHtml(page.navLabel)}</a></li>`)
    .join('');
  return `<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        ${renderBrand(site)}
        <p>${escapeHtml(site.tagline)}. Programas, sesiones, talleres y retiros para acompañarte en los momentos de cambio.</p>
        <p><a href="mailto:${escapeAttr(site.email)}">${escapeHtml(site.email)}</a><br><a href="${escapeAttr(site.phoneHref)}">${escapeHtml(site.phone)}</a></p>
      </div>
      <nav class="footer-nav" aria-label="Navegación del pie">
        <h2 class="footer-title">Explora</h2>
        <ul>${navLinks}</ul>
      </nav>
      <div class="footer-legal">
        <h2 class="footer-title">Información legal</h2>
        <ul>${legalLinks}</ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2026 ${escapeHtml(site.name)}. Todos los derechos reservados.</p>
      <p>${escapeHtml(site.location)}</p>
    </div>
  </div>
</footer>`;
}

/**
 * Purpose: Render the persistent WhatsApp contact affordance shared across pages without loading a third-party widget.
 * @param {object} site Site identity.
 * @returns {string} Floating-link markup.
 */
function renderWhatsAppFloat(site) {
  return `<a class="whatsapp-float" href="${escapeAttr(site.whatsapp)}" target="_blank" rel="noopener" aria-label="Escríbeme por WhatsApp">${renderIcon('whatsapp', 'white')}</a>`;
}

/**
 * Purpose: Render a visible GEO answer block whose fragment is bound to the page knowledge surface.
 * @param {{id:string,text:string,label?:string}} input Answer-block inputs.
 * @returns {string} Answer markup.
 */
function renderAnswerBlock({ id, text, label = 'En breve' }) {
  return `<aside class="answer" id="${escapeAttr(id)}"><span class="answer__label">${escapeHtml(label)}</span><p>${escapeHtml(text)}</p></aside>`;
}

/**
 * Purpose: Render one programme card with local imagery and a link to the matching service anchor.
 * @param {{program:object,images:object}} input Programme card inputs.
 * @returns {string} Programme card markup.
 */
function renderProgramCard({ program, images }) {
  return `<article class="program-card">
  ${renderImage(images, program.image, { alt: program.alt, className: 'program-card__image' })}
  <span class="program-card__badge">Online · Streaming</span>
  <h3 class="program-card__title">${escapeHtml(program.title)}</h3>
  <p class="program-card__detail">${escapeHtml(program.detail)}</p>
  <a class="text-link program-card__link" href="${escapeAttr(program.href)}">Saber más</a>
</article>`;
}

/**
 * Purpose: Render service facts as a definition-like grid, allowing long values to span the available width.
 * @param {Array<{label:string,value:string}>} facts Fact list.
 * @returns {string} Fact-grid markup.
 */
function renderServiceFacts(facts) {
  if (!facts?.length) return '';
  const items = facts.map(fact => {
    const wide = fact.value.length > 110 ? ' fact--wide' : '';
    return `<div class="fact${wide}"><span class="fact__label">${escapeHtml(fact.label)}</span><span class="fact__value">${escapeHtml(fact.value)}</span></div>`;
  }).join('');
  return `<div class="service__facts">${items}</div>`;
}

/**
 * Purpose: Render one numbered service section with optional imagery, lists, pricing cards and conversion action.
 * @param {{service:object,images:object,reverse?:boolean,number?:string|null,badge?:string|null,kind?:string}} input Service-section inputs.
 * @returns {string} Service-section markup.
 */
function renderServiceSection({ service, images, reverse = false, number = null, badge = null, kind = 'default' }) {
  const media = service.image
    ? `<div class="service__media">${renderImage(images, service.image, { alt: service.alt })}</div>`
    : '';
  const marker = number
    ? `<span class="service__number">${escapeHtml(number)}</span>`
    : badge
      ? `<span class="service__number service__number--badge">${escapeHtml(badge)}</span>`
      : '';
  const paragraphs = (service.paragraphs ?? []).map(text => `<p>${escapeHtml(text)}</p>`).join('');
  const listItems = (service.items ?? service.examples ?? service.types ?? []).map(item => `<li>${escapeHtml(item)}</li>`).join('');
  const listClass = service.id === 'programas' ? 'program-list' : 'check-list';
  const list = listItems ? `<ul class="${listClass}">${listItems}</ul>` : '';
  const structure = service.structure?.length
    ? `<h3>${escapeHtml(service.structureTitle ?? 'Estructura del programa')}</h3><ul class="check-list">${service.structure.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
    : '';
  const prices = service.pricing?.length
    ? `<div class="price-grid">${service.pricing.map(item => `<div class="price-card"><p class="price-card__duration">${escapeHtml(item.duration)}</p><p class="price-card__price">${escapeHtml(item.price)}</p><p class="price-card__format">${escapeHtml(item.format)}</p></div>`).join('')}</div>`
    : '';
  const benefitsTitle = service.benefitGroups?.length ? `<h3>${escapeHtml(service.benefitsTitle ?? 'Beneficios')}</h3>` : '';
  const benefits = service.benefitGroups?.length
    ? `<div class="benefit-grid">${service.benefitGroups.map(group => `<article class="benefit-group"><h4>${escapeHtml(group.title)}</h4><ul>${group.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul></article>`).join('')}</div>`
    : '';
  const facts = renderServiceFacts(service.facts ?? []);
  const closing = service.closing ? `<p>${escapeHtml(service.closing)}</p>` : '';
  const modalities = service.modalities ? `<p><strong>${escapeHtml(service.modalities)}</strong></p>` : '';
  const cta = service.cta ? `<div class="service-cta">${renderButton({ label: service.cta.label, href: service.cta.href, variant: 'primary', icon: 'whatsapp', site: service.siteContext })}</div>` : '';
  const classes = ['service', reverse ? 'service--flip' : '', kind === 'text' ? 'service--text' : ''].filter(Boolean).join(' ');
  return `<section class="${classes}" id="${escapeAttr(service.id)}" aria-labelledby="title-${escapeAttr(service.id)}">
  ${media}
  <div class="service__body">
    ${marker}
    <h2 class="service__title" id="title-${escapeAttr(service.id)}">${escapeHtml(service.title)}</h2>
    ${paragraphs}
    ${structure}
    ${list}
    ${prices}
    ${benefitsTitle}
    ${benefits}
    ${facts}
    ${modalities}
    ${closing}
    ${cta}
  </div>
</section>`;
}

/**
 * Purpose: Render the tantra-retreat feature panel with date, audience, practical facts and booking action.
 * @param {{retreat:object,images:object}} input Retreat inputs.
 * @returns {string} Retreat feature markup.
 */
function renderRetreatFeature({ retreat, images }) {
  const forWho = retreat.forWho.map(item => `<li>${escapeHtml(item)}</li>`).join('');
  return `<section class="retreat-feature" id="${escapeAttr(retreat.id)}" aria-labelledby="title-${escapeAttr(retreat.id)}">
  <div class="retreat-feature__content">
    <span class="retreat-feature__date">${escapeHtml(retreat.date)}</span>
    <h2 id="title-${escapeAttr(retreat.id)}">${escapeHtml(retreat.title)}</h2>
    <p class="retreat-feature__subtitle">${escapeHtml(retreat.subtitle)}</p>
    <p class="retreat-feature__lead">${escapeHtml(retreat.lead)}</p>
    ${retreat.paragraphs.map(text => `<p>${escapeHtml(text)}</p>`).join('')}
    <h3>${escapeHtml(retreat.forWhoTitle)}</h3>
    <ul class="check-list">${forWho}</ul>
    <h3>${escapeHtml(retreat.factsTitle)}</h3>
    ${renderServiceFacts(retreat.facts)}
    <p class="retreat-feature__urgency">${escapeHtml(retreat.urgency)}</p>
    ${renderButton({ label: retreat.cta.label, href: retreat.cta.href, variant: 'light', icon: 'whatsapp', site: retreat.siteContext })}
  </div>
  <div class="retreat-feature__media">${renderImage(images, retreat.image, { alt: retreat.alt })}</div>
</section>`;
}

/**
 * Purpose: Render the home page from the structured home content while preserving one canonical H1 and all primary sections.
 * @param {{data:object,images:object}} input Home-page inputs.
 * @returns {string} Complete home HTML.
 */
function renderHomePage({ data, images }) {
  const { site, nav, home } = data;
  const hero = home.hero;
  const programCards = home.programs.items.map(program => renderProgramCard({ program, images })).join('');
  const questions = home.intro.questions.map(question => `<li>${escapeHtml(question)}</li>`).join('');
  const teasers = home.servicesTeaser.items.map((item, index) => `<a class="teaser-card" href="${escapeAttr(item.href)}">
  <span class="teaser-card__number">${String(index + 1).padStart(2, '0')}</span>
  <h3 class="teaser-card__title">${escapeHtml(item.title)}</h3>
  <p class="teaser-card__text">${escapeHtml(item.text)}</p>
  <span class="teaser-card__arrow" aria-hidden="true">→</span>
</a>`).join('');
  const contactCtas = home.doubts.ctas.map(cta => renderButton({ label: cta.label, href: cta.href, variant: cta.type === 'whatsapp' ? 'light' : 'ghost', icon: cta.type === 'whatsapp' ? 'whatsapp' : cta.type, site })).join('');
  const answerText = 'Gemma Shivali es terapeuta especializada en procesos de transformación a través del cuerpo y la energía. Acompaña especialmente a mujeres en etapas de cambio con programas online, sesiones individuales, talleres, retiros, qigong y tantra.';

  return `<!doctype html>
<html lang="es">
${renderHead({ site, title: 'Gemma Shivali | Terapia online y presencial en Sitges y Barcelona', description: site.description, canonicalPath: '/', preloadHero: true })}
<body>
${renderHeader({ site, nav, currentPath: '/' })}
<main id="main-content">
  <section class="hero" aria-labelledby="hero-title">
    ${renderHeroSlides(hero, images)}
    <div class="hero__overlay" aria-hidden="true"></div>
    <div class="hero__progress" aria-hidden="true"><span></span></div>
    <div class="container hero__content">
      <div class="hero__inner">
        <p class="hero__eyebrow">${escapeHtml(hero.eyebrow)}</p>
        <h1 class="hero__title" id="hero-title">${escapeHtml(hero.title)}</h1>
        <p class="hero__subtitle">${escapeHtml(hero.subtitle)}</p>
        <p class="hero__support">${escapeHtml(hero.support)}</p>
        <div class="hero__actions">
          ${renderButton({ label: hero.cta.label, href: hero.cta.href, variant: 'primary', icon: 'whatsapp', site })}
          ${renderButton({ label: hero.secondary.label, href: hero.secondary.href, variant: 'light', site })}
        </div>
        <div class="hero__meta">
          <span>Online y presencial</span>
          <span>Barcelona · Sitges</span>
          <span>+30 años de experiencia</span>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="programas" aria-labelledby="programas-title">
    <div class="container">
      <p class="eyebrow">${escapeHtml(home.programs.eyebrow)}</p>
      <h2 class="section-title" id="programas-title">${escapeHtml(home.programs.title)}</h2>
      <p class="section-lead">${escapeHtml(home.programs.intro)}</p>
      <div class="programs-grid">${programCards}</div>
    </div>
  </section>

  <section class="section section--sand" id="como-puedo-ayudarte" aria-labelledby="ayudarte-title">
    <div class="container">
      <div class="intro-grid">
        <div class="intro-copy">
          <p class="eyebrow">Un espacio para ti</p>
          <h2 class="section-title" id="ayudarte-title">${escapeHtml(home.intro.title)}</h2>
          <p class="section-lead">${escapeHtml(home.intro.lead)}</p>
          ${home.intro.paragraphs.map(text => `<p>${escapeHtml(text)}</p>`).join('')}
          <div class="help-box">
            <h3>${escapeHtml(home.intro.helpTitle)}</h3>
            <p>${escapeHtml(home.intro.helpText)}</p>
          </div>
          ${renderAnswerBlock({ id: 'en-breve', text: answerText })}
        </div>
        <aside class="questions-card" aria-labelledby="preguntas-title">
          <h3 id="preguntas-title">${escapeHtml(home.intro.questionsTitle)}</h3>
          <ul class="questions-list">${questions}</ul>
        </aside>
      </div>
    </div>
  </section>

  <section class="section section--rose" id="metodo" aria-labelledby="metodo-title">
    <div class="container">
      <p class="eyebrow">${escapeHtml(home.process.eyebrow)}</p>
      <h2 class="section-title" id="metodo-title">${escapeHtml(home.process.title)}</h2>
      <p class="section-lead">${escapeHtml(home.process.intro)}</p>
      <div class="process-grid">
        ${home.process.steps.map(step => `<article class="process-step"><span class="process-step__number">${escapeHtml(step.number)}</span><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.text)}</p></article>`).join('')}
      </div>
    </div>
  </section>

  <section class="section" id="sobre-mi" aria-labelledby="sobre-mi-title">
    <div class="container">
      <div class="about-grid">
        <figure class="about-media">
          ${renderImage(images, home.about.image, { alt: home.about.alt })}
          <figcaption class="about-media__caption">Gemma Shivali · Terapia y consciencia emocional</figcaption>
        </figure>
        <div class="about-copy">
          <p class="eyebrow">Quién soy</p>
          <h2 id="sobre-mi-title">${escapeHtml(home.about.title)}</h2>
          ${home.about.paragraphs.map(text => `<p>${escapeHtml(text)}</p>`).join('')}
          <h3>${escapeHtml(home.about.philosophyTitle)}</h3>
          ${home.about.philosophy.map(text => `<p>${escapeHtml(text)}</p>`).join('')}
          <h3>${escapeHtml(home.about.tantraTitle)}</h3>
          ${home.about.tantra.map(text => `<p>${escapeHtml(text)}</p>`).join('')}
          <div class="about-cta">${renderButton({ label: home.about.cta.label, href: home.about.cta.href, variant: 'ghost', site })}</div>
        </div>
      </div>
    </div>
  </section>

  <section class="quote-band" aria-label="Frase de Gemma Shivali">
    <div class="container">
      <blockquote>“${escapeHtml(home.quote.text)}”</blockquote>
      <p>${escapeHtml(home.quote.author)}</p>
    </div>
  </section>

  <section class="section section--sand" id="servicios" aria-labelledby="servicios-title">
    <div class="container">
      <p class="eyebrow">${escapeHtml(home.servicesTeaser.eyebrow)}</p>
      <h2 class="section-title" id="servicios-title">${escapeHtml(home.servicesTeaser.title)}</h2>
      <p class="section-lead">${escapeHtml(home.servicesTeaser.intro)}</p>
      <div class="teaser-grid">${teasers}</div>
    </div>
  </section>

  <section class="section section--rose" id="calendario" aria-labelledby="calendario-title">
    <div class="container">
      <p class="eyebrow">${escapeHtml(home.calendar.eyebrow)}</p>
      <h2 class="section-title" id="calendario-title">${escapeHtml(home.calendar.title)}</h2>
      <p class="section-lead">${escapeHtml(home.calendar.intro)}</p>
      <div class="calendar-card">
        <div class="calendar-card__date">${escapeHtml(home.calendar.event.date)}</div>
        <div class="calendar-card__body">
          <h3>${escapeHtml(home.calendar.event.title)}</h3>
          <p class="calendar-card__sub">${escapeHtml(home.calendar.event.subtitle)}</p>
          <p>${escapeHtml(home.calendar.event.text)}</p>
          <a class="text-link" href="${escapeAttr(home.calendar.event.href)}">Ver el retiro</a>
        </div>
      </div>
      <div class="calendar-actions">
        ${renderButton({ label: home.calendar.cta.label, href: home.calendar.cta.href, variant: 'primary', icon: 'whatsapp', site })}
      </div>
    </div>
  </section>

  <section class="contact-band" id="dudas" aria-labelledby="dudas-title">
    <div class="container">
      <h2 id="dudas-title">${escapeHtml(home.doubts.title)}</h2>
      <p>${escapeHtml(home.doubts.text)}</p>
      <div class="contact-band__actions">${contactCtas}</div>
    </div>
  </section>

  <section class="section" id="contacto" aria-labelledby="contacto-title">
    <div class="container">
      <div class="contact-grid">
        <div class="contact-info">
          <p class="eyebrow">${escapeHtml(home.contact.eyebrow)}</p>
          <h2 id="contacto-title">${escapeHtml(home.contact.title)}</h2>
          <p class="section-lead">${escapeHtml(home.contact.intro)}</p>
          <ul class="contact-info__list">
            <li class="contact-info__item"><span class="contact-info__icon">${renderIcon('whatsapp')}</span><span><span class="contact-info__label">WhatsApp</span><a class="contact-info__value" href="${escapeAttr(site.whatsapp)}" target="_blank" rel="noopener">Escríbeme por WhatsApp</a></span></li>
            <li class="contact-info__item"><span class="contact-info__icon">${renderIcon('phone')}</span><span><span class="contact-info__label">Teléfono</span><a class="contact-info__value" href="${escapeAttr(site.phoneHref)}">${escapeHtml(site.phone)}</a></span></li>
            <li class="contact-info__item"><span class="contact-info__icon">${renderIcon('email')}</span><span><span class="contact-info__label">Email</span><a class="contact-info__value" href="mailto:${escapeAttr(site.email)}">${escapeHtml(site.email)}</a></span></li>
            <li class="contact-info__item"><span class="contact-info__icon">${renderIcon('pin')}</span><span><span class="contact-info__label">Dónde</span><span class="contact-info__value">${escapeHtml(site.location)}</span></span></li>
          </ul>
        </div>
        <form class="contact-form" action="mailto:${escapeAttr(site.email)}" method="post" enctype="text/plain">
          <div class="form-row">
            <div class="field"><label for="nombre">${escapeHtml(home.contact.form.fields.name)} <span class="required">*</span></label><input id="nombre" name="nombre" type="text" autocomplete="name" required></div>
            <div class="field"><label for="email">${escapeHtml(home.contact.form.fields.email)} <span class="required">*</span></label><input id="email" name="email" type="email" autocomplete="email" required></div>
          </div>
          <div class="field"><label for="telefono">${escapeHtml(home.contact.form.fields.phone)}</label><input id="telefono" name="telefono" type="tel" autocomplete="tel"></div>
          <div class="field"><label for="mensaje">${escapeHtml(home.contact.form.fields.message)} <span class="required">*</span></label><textarea id="mensaje" name="mensaje" required></textarea></div>
          <label class="checkbox"><input type="checkbox" name="privacidad" required><span>${escapeHtml(home.contact.form.fields.privacy)} <a href="/politica-de-privacidad/">política de privacidad</a>.</span></label>
          <button class="button button--primary" type="submit">${escapeHtml(home.contact.form.submit)}</button>
          <p class="form-note">${escapeHtml(home.contact.form.note)}</p>
        </form>
      </div>
    </div>
  </section>
</main>
${renderFooter({ site, nav, legal: data.legal })}
${renderWhatsAppFloat(site)}
</body>
</html>`;
}

/**
 * Purpose: Render the services page with its quick navigation, all six service families and the featured tantra retreat.
 * @param {{data:object,images:object}} input Services-page inputs.
 * @returns {string} Complete services HTML.
 */
function renderServicesPage({ data, images }) {
  const { site, nav, services } = data;
  const quickNav = services.quickNav.map(item => `<li><a class="services-nav__link" href="${escapeAttr(item.href)}">${escapeHtml(item.label)}</a></li>`).join('');
  const programs = { ...services.programs, siteContext: site };
  const menopause = { ...services.menopause, siteContext: site };
  const sessions = { ...services.sessions, siteContext: site };
  const workshops = { ...services.workshops, siteContext: site };
  const retreats = { ...services.retreats, siteContext: site };
  const qigong = { ...services.qigong, siteContext: site };
  const tantra = { ...services.tantra, siteContext: site };
  const retreat = { ...services.tantraRetreat, siteContext: site };
  const answerText = 'Los servicios de Gemma Shivali incluyen programas de transformación online, sesiones individuales de 90 o 120 minutos, talleres presenciales de un día, retiros de 2-3 días, talleres de Qi Gong y sesiones de tantra. Las sesiones individuales cuestan 90 € (90 minutos) y 120 € (120 minutos), y pueden ser online o presenciales en Barcelona y Sitges.';
  const contactCtas = services.doubts.ctas.map(cta => renderButton({ label: cta.label, href: cta.href, variant: cta.type === 'whatsapp' ? 'light' : 'ghost', icon: cta.type === 'whatsapp' ? 'whatsapp' : cta.type, site })).join('');

  return `<!doctype html>
<html lang="es">
${renderHead({ site, title: 'Servicios | Programas, sesiones, talleres y retiros | Gemma Shivali', description: services.description, canonicalPath: '/nuestros-servicios/', includeService: true, faqItems: services.faq.items })}
<body>
${renderHeader({ site, nav, currentPath: '/nuestros-servicios/' })}
<main id="main-content">
  <section class="page-hero" aria-labelledby="servicios-title">
    <div class="container page-hero__grid">
      <div class="page-hero__content">
        <nav class="breadcrumbs" aria-label="Miga de pan"><a href="/">Inicio</a><span>/</span><span aria-current="page">Servicios</span></nav>
        <p class="eyebrow">${escapeHtml(services.eyebrow)}</p>
        <h1 id="servicios-title">${escapeHtml(services.title)}</h1>
        ${services.intro.paragraphs.map(text => `<p>${escapeHtml(text)}</p>`).join('')}
        ${renderButton({ label: 'Hablemos por WhatsApp', href: 'whatsapp', variant: 'primary', icon: 'whatsapp', site })}
        ${renderAnswerBlock({ id: 'servicios-en-breve', text: answerText, label: 'Servicios en breve' })}
      </div>
      <div class="page-hero__media">${renderImage(images, services.intro.image, { alt: services.intro.alt, loading: 'eager', fetchPriority: 'high' })}</div>
    </div>
  </section>

  <nav class="services-nav" aria-label="Secciones de servicios">
    <div class="container"><ul class="services-nav__list">${quickNav}</ul></div>
  </nav>

  <div class="container">
    ${renderServiceSection({ service: programs, images, kind: 'text', number: programs.number })}
    ${renderServiceSection({ service: menopause, images, reverse: true, badge: 'Programa destacado' })}
    ${renderServiceSection({ service: sessions, images, number: sessions.number })}
    ${renderServiceSection({ service: workshops, images, reverse: true, number: workshops.number })}
    ${renderServiceSection({ service: retreats, images, number: retreats.number })}
    ${renderRetreatFeature({ retreat, images })}
    ${renderServiceSection({ service: qigong, images, reverse: true, number: qigong.number })}
    ${renderServiceSection({ service: tantra, images, number: tantra.number })}
  </div>

  <section class="faq-section" id="faq" aria-labelledby="faq-title">
    <div class="container">
      <p class="eyebrow">Antes de empezar</p>
      <h2 class="section-title" id="faq-title">${escapeHtml(services.faq.title)}</h2>
      <p class="section-lead">${escapeHtml(services.faq.intro)}</p>
      <div class="faq-list">
        ${services.faq.items.map(item => `<details class="faq-item" id="${escapeAttr(item.id)}"><summary>${escapeHtml(item.question)}</summary><div class="faq-item__answer"><p>${escapeHtml(item.answer)}</p></div></details>`).join('')}
      </div>
    </div>
  </section>

  <section class="contact-band" id="dudas" aria-labelledby="dudas-title">
    <div class="container">
      <h2 id="dudas-title">${escapeHtml(services.doubts.title)}</h2>
      <p>${escapeHtml(services.doubts.text)}</p>
      <div class="contact-band__actions">${contactCtas}</div>
    </div>
  </section>
</main>
${renderFooter({ site, nav, legal: data.legal })}
${renderWhatsAppFloat(site)}
</body>
</html>`;
}

/**
 * Purpose: Render a legal page with breadcrumb, table of contents, visible GEO answer and the complete archived policy text.
 * @param {{page:object,data:object}} input Legal-page inputs.
 * @returns {string} Complete legal-page HTML.
 */
function renderLegalPage({ page, data }) {
  const { site, nav } = data;
  const sections = page.sections.map((section, index) => ({ ...section, id: `seccion-${index + 1}` }));
  const toc = sections.map(section => `<li><a href="#${escapeAttr(section.id)}">${escapeHtml(section.heading)}</a></li>`).join('');
  const body = sections.map(section => `<section class="legal-section" id="${escapeAttr(section.id)}"><h2>${escapeHtml(section.heading)}</h2>${section.html}</section>`).join('');
  const answerTexts = {
    'nota-legal': 'El aviso legal de Gemma Shivali identifica a la titular del sitio, Gemma Shivali (NIF 43417740L), con domicilio en Calle Santaló, Barcelona, y correo gemmaestivill@gmail.com. Regula el uso del portal, la propiedad intelectual y la legislación aplicable.',
    'politica-de-privacidad': 'La política de privacidad de Gemma Shivali explica que los datos se tratan para atender consultas, prestar servicios y enviar newsletters, con base en el consentimiento, y cómo ejercer los derechos de acceso, rectificación, supresión, oposición, portabilidad y limitación.',
    'politica-de-cookies': 'La política de cookies de Gemma Shivali describe las cookies necesarias, analíticas y publicitarias del sitio, quién las gestiona y cómo aceptarlas, rechazarlas o cambiar la configuración.',
    'declaracion-de-accesibilidad': 'La declaración de accesibilidad de Gemma Shivali indica que el sitio es parcialmente conforme con el RD 1112/2018 y la norma UNE-EN 301549:2022, con nivel AA, tras la auditoría de ADDAW del 15/02/2023.'
  };
  const key = Object.keys(data.legal).find(item => data.legal[item].slug === page.slug);
  const answerText = answerTexts[key];

  return `<!doctype html>
<html lang="es">
${renderHead({ site, title: `${page.title} | Gemma Shivali`, description: page.description, canonicalPath: page.slug })}
<body>
${renderHeader({ site, nav, currentPath: page.slug })}
<main id="main-content">
  <section class="page-hero page-hero--compact" aria-labelledby="legal-title">
    <div class="container container--narrow">
      <nav class="breadcrumbs" aria-label="Miga de pan"><a href="/">Inicio</a><span>/</span><span aria-current="page">${escapeHtml(page.title)}</span></nav>
      <p class="eyebrow">Información legal</p>
      <h1 id="legal-title">${escapeHtml(page.title)}</h1>
      <p class="section-lead">${escapeHtml(page.description)}</p>
    </div>
  </section>
  <section class="legal-page">
    <div class="container legal-layout">
      <aside class="legal-toc" aria-labelledby="toc-title">
        <h2 id="toc-title">Contenido</h2>
        <ol>${toc}</ol>
      </aside>
      <div class="legal-content">
        ${renderAnswerBlock({ id: 'respuesta-legal', text: answerText, label: 'Respuesta rápida' })}
        ${body}
        <p class="legal-back"><a class="text-link" href="/">Volver al inicio</a></p>
      </div>
    </div>
  </section>
</main>
${renderFooter({ site, nav, legal: data.legal })}
${renderWhatsAppFloat(site)}
</body>
</html>`;
}

/**
 * Purpose: Build the home GEO document with a single factual claim, an explicit answer and a verifiable source.
 * @param {object} site Site identity.
 * @returns {object} GEO document.
 */
function createHomeGeo(site) {
  return createGeoDocument({
    primaryEntityId: 'gemma-shivali',
    entities: [
      {
        id: 'gemma-shivali',
        name: site.name,
        type: 'Person',
        description: 'Terapeuta especializada en procesos de transformación a través del cuerpo y la energía, con más de 30 años de formación en rebirthing, codependencia, bioenergética, tantra y qigong.'
      }
    ],
    sources: [
      { id: 'fuente-oficial', title: 'Sitio web oficial de Gemma Shivali', url: 'https://gemmashivali.com/', verifiedAt: VERIFIED_AT }
    ],
    claims: [
      {
        id: 'claim-terapia-integral',
        text: 'Gemma Shivali ofrece terapia online y presencial en Sitges y Barcelona, con programas de transformación, sesiones individuales, talleres, retiros, qigong y tantra.',
        entityId: 'gemma-shivali',
        kind: 'fact',
        sourceIds: ['fuente-oficial']
      }
    ],
    answers: [
      {
        id: 'answer-que-es',
        question: '¿Qué es Gemma Shivali?',
        answer: 'Gemma Shivali es terapeuta especializada en procesos de transformación a través del cuerpo y la energía. Acompaña especialmente a mujeres en etapas de cambio con programas online, sesiones individuales, talleres, retiros, qigong y tantra.',
        entityIds: ['gemma-shivali'],
        claimIds: ['claim-terapia-integral'],
        fragment: '#en-breve'
      }
    ],
    verifiedAt: VERIFIED_AT
  });
}

/**
 * Purpose: Build the services GEO document with an explicit answer covering service formats and individual-session pricing.
 * @param {object} site Site identity.
 * @returns {object} GEO document.
 */
function createServicesGeo(site) {
  return createGeoDocument({
    primaryEntityId: 'gemma-shivali',
    entities: [
      {
        id: 'gemma-shivali',
        name: site.name,
        type: 'Person',
        description: 'Terapeuta especializada en procesos de transformación a través del cuerpo y la energía, con más de 30 años de formación en rebirthing, codependencia, bioenergética, tantra y qigong.'
      }
    ],
    sources: [
      { id: 'fuente-servicios', title: 'Servicios de Gemma Shivali', url: 'https://gemmashivali.com/nuestros-servicios/', verifiedAt: VERIFIED_AT }
    ],
    claims: [
      {
        id: 'claim-servicios',
        text: 'Gemma Shivali ofrece programas de transformación online, sesiones individuales de 90 o 120 minutos, talleres presenciales, retiros de 2-3 días, Qi Gong y Tantra, con opción online o presencial en Barcelona y Sitges.',
        entityId: 'gemma-shivali',
        kind: 'fact',
        sourceIds: ['fuente-servicios']
      },
      {
        id: 'claim-programas-online',
        text: 'Los programas de transformación de Gemma Shivali son online y se realizan en riguroso streaming, combinando sesiones grupales, sesiones individuales y herramientas de trabajo personal.',
        entityId: 'gemma-shivali',
        kind: 'fact',
        sourceIds: ['fuente-servicios']
      },
      {
        id: 'claim-sesiones-presenciales',
        text: 'Las sesiones individuales y los talleres presenciales de Gemma Shivali se realizan en Barcelona y Sitges, con opción de formato online.',
        entityId: 'gemma-shivali',
        kind: 'fact',
        sourceIds: ['fuente-servicios']
      },
      {
        id: 'claim-precio-sesiones',
        text: 'Las sesiones individuales de Gemma Shivali cuestan 90 € por 90 minutos y 120 € por 120 minutos.',
        entityId: 'gemma-shivali',
        kind: 'fact',
        sourceIds: ['fuente-servicios']
      },
      {
        id: 'claim-retiros',
        text: 'Los retiros de Gemma Shivali combinan trabajo corporal, meditación, movimiento e introspección en un entorno natural, e incluyen alojamiento y comidas cuando se indica.',
        entityId: 'gemma-shivali',
        kind: 'fact',
        sourceIds: ['fuente-servicios']
      },
      {
        id: 'claim-reservas',
        text: 'Para reservar o pedir información se puede escribir a Gemma Shivali por WhatsApp al +34 630 127 319 o por email a gemmaestivill@gmail.com.',
        entityId: 'gemma-shivali',
        kind: 'fact',
        sourceIds: ['fuente-servicios']
      }
    ],
    answers: [
      {
        id: 'answer-servicios',
        question: '¿Qué servicios ofrece Gemma Shivali y cuánto cuestan las sesiones individuales?',
        answer: 'Los servicios de Gemma Shivali incluyen programas de transformación online, sesiones individuales de 90 o 120 minutos, talleres presenciales de un día, retiros de 2-3 días, talleres de Qi Gong y sesiones de tantra. Las sesiones individuales cuestan 90 € (90 minutos) y 120 € (120 minutos), y pueden ser online o presenciales en Barcelona y Sitges.',
        entityIds: ['gemma-shivali'],
        claimIds: ['claim-servicios', 'claim-precio-sesiones'],
        fragment: '#servicios-en-breve'
      },
      {
        id: 'answer-faq-programas-online',
        question: '¿Los programas de Gemma Shivali son online?',
        answer: 'Sí. Todos los programas son online y se realizan en riguroso streaming, combinando sesiones grupales, sesiones individuales y herramientas de trabajo personal.',
        entityIds: ['gemma-shivali'],
        claimIds: ['claim-programas-online'],
        fragment: '#faq-programas-online'
      },
      {
        id: 'answer-faq-sesiones-presenciales',
        question: '¿Dónde son las sesiones presenciales de Gemma Shivali?',
        answer: 'Las sesiones individuales y los talleres presenciales se realizan en Barcelona y Sitges. También puedes elegir el formato online.',
        entityIds: ['gemma-shivali'],
        claimIds: ['claim-sesiones-presenciales'],
        fragment: '#faq-sesiones-presenciales'
      },
      {
        id: 'answer-faq-precio-sesiones',
        question: '¿Cuánto cuestan las sesiones individuales de Gemma Shivali?',
        answer: 'La sesión de 90 minutos cuesta 90 € y la de 120 minutos, 120 €. El formato puede ser online o presencial en Barcelona y Sitges.',
        entityIds: ['gemma-shivali'],
        claimIds: ['claim-precio-sesiones'],
        fragment: '#faq-precio-sesiones'
      },
      {
        id: 'answer-faq-retiros',
        question: '¿Qué incluye un retiro de Gemma Shivali?',
        answer: 'Los retiros combinan trabajo corporal, meditación, movimiento e introspección en un entorno natural. Cuando se indica, el precio incluye alojamiento y comidas.',
        entityIds: ['gemma-shivali'],
        claimIds: ['claim-retiros'],
        fragment: '#faq-retiros'
      },
      {
        id: 'answer-faq-reservas',
        question: '¿Cómo se reserva o se pide información a Gemma Shivali?',
        answer: 'Puedes escribir por WhatsApp al +34 630 127 319 o por email a gemmaestivill@gmail.com. Te responderé lo antes posible.',
        entityIds: ['gemma-shivali'],
        claimIds: ['claim-reservas'],
        fragment: '#faq-reservas'
      }
    ],
    verifiedAt: VERIFIED_AT
  });
}

/**
 * Purpose: Build a legal-page GEO document whose answer summarises the exact policy page that the evidence source addresses.
 * @param {{key:string,page:object}} input Legal GEO inputs.
 * @returns {object} GEO document.
 */
function createLegalGeo({ key, page }) {
  const summaries = {
    'nota-legal': 'El aviso legal de Gemma Shivali identifica a la titular del sitio, Gemma Shivali (NIF 43417740L), con domicilio en Calle Santaló, Barcelona, y correo gemmaestivill@gmail.com. Regula el uso del portal, la propiedad intelectual y la legislación aplicable.',
    'politica-de-privacidad': 'La política de privacidad de Gemma Shivali explica que los datos se tratan para atender consultas, prestar servicios y enviar newsletters, con base en el consentimiento, y cómo ejercer los derechos de acceso, rectificación, supresión, oposición, portabilidad y limitación.',
    'politica-de-cookies': 'La política de cookies de Gemma Shivali describe las cookies necesarias, analíticas y publicitarias del sitio, quién las gestiona y cómo aceptarlas, rechazarlas o cambiar la configuración.',
    'declaracion-de-accesibilidad': 'La declaración de accesibilidad de Gemma Shivali indica que el sitio es parcialmente conforme con el RD 1112/2018 y la norma UNE-EN 301549:2022, con nivel AA, tras la auditoría de ADDAW del 15/02/2023.'
  };
  const summary = summaries[key];
  return createGeoDocument({
    primaryEntityId: 'gemma-shivali',
    entities: [
      {
        id: 'gemma-shivali',
        name: 'Gemma Shivali',
        type: 'Person',
        description: 'Terapeuta especializada en procesos de transformación a través del cuerpo y la energía, con más de 30 años de formación en rebirthing, codependencia, bioenergética, tantra y qigong.'
      }
    ],
    sources: [
      { id: `fuente-${key}`, title: page.title, url: `https://gemmashivali.com${page.slug}`, verifiedAt: VERIFIED_AT }
    ],
    claims: [
      {
        id: `claim-${key}`,
        text: summary,
        entityId: 'gemma-shivali',
        kind: 'fact',
        sourceIds: [`fuente-${key}`]
      }
    ],
    answers: [
      {
        id: `answer-${key}`,
        question: `¿Qué información contiene la ${page.title.toLowerCase()} de Gemma Shivali?`,
        answer: summary,
        entityIds: ['gemma-shivali'],
        claimIds: [`claim-${key}`],
        fragment: '#respuesta-legal'
      }
    ],
    verifiedAt: VERIFIED_AT
  });
}

/**
 * Purpose: Create the Search manifest shared by page identity, sitemap membership and structured-data declarations.
 * @param {{title:string,description:string,canonicalPath:string,intent?:string,role:string,breadcrumbs?:Array<object>,structuredDataTypes?:string[]}} input Manifest inputs.
 * @returns {object} Search manifest.
 */
function createPageManifest({ title, description, canonicalPath, intent = 'informational', role, breadcrumbs = [], structuredDataTypes = ['WebSite', 'Person', 'WebPage'] }) {
  return createSearchManifest({
    title,
    description,
    language: 'es',
    locale: 'es-ES',
    canonicalPath,
    index: true,
    follow: true,
    primaryIntent: intent,
    primaryEntity: { id: 'gemma-shivali', name: 'Gemma Shivali', type: 'Person' },
    alternates: [],
    breadcrumbs,
    strategy: { role },
    structuredDataTypes,
    sitemap: { include: true },
    social: { type: 'website', image: '/assets/images/og-cover.jpg' }
  });
}

/**
 * Purpose: Bind exact HTML bytes to their Search and GEO identities as a VDS9 precompiled semantic page.
 * @param {{language?:string,search:object,geo:object,html:string,provenance?:Array<object>}} input Page inputs.
 * @returns {object} Frozen precompiled page record.
 */
function createPageRecord({ language = 'es', search, geo, html, provenance = [] }) {
  return createPrecompiledSemanticPage({
    language,
    search,
    geo,
    html,
    provenance: provenance.length ? provenance : [
      { id: 'source-archive', evidenceIds: ['site-json', 'rendered-html', 'image-manifest'] }
    ]
  });
}

/**
 * Purpose: Determine a safe content type for a public asset based on its extension.
 * @param {string} filename Asset filename.
 * @returns {string} Content type.
 */
function contentTypeFor(filename) {
  const extension = path.extname(filename).toLowerCase();
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2',
    '.css': 'text/css; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
    '.json': 'application/json; charset=utf-8'
  };
  return types[extension] ?? 'application/octet-stream';
}

/**
 * Purpose: Build the public-asset artifact list from the human-owned CSS, image directory, fonts and favicons so the release remains self-contained.
 * @returns {Promise<Array<object>>} Public asset descriptors.
 */
async function collectPublicAssets() {
  const assets = [];
  const css = await readFile(path.join(__dirname, 'styles', 'site.css'), 'utf8');
  assets.push({ path: 'assets/site.css', content: css, contentType: 'text/css; charset=utf-8', encoding: 'utf8' });

  for (const directory of ['images', 'fonts']) {
    const absolute = path.join(PUBLIC_DIR, directory);
    const files = await readdir(absolute, { withFileTypes: true });
    for (const file of files.sort((a, b) => a.name.localeCompare(b.name))) {
      if (!file.isFile()) continue;
      const content = await readFile(path.join(absolute, file.name));
      assets.push({
        path: `assets/${directory}/${file.name}`,
        content: content.toString('base64'),
        contentType: contentTypeFor(file.name),
        encoding: 'base64'
      });
    }
  }

  for (const filename of ['favicon.png', 'apple-touch-icon.png']) {
    const content = await readFile(path.join(PUBLIC_DIR, filename));
    assets.push({
      path: filename,
      content: content.toString('base64'),
      contentType: contentTypeFor(filename),
      encoding: 'base64'
    });
  }

  return assets;
}

/**
 * Purpose: Remove a previous generated release and recreate its output directory without touching human-owned sources.
 * @param {string} directory Absolute output directory.
 * @returns {Promise<void>} Completion promise.
 */
async function cleanDirectory(directory) {
  await rm(directory, { recursive: true, force: true });
  await mkdir(directory, { recursive: true });
}

/**
 * Purpose: Write every compiled artifact to disk using the encoding declared by the VDS site compiler.
 * @param {{artifacts:Array<object>}} result Compiled site result.
 * @param {string} directory Absolute output directory.
 * @returns {Promise<{files:number,bytes:number}>} Written-file summary.
 */
async function writeDist(result, directory) {
  let files = 0;
  let bytes = 0;
  for (const artifact of result.artifacts) {
    const destination = path.join(directory, ...artifact.path.split('/'));
    await mkdir(path.dirname(destination), { recursive: true });
    const content = Buffer.from(artifact.content, artifact.encoding);
    await writeFile(destination, content);
    files += 1;
    bytes += content.length;
  }
  return { files, bytes };
}

/**
 * Purpose: Compile all pages, assets and governance artifacts into the static VDS9 release and write a build report.
 * @returns {Promise<void>} Completion promise.
 */
async function main() {
  const [siteData, legalData, images] = await Promise.all([
    loadJson('src/content/site.json'),
    loadJson('src/content/legal.json'),
    loadJson('src/content/images.json')
  ]);
  const data = { ...siteData, legal: legalData };
  const { site, nav } = data;

  const homeHtml = renderHomePage({ data, images });
  const servicesHtml = renderServicesPage({ data, images });
  const legalPages = Object.entries(legalData).map(([key, page]) => ({ key, page, html: renderLegalPage({ page, data }) }));

  const homeSearch = createPageManifest({
    title: 'Gemma Shivali | Terapia online y presencial en Sitges y Barcelona',
    description: site.description,
    canonicalPath: '/',
    intent: 'informational',
    role: 'home'
  });
  const servicesSearch = createPageManifest({
    title: 'Servicios | Programas, sesiones, talleres y retiros | Gemma Shivali',
    description: data.services.description,
    canonicalPath: '/nuestros-servicios/',
    intent: 'commercial',
    role: 'service',
    breadcrumbs: [
      { label: 'Inicio', path: '/' },
      { label: 'Servicios', path: '/nuestros-servicios/' }
    ],
    structuredDataTypes: ['WebSite', 'Person', 'WebPage', 'Service', 'FAQPage']
  });

  const precompiledPages = [
    createPageRecord({ search: homeSearch, geo: createHomeGeo(site), html: homeHtml }),
    createPageRecord({ search: servicesSearch, geo: createServicesGeo(site), html: servicesHtml }),
    ...legalPages.map(({ key, page, html }) => {
      const search = createPageManifest({
        title: `${page.title} | Gemma Shivali`,
        description: page.description,
        canonicalPath: page.slug,
        intent: 'informational',
        role: 'legal',
        breadcrumbs: [
          { label: 'Inicio', path: '/' },
          { label: page.title, path: page.slug }
        ]
      });
      return createPageRecord({ search, geo: createLegalGeo({ key, page }), html });
    })
  ];

  const publicAssets = await collectPublicAssets();
  const result = compileSite({
    siteOrigin: site.origin,
    siteName: site.name,
    siteDescription: site.description,
    pages: [],
    precompiledPages,
    rootPath: '/',
    includeLlmsTxt: true,
    includeKnowledgeIndex: true,
    publicAssets
  });

  await cleanDirectory(DIST_DIR);
  const written = await writeDist(result, DIST_DIR);
  const report = {
    protocol: result.protocol,
    siteOrigin: result.siteOrigin,
    generatedAt: result.generatedAt,
    pages: result.pages,
    architecture: result.architecture,
    publicAssets: result.publicAssets,
    artifacts: result.artifacts.map(artifact => ({ path: artifact.path, bytes: artifact.bytes, contentType: artifact.contentType })),
    written
  };
  await writeFile(path.join(PROJECT_ROOT, 'build-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(`VDS9 build complete: ${result.precompiledPages} pages, ${result.publicAssets} public assets, ${written.files} files, ${written.bytes} bytes`);
  console.log(`Output: ${DIST_DIR}`);
}

await main();

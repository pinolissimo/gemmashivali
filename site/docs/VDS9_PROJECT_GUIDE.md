# VDS Engine 9 Project Guide — Gemma Shivali

**Visual Design Studio — 2026-10**

## Engine model

VDS9 is a **performance-native, Search-native, AI-discovery-native and agent-operability-aware web intelligence engine**. SEO/GEO/performance/Agentic Browsing are architectural quality constraints, not post-production plugins.

## Core surfaces

### Page and rendering layer
Use VDS page documents and semantic compilation for indexable critical content. Components enhance the server/static HTML instead of replacing it.

### Search layer
Use Search Manifest data as the source for title/description, canonical, indexability, hreflang, structured data, sitemap membership, internal-link intent and retirement behavior.

### GEO / AI discovery
Represent entities, claims, answers and sources as explicit evidence. Machine-readable knowledge surfaces must agree with visible page content; never fabricate citations or schema claims.

### Performance layer
Respect VDS performance/enhancement budgets and Lighthouse quality gates. Optimize real rendering cost before adding animation or convenience JavaScript. Performance tactics remain evidence-driven: do not assume that a preload, asset format or CSS strategy is beneficial without measuring the resulting page.

### Agentic Browsing layer
Treat Lighthouse Agentic Browsing as a browser-runtime gate for machine interaction. Preserve the category's native x/y fraction semantics. A complete fraction is required on designated production-critical routes in both mobile and desktop profiles; static source checks alone cannot prove this stage.

### Governed runtime
Use bounded tools, policy/approval surfaces and audit evidence for agentic actions. A model recommendation is not authority to bypass a quality or deployment gate.

### Deployment
Production releases are immutable/content-addressed and must pass preflight, host verification and origin evidence. Do not patch immutable release files in place.

### Intelligence and experiments
Telemetry can become durable evidence, produce opportunities and feed experiment contracts. Randomized causal-grade outcomes require assignment attestation plus statistical evidence. Evidence classifications never directly authorize site mutation.

## Definition of done for agent work

A task is complete only when:

1. behavior is implemented at the correct source layer;
2. source comments/signatures pass the human-inspection standard;
3. relevant tests pass;
4. Search/GEO/performance/security invariants remain valid;
5. designated browser-runtime checks preserve a complete Agentic Browsing fraction on mobile and desktop;
6. human editing documentation is updated when the manual edit surface changes;
7. the agent reports what changed and where a programmer should look next.

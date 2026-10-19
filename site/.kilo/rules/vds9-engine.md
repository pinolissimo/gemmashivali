# VDS Engine 9 implementation rules

Project: **Gemma Shivali**. Owner: **Visual Design Studio**.

- Before coding, read the root `AGENTS.md` and the two VDS9 project guides.
- Never create an undocumented public function, class or method.
- Every editable JS/MJS/CJS/CSS/HTML source file requires the VDS signature, creation month and purpose header.
- Preserve semantic-first rendering and progressive enhancement.
- Prefer existing VDS9 contracts/components over parallel implementations.
- Any Search/GEO/performance/security/Agentic Browsing regression is a failed task even when the requested visual change works.
- Treat a complete Lighthouse Agentic Browsing fraction on both mobile and desktop as runtime evidence, not as a fabricated 0–100 score.
- Do not hard-code optimization tactics merely because they worked in another project; validate them against this project's browser evidence and budgets.
- Update tests when behavior changes.
- Update `docs/VDS9_HUMAN_EDITING_GUIDE.md` when adding a new manual edit surface.
- Do not place secrets in repository files.
- Do not edit generated build artifacts as the source of a permanent fix; locate and change their source.

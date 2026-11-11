# Chalk & Roots Standards Generator Plus

Branded K–12 standards-to-lesson builder. The front end preserves the campaign preview's official illustrated teacher avatar, warm cream/sage/terracotta palette, and two classroom outputs: **Teacher Plan** and **Student Handout**.

## Files
- `index.html` — responsive interface, exact-standard input, grade/course, subject, framework, duration/sequence, focus, materials/context, learner supports, editable output, copy, Word-compatible export, print-to-PDF, and PowerPoint export.
- `worker.js` — Cloudflare Worker backend. The OpenAI API key remains server-side.
- `wrangler.toml` — Worker configuration.

## Deploy
1. Deploy `worker.js` as a Cloudflare Worker named `chalk-roots-standards-generator-plus`.
2. Add secret `OPENAI_API_KEY` in Worker Settings → Variables and Secrets.
3. Add `OPENAI_MODEL` with a model available to your API project.
4. Add `ALLOWED_ORIGIN` with the exact front-end origin (no trailing slash).
5. In `index.html`, replace `https://YOUR-WORKER.workers.dev/` with the deployed Worker URL.
6. Deploy `index.html` to Cloudflare Pages or another static host.

Never put API keys in browser code or the repository. Keep this repository private.

## Exports
- Word-compatible `.doc` export includes both teacher and student formats.
- Print / Save as PDF prints the selected format.
- PowerPoint `.pptx` export uses PptxGenJS from jsDelivr and requires an internet connection.

## Scope and safeguards
Teachers must paste or verify exact standard wording. The AI does not certify alignment or replace an authoritative searchable standards database. The generator creates instructional drafts; teachers must verify standards, answer keys, grade-level fit, facts, accessibility, and local requirements. Add Cloudflare rate limiting / Turnstile, cost alerts, and usage controls before broad public release.

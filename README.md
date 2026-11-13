# Chalk & Roots Standards Generator Plus

Branded K–12 standards-to-lesson builder. The front end preserves the campaign preview's official illustrated teacher avatar, warm cream/sage/terracotta palette, and three classroom sections: **Lesson Plan**, **Student Practice**, and **Teacher Key**.

## Files
- `index.html` — responsive interface, exact-standard input, a searchable standards library, grade, subject, framework, exact standard wording, one-click generation, editable output, copy, Word-compatible export, PDF export, and editable PowerPoint export.
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
- PDF `.pdf` download includes all three sections: Lesson Plan, Student Practice, and Teacher Key, with page numbering.
- PowerPoint `.pptx` download includes all three sections and automatically paginates longer lessons.
- Word-compatible `.doc` export includes both classroom formats.
- Print selected format remains available as a separate browser print option.
- PDF and PowerPoint generation use browser libraries loaded from public CDNs, so an internet connection is required for those export buttons.

## Scope and safeguards
Teachers must paste or verify exact standard wording. The AI does not certify alignment or replace an authoritative searchable standards database. The generator creates instructional drafts; teachers must verify standards, answer keys, grade-level fit, facts, accessibility, and local requirements. Add Cloudflare rate limiting / Turnstile, cost alerts, and usage controls before broad public release.


## Persistent standards database (Cloudflare D1)

The initial seed contains the original nine curated Common Core ELA standards from the campaign-era library: RF.3.3c, RF.4.3a, RF.5.3a, RI.3.2, RI.4.2, RI.5.2, W.3.1, W.4.1, and W.5.1. The exact standard wording and official grade-level source pages are stored separately from teacher-friendly summaries and keywords.

### Provision and seed
1. In Cloudflare Dashboard → Workers & Pages → D1 SQL Database, create a database named `chalk-roots-standards`.
2. Copy its database ID into `wrangler.toml` where indicated.
3. Run `npx wrangler d1 execute chalk-roots-standards --remote --file=./schema.sql`.
4. Run `npx wrangler d1 execute chalk-roots-standards --remote --file=./seed.sql`.
5. Deploy the Worker. Add secret `DB_ADMIN_TOKEN` for authorized standard imports. Bind D1 as `DB`.

### API
- `GET /api/standards` — list standards.
- Search/filter: `?q=syllable&grade=4&subject=ELA&framework=CCSS&limit=50`.
- `POST /api/standards` — protected by `X-Admin-Token`; accepts one standard object or `{"standards":[...]}` (up to 500). Existing framework/jurisdiction/code entries are updated.
- Each record stores framework, jurisdiction, subject, grade, strand, code, title, exact wording, summary, keywords, official HTTPS source URL, source name, source-check date, and curated flag.

The API supports a growing, searchable standards library; it does not silently infer or generate official standard wording. Imports must include an official HTTPS source URL. The front-end search UI and authenticated admin import screen still need to be connected to these endpoints.

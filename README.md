# Cognit Portfolio Website

Production-ready single-page portfolio for **Cognit** — websites, mobile apps, AI automation, and WhatsApp automation.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Edit content (no component changes needed)

All editable copy and links live in `data/`:

| File | What to edit |
|---|---|
| `data/site.ts` | Name, location, WhatsApp, email, social links, form key, trust stats |
| `data/services.ts` | Service cards, timelines, featured package |
| `data/projects.ts` | Portfolio case studies |
| `data/faq.ts` | FAQ questions and answers |

Look for `// REPLACE:` and `// CONFIRM WITH OWNER` comments in code.

## Things to replace before going live

- [ ] **Owner name** in `data/site.ts`
- [ ] **City / location** in `data/site.ts`
- [ ] **WhatsApp number** and prefilled link in `data/site.ts`
- [ ] **Social media URLs** (Instagram, YouTube, LinkedIn, optional GitHub)
- [ ] **Web3Forms access key** in `data/site.ts` — sign up at [web3forms.com](https://web3forms.com)
- [ ] **Real projects** in `data/projects.ts` (replace sample projects)
- [ ] **Trust strip numbers** in `data/site.ts` (`trustStats`) — only use real numbers
- [ ] **Pricing** — currently shows "Get a free quote"; add tiers in `components/Pricing.tsx` if needed
- [ ] **FAQ pricing/timeline answers** marked `CONFIRM WITH OWNER`
- [ ] **OG share image** — replace `public/og-image.svg` with a 1200×630 PNG for best social previews

Testimonials section is **hidden** until you add real quotes (do not use fake testimonials).

## Deploy on Vercel (free)

1. Push this folder to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repo.
3. Framework preset: **Next.js**. Click **Deploy**.
4. In Vercel → **Settings → Domains**, add `cognit.co.in` and `www.cognit.co.in`.

### GoDaddy DNS records (typical Vercel setup)

| Type | Name | Value |
|---|---|---|
| `A` | `@` | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

Vercel may show different values in the domain setup screen — **use the exact records Vercel displays**.

5. Wait for DNS propagation (minutes to 48 hours).
6. SSL (https) is issued automatically — do not buy a paid certificate.
7. In Vercel, redirect `www` → root (or root → `www`, pick one).
8. Submit `https://cognit.co.in/sitemap.xml` in [Google Search Console](https://search.google.com/search-console).

### Deploy on Cloudflare Pages (alternative)

1. Connect repo in Cloudflare Pages.
2. Build command: `npm run build`
3. Output directory: `.next` is handled by Cloudflare's Next.js adapter, or use `@cloudflare/next-on-pages` if needed.
4. Add custom domain and DNS as Cloudflare instructs.

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4 with CSS variable design tokens
- Framer Motion, Lenis, GSAP + ScrollTrigger
- lucide-react icons
- Space Grotesk + Inter via `next/font`

## Scripts

```bash
npm run dev      # local development
npm run build    # production build
npm run start    # serve production build
npm run lint     # ESLint
```

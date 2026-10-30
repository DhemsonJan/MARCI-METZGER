# Marci Metzger — The Ridge Realty Group

**Live site → [marci-metzger-redesign-ruby.vercel.app](https://marci-metzger-redesign-ruby.vercel.app/)**

A single-page premium redesign of [marcimetzger.com](https://marcimetzger.com/) for Marci Metzger, REALTOR®, Pahrump, Nevada.

---

## Project layout

```
Marci Metzger/
└── marci-metzger-redesign/     ← the deployed site (Vercel "Root Directory")
    ├── index.html
    ├── style.css
    ├── script.js
    ├── Background Pictures/    section background photography
    └── images/                 hero, portrait, services, gallery, badges
```

## Run it locally

No build step, no package manager, no dependencies:

```bash
git clone https://github.com/DhemsonJan/MARCI-METZGER.git
cd "MARCI-METZGER/Marci Metzger/marci-metzger-redesign"
```

Then open `index.html` in a browser.

## Built with

- **Vanilla HTML, CSS and JavaScript** — no framework, no bundler, no runtime libraries.
- **Type:** Playfair Display (headings) + Inter (body), loaded from Google Fonts.
- **Palette:** gold `#d4af37`, sage `#7a8765`, bronze `#a08968` over a warm off-white ground.
- **Responsive** at 390 / 768 / 1024 / 1440 / 1920 px, with no horizontal overflow at any width.
- **Motion** is progressive enhancement only: scroll reveals, parallax, a count-up stats band and an auto-advancing gallery, all built with `IntersectionObserver` and CSS transitions. Everything resolves to a static, fully legible page under `prefers-reduced-motion: reduce` — and the opening screen reveals immediately even if the observer never fires.
- **Accessibility:** semantic landmarks, visible focus rings, `aria-current` scrollspy, labelled controls, decorative images marked appropriately, and a lightbox that closes on Escape, backdrop click, or button.
- **Contact form** is Formspree-ready — drop a form ID into the `action` attribute to enable email delivery. Until then the submit handler detects the placeholder and falls back to a `tel:` handoff, so the button always does something useful.

## Deployment

Vercel project is Git-linked to this repository's `main` branch, so every push redeploys automatically. Because the site lives in a subfolder, the project's **Root Directory** is set to `Marci Metzger/marci-metzger-redesign` — that setting is what makes the build resolve to the right files.

---

# Overview

The website is a modern real estate platform designed to showcase Marci Metzger's real estate services and help potential clients find their ideal properties in Pahrump, Nevada. The redesign focuses on creating a clean, professional, and user-friendly experience while making important information accessible to visitors.

The homepage introduces Marci Metzger and highlights her experience, achievements, and professional background. It includes several sections, such as an introduction, real estate performance statistics, property search functionality, a photo gallery featuring properties, and an overview of available real estate services.

The website also provides convenient contact options, allowing potential buyers and sellers to reach Marci directly through phone calls or a contact form. Additionally, it includes her office location, business hours, and Google Maps directions.

The overall goal of the redesign is to improve the presentation of the original real estate website by providing a more organized layout, visually appealing sections, accessible navigation, and a smoother browsing experience across different devices.

## Main Website Features

1. **Homepage / Hero Section** — Introduces Marci Metzger and establishes the website's identity.
2. **About Section** — Highlights her professional experience and achievements in real estate.
3. **Real Estate Statistics** — Displays sales performance and client-related achievements.
4. **Property Search** — Allows visitors to explore available properties using different search filters.
5. **Photo Gallery** — Showcases featured properties in Pahrump, Nevada.
6. **Services Section** — Presents residential, commercial, and real estate consultation services.
7. **Contact Section** — Provides direct communication through phone calls and a contact form.
8. **Office Location** — Displays the business address, operating hours, and Google Maps directions.

## Design notes

I redesigned the Marci Metzger - The Ridge Realty Group website to create a more modern, professional, and user-friendly experience. The website focuses on presenting real estate services, showcasing property listings, and making it easier for potential clients to connect with the realtor.

I organized the homepage into clear sections, including an introduction, professional achievements, property search, photo gallery, services, and contact information. I also focused on improving the visual presentation, navigation, and overall layout to make important information easier to find.

My main goal was to create a clean and responsive website that provides visitors with a convenient way to explore properties, learn about the realtor's services, and get in touch with her.

## Content and assets

Section backgrounds, the portrait, the property gallery and the trust badges all use the business's own photography and materials. Copy is grounded in Marci's published background and figures — no invented testimonials, awards or sales claims. Where the original site linked out (property search, listings), this build hands off to the live destination rather than duplicating it.

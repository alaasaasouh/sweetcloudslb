# Sweet Clouds

A static, mobile-first dessert menu built with HTML, CSS, and vanilla JavaScript.

## Open locally

Double-click `index.html`. No installation, build, account, or server is needed. Google Fonts needs an internet connection; readable local fallback fonts are provided. WhatsApp and Instagram require internet access.

## Upload to static hosting

Upload `index.html`, `styles.css`, `script.js`, `sweet-polish.css`, `sweet-motion.js`, and the complete `assets/` folder together. Keep the paths unchanged. On a live domain, set `og:image` to the absolute public URL of `assets/sweet_clouds_logo.png` for dependable social sharing previews.

The website uses the supplied images in `assets/`. The reference poster is retained as a reference; it is not used as the website layout. Original duplicate copies are preserved locally and excluded from Git.

## Editing

- Product prices are stored in integer cents in the `PRODUCTS` array in `script.js`. Update the matching visible HTML menu price when changing a price; keeping real HTML means the menu still works without JavaScript.
- Flavor names are in `FLAVORS`, with matching visible chips in `index.html`.
- Palette, typography, and responsive rules are in `styles.css`.
- Cart state is stored only in the visitor's browser when local storage is available. The site does not process payments or send messages automatically.
- WhatsApp opens a prepared message for the customer to review and send. Availability, delivery, customization, and final charges are confirmed by the business.
- The video-to-website skill and frame animation were intentionally not used. The source skill file remains untouched for later use.

## Verification checklist

- [x] All five products: Large Tray $20 (10–12 servings), Tiramisu Tin $13, Single-Serving Pot $3.50, Tiramisu Mug $14, Tiramisu Cake $20.
- [x] Classic included; Pot +$0.50 for a non-classic flavor; Tin, Cake, and Tray +$2 for one whole non-classic flavor, or +$1 per non-classic half when split (Classic + non-classic: +$1; two non-classic halves: +$2). Mug pricing unchanged.
- [x] Classic plus seven supplied flavor choices and original logo/photos.
- [x] No horizontal page overflow at 320, 375, 390, 768, and 1440 pixels in Chromium.
- [x] Correct Instagram and WhatsApp destinations in source.
- [x] Cart math: two tins with two non-classic flavors plus one non-classic pot = $34.00; changing tins to three = $49.00.
- [x] Add, edit, remove, refresh persistence, and disabled empty-order sending.
- [x] URL-encoded WhatsApp summary, confirmation request, and customer detail blanks.
- [x] Native dialog keyboard handling, Escape dismissal, accessible labels, visible focus rules, mobile menu closing.
- [x] No JavaScript page errors or broken product images in the browser checks.
- [x] Reduced-motion support and real HTML menu with direct WhatsApp links when JavaScript is unavailable.

`preview-390.png` and `preview-1440.png` are browser screenshots. `qa.cjs` is a developer-only browser verification script using the Playwright installation already present on the development machine; it is not a website dependency. Actual WhatsApp delivery was not tested and no message was sent. External account access and all-device compatibility cannot be verified by local browser checks.

## Creative polish

Added tactile 3D buttons, a recognizable WhatsApp icon, floating logo and decorative motion, flavor-selection sparkles, gentle desktop card tilt, and an animation pause control. Reduced-motion preferences are respected. Mobile now has larger tap targets, a compact dropdown menu, 16px form inputs to avoid focus zoom, safe-area spacing, and a cart bar visible only after adding items.

The updated Chromium checks passed at 320, 360, 375, 390, 430, 560, 768, 820, 1024, and 1440px widths. Additional checks cover the mobile cart bar, flavor preselection, dialog focus wrapping, animation pause, reduced motion, and the no-JavaScript ordering fallback. No page JavaScript errors were observed. `preview-mobile-top.png` and `preview-mobile-cart.png` show the updated mobile experience.

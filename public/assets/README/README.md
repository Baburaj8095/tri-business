# Trikonekt Merchant UI Assets

A lightweight, editable asset pack based on the warm ivory + orange premium light-theme direction in the provided mockup.

## Contents
- `backgrounds/merchant-home-warm-ivory.svg` — recommended default home background.
- `backgrounds/merchant-home-soft-gradient.svg` — cooler, soft-gradient alternative.
- `patterns/commerce-line-pattern.svg` — subtle commerce line-art texture; use at low opacity.
- `banners/prime-promotion-background.svg` — Prime/promotion banner background.
- `banners/special-deals-background.svg` — special deals banner background.
- `banners/ads-campaign-background.svg` — ads/campaign banner background.
- `css/trikonekt-theme.css` — color tokens, card shadows/radii and responsive grid starter.

## Recommended colors
- Brand orange: `#F5660A`
- Hover orange: `#E95500`
- Warm brand surface: `#FFF0E4`
- Main page background: `#F6F8FC`
- Card surface: `#FFFFFF`
- Main text: `#172033`
- Secondary text: `#697789`
- Border: `#E2E8F0`
- Success: `#14966B`
- Info: `#3478D4`
- Deals/violet: `#8156D9`

## Integration
1. Copy the asset folders into the app's public assets directory (for example `public/assets/`).
2. Import or adapt `css/trikonekt-theme.css` into the existing global stylesheet.
3. Use `.tri-page-background` on the home page's scrolling content container, not on a fixed header that must remain solid.
4. Keep background art subtle and behind content. Do not apply it to every card.
5. Use the provided SVGs as background layers; they are vector assets and can be resized without blur.

## Important
These are UI assets only. They contain no merchant data, product data, prices, wallet values, API calls, or business logic. Keep all displayed live data sourced from the existing backend APIs.

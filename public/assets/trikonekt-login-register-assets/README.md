# Trikonekt Login & Register Assets

Individual assets for the Trikonekt mobile-first web login and registration screens.

## Files
- `banners/login_banner.png` — wide shopping/rewards hero banner.
- `banners/register_banner.png` — registration hero banner crop from the generated asset sheet.
- `logos/` — app icon and logo crops. Replace with official brand files if available.
- `illustrations/` — individually cropped shopping, rewards, gift, phone and decorative assets.
- `backgrounds/` — decorative background crops.
- `shared-ui-assets/` — existing SVG banners, UI icons, navigation icons, illustrations and theme tokens.

## Integration suggestions
1. Copy the needed files into your project's `public/assets/trikonekt/auth/` directory (or the equivalent public assets directory).
2. Use the login banner on the login tab and the register banner on registration.
3. Use `object-fit: cover` and responsive container sizing for banners.
4. Keep banners decorative: render headings, forms, buttons, validation messages and progress steps as real HTML/React components, not baked into the image.
5. These generated crops are visual starter assets. Use official Trikonekt logo files for production brand fidelity.
6. Do not include personal information, API keys, OTPs or credentials in assets.

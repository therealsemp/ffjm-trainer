# User Story 5.1 — Home screen installation (Android)

## Epic
EPIC 5 — App installation

## Actor
Any visitor using Chrome on an Android phone

## User Story
**As a** user training on an Android phone,
**I want** to install FFJM Trainer on my home screen,
**so that** I can open it like an app, full screen, without going through the browser and typing or finding its address.

## Context / Business rules
- The site becomes an installable web app (PWA): it is **not** published on the Play Store. Installation goes through the browser itself.
- Installation is offered by Chrome on its own, once the site declares what it needs (name, icons, display mode): the "Installer l'application" entry in Chrome's ⋮ menu, and sometimes a small banner Chrome shows at the bottom of the screen on its own. The application adds **no install button or install help of its own**.
- Once installed:
  - the app has its own icon on the home screen and in the app drawer, labeled **"FFJM Trainer"**;
  - it opens **full screen** (no address bar, no browser controls), on the home page;
  - Android's own back gesture/button is the only "back" available besides the app's own links;
  - the system status bar takes the app's colors: the light theme's blue in light mode, the dark background in dark mode, following the theme actually in effect (system setting, or explicit choice from Story 1.4, including a change made while the app is open);
  - both portrait and landscape orientations are allowed (no lock), since wide figures and tables sometimes read better in landscape.
- The icon is the existing app icon (√ with a star on a blue background). Android crops launcher icons to its own shape (circle, rounded square...), so the icon must survive that cropping: the √ and the star stay fully visible, with no white ring around the icon.
- **No offline mode.** The installed app needs a network connection exactly like the website: without one, it does not start (the browser's own network error shows instead). Nothing about how questions or the app itself are loaded or cached changes.
- An installed app always runs the latest published version: no reinstall or manual update is ever needed after a new release.
- Installing changes nothing about the user's data: profile, ongoing session, statistics, favorites and mistakes are the same ones as in the browser on that phone (same storage), before and after installation.

## Acceptance criteria

### Scenario 1: Installation offered by Chrome
- **Given** a visitor opens the site in Chrome on Android
- **When** they open Chrome's ⋮ menu
- **Then** an "Installer l'application" entry is available (not only "Ajouter à l'écran d'accueil" as a plain bookmark shortcut)

### Scenario 2: Installed app on the home screen
- **Given** the user has installed the app
- **When** they look at their home screen or app drawer
- **Then** the FFJM Trainer icon is there, labeled "FFJM Trainer"
- **And** the icon fills the launcher's shape, with the √ and the star fully visible and no white ring around it

### Scenario 3: Full screen launch
- **Given** the app is installed
- **When** the user opens it from its icon
- **Then** it opens on the home page, full screen, with no address bar or browser controls
- **And** navigating between pages (training, archives, lists, account) stays inside the app window

### Scenario 4: Status bar colors follow the theme
- **Given** the installed app is open
- **When** the theme in effect is light (respectively dark)
- **Then** the status bar uses the light theme's blue (respectively the dark background)
- **And** changing the theme from the account page (Story 1.4) updates the status bar right away

### Scenario 5: Same data as the browser
- **Given** the user had a profile and an ongoing session in Chrome on this phone
- **When** they install the app and open it
- **Then** they find the same profile, session, statistics, favorites and mistakes

### Scenario 6: Always up to date
- **Given** the app is installed and a new version has since been published
- **When** the user opens the app (with a network connection)
- **Then** they get the new version, with nothing to reinstall

### Scenario 7: Orientation
- **Given** the installed app is open
- **When** the user rotates the phone
- **Then** the app follows the rotation

## Out of scope
- Offline use (no service worker, no extra caching of the app or of questions).
- iOS/iPhone: nothing specific is done (Safari's own "Sur l'écran d'accueil" may still work, but is neither tested nor documented in the app).
- An in-app install button or install instructions.
- Chrome's "richer install UI" (an install sheet with app screenshots, store-style): it needs screenshots declared in the manifest; without them Chrome shows its plain install dialog (icon, name, install button), which is enough here. Chrome DevTools flags the missing screenshots as suggestions, not errors.
- Publication on the Play Store or any other store.
- Push notifications.

## QA notes
- Test on a real Android phone with Chrome, against the deployed site (installation requires HTTPS and the site's real `/ffjm-trainer/` path; a local dev server over plain HTTP on another device is not representative).
- Check the icon on at least one launcher with round icons.
- Check that an installed app opened after a new tag deployment shows the new version.
- Check the status bar in light and dark, both via the system setting and via an explicit choice on the account page.

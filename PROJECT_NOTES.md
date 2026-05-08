# Animated Portfolio - Project Notes

Last verified: April 27, 2026

## Overview
- Single-page animated portfolio website.
- Built as a static frontend project with no backend dependency.

## Tech Stack
- HTML5
- CSS3
- Vanilla JavaScript
- `vanilla-tilt` via CDN

## Key Files
- `index.html`: main portfolio layout and content sections.
- `styles.css`: visual style, layout, and animations.
- `script.js`: scroll animations and typewriter effect.

## Features
- Hero section with animated intro.
- Experience and education timeline.
- Featured projects section.
- Contact footer with mail and LinkedIn links.
- Scroll reveal animations and tilt card effects.

## UI/UX Upgrade (Completed)
- Futuristic visual system refreshed with:
  - New gradient atmosphere and animated glow blobs.
  - Upgraded typography pairing (`Orbitron` + `Space Grotesk`) for a stronger sci-fi identity.
  - Enhanced glass navigation with animated scan sweep.
  - Refined cards, tags, buttons, and timeline interactions with glow-driven hover states.
  - Improved responsive layout behavior for tablet and mobile screens.

## Local Run
1. Open `index.html` directly in a browser, or
2. Serve folder with any static server.

Example:
```bash
cd animated-portfolio
python3 -m http.server 8080
```
Then open `http://localhost:8080`.

## Validation Status
- JavaScript syntax check passed:
```bash
node --check script.js
```
- Manual runtime check: static page loads correctly with updated styling.

## Git Status
- This folder is currently not initialized as its own git repository.

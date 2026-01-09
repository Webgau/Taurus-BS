# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Taurus-BS is a static site generator using HTML templates, Bootstrap 5.3.8 and Bootstrap Icons 1.13.1. PHP 8.4 compiles templates at build time to static HTML output.

## Development Environment

- **URL:** http://localhost/Taurus-BS/public/
- **Webserver:** Apache
- **PHP Version:** 8.4 (build script only, no runtime PHP)

## Build Commands

```bash
npm run build        # Build all (CSS + JS + HTML)
npm run build:css    # Minify CSS (clean-css)
npm run build:js     # Minify JS (terser)
npm run build:html   # Compile HTML templates (php build.php)
npm run watch        # Watch for changes
npm run dev          # Build + watch
```

## Project Structure

```
src/
├── assets/
│   ├── css/
│   │   ├── app.css              # Main entry (imports core/*.css)
│   │   └── core/
│   │       ├── _theme.css       # Bootstrap CSS variables (light/dark)
│   │       ├── _layout.css      # 4 layout variants + sidebar-cover
│   │       └── _dev-panel.css   # Dev tools styling
│   └── js/
│       ├── app.js               # ThemeSwitcher module
│       └── dev-panel.js         # Layout/viewport debugger
├── layouts/
│   └── base.html                # Master template with {{placeholders}}
├── pages/                       # Page content → public/*.html
└── partials/
    ├── header.html              # Navbar + theme toggle
    ├── sidenav.html             # Sidebar + cover + navigation
    └── dev-panel.html           # Developer tools offcanvas

public/                          # Web root (generated output)
build.php                        # Template compiler
```

## Template System

**Layout placeholders** (`src/layouts/base.html`):
- `{{title}}`, `{{header}}`, `{{sidenav}}`, `{{devpanel}}`, `{{content}}`

**Page front matter** (`src/pages/**/*.html`):
```html
<!--
title: Page Title
-->
<h1>Page Content</h1>
```

**Output naming:** `default_*.html` → `index.html`, others keep filename.

## Layout System

4 switchable layouts via `data-layout` attribute on `<body>`:

| Layout | Header Position | Style |
|--------|-----------------|-------|
| 1 | Right of sidebar | Card panels (rounded, shadow, margins) |
| 2 | Full-width top | Card panels |
| 3 | Right of sidebar | Flush (edge-to-edge, no margins) |
| 4 | Full-width top | Flush (DEFAULT) |

CSS Grid-based in `_layout.css`. Mobile: sidebar becomes offcanvas drawer.

## Theme System

- **Attribute:** `data-bs-theme="light|dark"` on `<html>`
- **Storage:** `localStorage.taurus-theme` (light/dark/auto)
- **Module:** `ThemeSwitcher` in app.js
- **Variables:** `_theme.css` defines all Bootstrap CSS variables for both modes

## Key Conventions

- CSS partials: prefix with `_` (e.g., `_theme.css`)
- Icons: `<i class="bi bi-{icon-name}"></i>`
- Assets: relative paths from public root (`assets/css/`, `assets/js/`, `assets/img/`)
- Layout persistence: `localStorage.taurus-layout`

/**
 * Taurus App Scripts
 * Main entry point - imports and initializes all modules
 */

'use strict';

import * as ThemeSwitcher from './core/theme-switcher.js';
import * as DevPanel from './core/dev-panel.js';
import * as CursorGlow from './core/cursor-glow.js';
import * as Sidenav from './core/sidenav.js';
import * as Header from './core/header.js';

// Initialize theme switcher immediately (before DOMContentLoaded to prevent flash)
ThemeSwitcher.init();

// Initialize dev panel (restores layout before DOM ready)
DevPanel.init();

// Initialize cursor glow effect
CursorGlow.init();

// Initialize sidenav menu
Sidenav.init();

// Initialize header (expandable search)
Header.init();

document.addEventListener('DOMContentLoaded', () => {
    console.log('Taurus App initialized');
});

// Export for potential external use
export { ThemeSwitcher, DevPanel, CursorGlow, Sidenav, Header };

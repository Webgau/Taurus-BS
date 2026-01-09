/**
 * Theme Switcher Module
 * Handles light/dark/auto theme switching with localStorage persistence
 */

const STORAGE_KEY = 'taurus-theme';

/**
 * Get stored theme preference or default to 'auto'
 */
const getStoredTheme = () => localStorage.getItem(STORAGE_KEY);

/**
 * Store theme preference
 */
const setStoredTheme = (theme) => localStorage.setItem(STORAGE_KEY, theme);

/**
 * Get preferred theme based on system preference
 */
const getPreferredTheme = () => {
    const stored = getStoredTheme();
    if (stored) return stored;
    return 'auto';
};

/**
 * Resolve 'auto' to actual theme based on system preference
 */
const resolveTheme = (theme) => {
    if (theme === 'auto') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
};

/**
 * Apply theme to document
 */
const applyTheme = (theme) => {
    const resolved = resolveTheme(theme);
    document.documentElement.setAttribute('data-bs-theme', resolved);
};

/**
 * Update toggle button icon based on current theme
 */
const updateToggleIcon = (theme) => {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;

    const iconEl = toggle.querySelector('.theme-icon-active');
    if (!iconEl) return;

    const icons = {
        light: 'bi-sun-fill',
        dark: 'bi-moon-stars-fill',
        auto: 'bi-circle-half'
    };

    // Remove all theme icon classes
    iconEl.className = 'bi theme-icon-active';
    iconEl.classList.add(icons[theme] || icons.auto);
};

/**
 * Update active state in dropdown menu
 */
const updateActiveState = (theme) => {
    const buttons = document.querySelectorAll('[data-bs-theme-value]');
    buttons.forEach(btn => {
        const isActive = btn.getAttribute('data-bs-theme-value') === theme;
        btn.classList.toggle('active', isActive);
        btn.querySelector('.bi-check2')?.classList.toggle('d-none', !isActive);
    });
};

/**
 * Set theme and update UI
 */
export const setTheme = (theme) => {
    setStoredTheme(theme);
    applyTheme(theme);
    updateToggleIcon(theme);
    updateActiveState(theme);
};

/**
 * Initialize theme switcher
 */
export const init = () => {
    const theme = getPreferredTheme();

    // Apply theme immediately
    applyTheme(theme);

    // Wait for DOM to update UI elements
    document.addEventListener('DOMContentLoaded', () => {
        updateToggleIcon(theme);
        updateActiveState(theme);

        // Bind click events to theme buttons
        document.querySelectorAll('[data-bs-theme-value]').forEach(btn => {
            btn.addEventListener('click', () => {
                const newTheme = btn.getAttribute('data-bs-theme-value');
                setTheme(newTheme);
            });
        });
    });

    // Listen for system theme changes when 'auto' is selected
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const stored = getStoredTheme();
        if (stored === 'auto' || !stored) {
            applyTheme('auto');
        }
    });
};

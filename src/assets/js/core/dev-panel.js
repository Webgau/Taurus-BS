/**
 * Dev Panel Module
 * Developer tools for layout and viewport debugging
 */

// Bootstrap breakpoints
const breakpoints = {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1400
};

/**
 * Get current breakpoint based on window width
 */
const getBreakpoint = (width) => {
    if (width >= breakpoints.xxl) return 'xxl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    return 'xs';
};

/**
 * Update viewport display
 */
const updateViewport = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const breakpoint = getBreakpoint(width);

    // Update size display
    const sizeEl = document.getElementById('devViewportSize');
    if (sizeEl) {
        sizeEl.textContent = `${width} × ${height}`;
    }

    // Update breakpoint badge
    const bpEl = document.getElementById('devViewportBreakpoint');
    if (bpEl) {
        bpEl.textContent = breakpoint;
    }

    // Update breakpoint bar
    document.querySelectorAll('.dev-breakpoint-segment').forEach(seg => {
        const segBp = seg.getAttribute('data-bp');
        seg.classList.toggle('active', segBp === breakpoint);
    });
};

/**
 * Update theme display
 */
const updateTheme = () => {
    const themeEl = document.getElementById('devThemeValue');
    if (themeEl) {
        const stored = localStorage.getItem('taurus-theme') || 'auto';
        const actual = document.documentElement.getAttribute('data-bs-theme') || 'light';
        themeEl.textContent = stored === 'auto' ? `auto (${actual})` : stored;
    }
};

/**
 * Update layout buttons
 */
const updateLayoutButtons = () => {
    const currentLayout = document.body.getAttribute('data-layout') || '4';
    document.querySelectorAll('.dev-layout-btn').forEach(btn => {
        const layout = btn.getAttribute('data-layout');
        btn.classList.toggle('active', layout === currentLayout);
    });
};

/**
 * Set layout
 */
export const setLayout = (layout) => {
    document.body.setAttribute('data-layout', layout);
    localStorage.setItem('taurus-layout', layout);
    updateLayoutButtons();
};

/**
 * Initialize dev panel
 */
export const init = () => {
    // Restore saved layout
    const savedLayout = localStorage.getItem('taurus-layout');
    if (savedLayout) {
        document.body.setAttribute('data-layout', savedLayout);
    }

    document.addEventListener('DOMContentLoaded', () => {
        // Initial updates
        updateViewport();
        updateTheme();
        updateLayoutButtons();

        // Layout button clicks
        document.querySelectorAll('.dev-layout-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const layout = btn.getAttribute('data-layout');
                setLayout(layout);
            });
        });

        // Watch for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.attributeName === 'data-bs-theme') {
                    updateTheme();
                }
            });
        });
        observer.observe(document.documentElement, { attributes: true });
    });

    // Viewport resize handler (debounced)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateViewport, 50);
    });
};

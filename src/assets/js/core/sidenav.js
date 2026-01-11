/**
 * Sidenav Menu Module
 * Handles submenu toggle, mobile sidebar, minify mode, scroll memory,
 * and accessibility features (focus trap, keyboard navigation)
 */

'use strict';

// Configuration
const config = {
    animationTime: 250,
    minifyStorageKey: 'taurus-sidebar-minified',
    scrollMemoryKey: 'taurus-sidebar-scroll',
    mobileBreakpoint: 992
};

// Selectors
const selectors = {
    app: 'body',
    sidebar: '.layout-sidebar',
    sidebarId: '#sidebar',
    layoutHeader: '.layout-header',
    layoutMain: '.layout-main',
    menu: '.menu',
    menuItem: '.menu-item',
    menuLink: '.menu-link',
    menuSubmenu: '.menu-submenu',
    mobileToggle: '[data-toggle="sidebar-mobile"]',
    mobileDismiss: '[data-dismiss="sidebar-mobile"]',
    mobileBackdrop: '.sidebar-mobile-backdrop',
    minifyToggle: '[data-toggle="sidebar-minify"]',
    focusableElements: 'a[href]:not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
};

// CSS Classes
const classes = {
    hasSub: 'has-sub',
    active: 'active',
    expand: 'expand',
    closed: 'closed',
    minified: 'app-sidebar-minified',
    mobileToggled: 'app-sidebar-mobile-toggled',
    mobileClosed: 'app-sidebar-mobile-closed',
    hide: 'd-none'
};

// State
let focusTrapActive = false;
let lastFocusedElement = null;

/**
 * Slide Up Animation
 */
const slideUp = (element, duration = config.animationTime) => {
    if (element.classList.contains('transitioning')) return;

    element.classList.add('transitioning');
    element.style.transitionProperty = 'height, margin, padding';
    element.style.transitionDuration = duration + 'ms';
    element.style.boxSizing = 'border-box';
    element.style.height = element.offsetHeight + 'px';
    element.offsetHeight; // Force reflow
    element.style.overflow = 'hidden';
    element.style.height = 0;
    element.style.paddingTop = 0;
    element.style.paddingBottom = 0;
    element.style.marginTop = 0;
    element.style.marginBottom = 0;

    setTimeout(() => {
        element.style.display = 'none';
        element.style.removeProperty('height');
        element.style.removeProperty('padding-top');
        element.style.removeProperty('padding-bottom');
        element.style.removeProperty('margin-top');
        element.style.removeProperty('margin-bottom');
        element.style.removeProperty('overflow');
        element.style.removeProperty('transition-duration');
        element.style.removeProperty('transition-property');
        element.classList.remove('transitioning');
    }, duration);
};

/**
 * Slide Down Animation
 */
const slideDown = (element, duration = config.animationTime) => {
    if (element.classList.contains('transitioning')) return;

    element.classList.add('transitioning');
    element.style.removeProperty('display');

    let display = getComputedStyle(element).display;
    if (display === 'none') display = 'block';
    element.style.display = display;

    const height = element.offsetHeight;
    element.style.overflow = 'hidden';
    element.style.height = 0;
    element.style.paddingTop = 0;
    element.style.paddingBottom = 0;
    element.style.marginTop = 0;
    element.style.marginBottom = 0;
    element.offsetHeight; // Force reflow
    element.style.boxSizing = 'border-box';
    element.style.transitionProperty = 'height, margin, padding';
    element.style.transitionDuration = duration + 'ms';
    element.style.height = height + 'px';
    element.style.removeProperty('padding-top');
    element.style.removeProperty('padding-bottom');
    element.style.removeProperty('margin-top');
    element.style.removeProperty('margin-bottom');

    setTimeout(() => {
        element.style.removeProperty('height');
        element.style.removeProperty('overflow');
        element.style.removeProperty('transition-duration');
        element.style.removeProperty('transition-property');
        element.classList.remove('transitioning');
    }, duration);
};

/**
 * Slide Toggle
 */
const slideToggle = (element, duration = config.animationTime) => {
    if (getComputedStyle(element).display === 'none') {
        return slideDown(element, duration);
    }
    return slideUp(element, duration);
};

/**
 * Get all focusable elements within sidebar
 */
const getFocusableElements = () => {
    const sidebar = document.querySelector(selectors.sidebar);
    if (!sidebar) return [];
    return [...sidebar.querySelectorAll(selectors.focusableElements)];
};

/**
 * Focus Trap - keeps focus within sidebar when open on mobile
 */
const trapFocus = (e) => {
    if (!focusTrapActive) return;

    const focusable = getFocusableElements();
    if (focusable.length === 0) return;

    const firstElement = focusable[0];
    const lastElement = focusable[focusable.length - 1];

    if (e.key === 'Tab') {
        if (e.shiftKey) {
            // Shift + Tab: if on first element, wrap to last
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            // Tab: if on last element, wrap to first
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }
};

/**
 * Handle Escape key to close mobile sidebar
 */
const handleEscapeKey = (e) => {
    if (e.key === 'Escape' && document.body.classList.contains(classes.mobileToggled)) {
        closeMobileSidebar();
    }
};

/**
 * Open Mobile Sidebar with accessibility
 */
const openMobileSidebar = () => {
    const sidebar = document.querySelector(selectors.sidebar);
    const layoutHeader = document.querySelector(selectors.layoutHeader);
    const layoutMain = document.querySelector(selectors.layoutMain);
    const backdrop = document.querySelector(selectors.mobileBackdrop);
    const toggleButtons = document.querySelectorAll(selectors.mobileToggle);

    // Store last focused element for restoration
    lastFocusedElement = document.activeElement;

    // Add body classes
    document.body.classList.add(classes.mobileToggled);
    document.body.classList.remove(classes.mobileClosed);

    // Set ARIA attributes on sidebar
    if (sidebar) {
        sidebar.setAttribute('aria-hidden', 'false');
    }

    // Update toggle button aria-expanded
    toggleButtons.forEach(btn => btn.setAttribute('aria-expanded', 'true'));

    // Set inert on background content
    if (layoutHeader) {
        layoutHeader.setAttribute('inert', '');
        layoutHeader.setAttribute('aria-hidden', 'true');
    }
    if (layoutMain) {
        layoutMain.setAttribute('inert', '');
        layoutMain.setAttribute('aria-hidden', 'true');
    }

    // Show backdrop
    if (backdrop) {
        backdrop.setAttribute('aria-hidden', 'false');
    }

    // Activate focus trap and escape handler
    focusTrapActive = true;
    document.addEventListener('keydown', trapFocus);
    document.addEventListener('keydown', handleEscapeKey);

    // Focus first focusable element in sidebar after animation
    requestAnimationFrame(() => {
        const focusable = getFocusableElements();
        if (focusable.length > 0) {
            focusable[0].focus();
        }
    });
};

/**
 * Close Mobile Sidebar with accessibility cleanup
 */
const closeMobileSidebar = () => {
    const sidebar = document.querySelector(selectors.sidebar);
    const layoutHeader = document.querySelector(selectors.layoutHeader);
    const layoutMain = document.querySelector(selectors.layoutMain);
    const backdrop = document.querySelector(selectors.mobileBackdrop);
    const toggleButtons = document.querySelectorAll(selectors.mobileToggle);

    // Remove body classes
    document.body.classList.remove(classes.mobileToggled);
    document.body.classList.add(classes.mobileClosed);

    // Reset ARIA attributes on sidebar
    if (sidebar) {
        sidebar.setAttribute('aria-hidden', 'true');
    }

    // Update toggle button aria-expanded
    toggleButtons.forEach(btn => btn.setAttribute('aria-expanded', 'false'));

    // Remove inert from background content
    if (layoutHeader) {
        layoutHeader.removeAttribute('inert');
        layoutHeader.removeAttribute('aria-hidden');
    }
    if (layoutMain) {
        layoutMain.removeAttribute('inert');
        layoutMain.removeAttribute('aria-hidden');
    }

    // Hide backdrop
    if (backdrop) {
        backdrop.setAttribute('aria-hidden', 'true');
    }

    // Deactivate focus trap and escape handler
    focusTrapActive = false;
    document.removeEventListener('keydown', trapFocus);
    document.removeEventListener('keydown', handleEscapeKey);

    // Restore focus to trigger element
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
    }
};

/**
 * Update ARIA attributes on submenu toggle
 */
const updateSubmenuAria = (menuItem, isExpanded) => {
    const link = menuItem.querySelector(':scope > .menu-link');
    if (link) {
        link.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    }
};

/**
 * Handle Sidebar Menu Toggle
 */
const handleMenuToggle = (links, duration) => {
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            const submenu = link.nextElementSibling;
            if (!submenu) return;

            // Close other submenus at the same level
            links.forEach(otherLink => {
                const otherSubmenu = otherLink.nextElementSibling;
                if (otherSubmenu && otherSubmenu !== submenu) {
                    slideUp(otherSubmenu, duration);
                    const otherItem = otherSubmenu.closest(selectors.menuItem);
                    if (otherItem) {
                        otherItem.classList.remove(classes.expand);
                        otherItem.classList.add(classes.closed);
                        updateSubmenuAria(otherItem, false);
                    }
                }
            });

            // Toggle current submenu
            const menuItem = submenu.closest(selectors.menuItem);
            const isCurrentlyExpanded = menuItem.classList.contains(classes.expand) ||
                (menuItem.classList.contains(classes.active) && !submenu.style.display);

            if (isCurrentlyExpanded) {
                menuItem.classList.remove(classes.expand);
                menuItem.classList.add(classes.closed);
                updateSubmenuAria(menuItem, false);
                slideToggle(submenu, duration);
            } else {
                menuItem.classList.add(classes.expand);
                menuItem.classList.remove(classes.closed);
                updateSubmenuAria(menuItem, true);
                slideToggle(submenu, duration);
            }
        });
    });
};

/**
 * Initialize Sidebar Menu
 */
const initSidebarMenu = () => {
    const duration = config.animationTime;

    // Level 1 menu items with submenu
    const level1Selector = `${selectors.sidebar} ${selectors.menu} > ${selectors.menuItem}.${classes.hasSub}`;
    const level1Links = document.querySelectorAll(`${level1Selector} > ${selectors.menuLink}`);
    if (level1Links.length) handleMenuToggle([...level1Links], duration);

    // Level 2 menu items with submenu
    const level2Selector = `${level1Selector} > ${selectors.menuSubmenu} > ${selectors.menuItem}.${classes.hasSub}`;
    const level2Links = document.querySelectorAll(`${level2Selector} > ${selectors.menuLink}`);
    if (level2Links.length) handleMenuToggle([...level2Links], duration);

    // Level 3 menu items with submenu
    const level3Selector = `${level2Selector} > ${selectors.menuSubmenu} > ${selectors.menuItem}.${classes.hasSub}`;
    const level3Links = document.querySelectorAll(`${level3Selector} > ${selectors.menuLink}`);
    if (level3Links.length) handleMenuToggle([...level3Links], duration);
};

/**
 * Initialize Mobile Sidebar Toggle
 */
const initMobileSidebarToggle = () => {
    // Open sidebar
    document.querySelectorAll(selectors.mobileToggle).forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            openMobileSidebar();
        });
    });

    // Close sidebar (dismiss buttons)
    document.querySelectorAll(selectors.mobileDismiss).forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            closeMobileSidebar();
        });
    });

    // Close on backdrop click
    const backdrop = document.querySelector(selectors.mobileBackdrop);
    if (backdrop) {
        backdrop.addEventListener('click', (e) => {
            e.preventDefault();
            closeMobileSidebar();
        });
    }

    // Remove closed class after animation
    const sidebar = document.querySelector(selectors.sidebar);
    if (sidebar) {
        sidebar.addEventListener('animationend', () => {
            document.body.classList.remove(classes.mobileClosed);
        });
    }

    // Handle resize: close sidebar if resizing to desktop
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (window.innerWidth >= config.mobileBreakpoint &&
                document.body.classList.contains(classes.mobileToggled)) {
                closeMobileSidebar();
            }
        }, 100);
    });
};

/**
 * Initialize Sidebar Minify
 */
const initSidebarMinify = () => {
    document.querySelectorAll(selectors.minifyToggle).forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            let isMinified = false;

            if (document.body.classList.contains(classes.minified)) {
                document.body.classList.remove(classes.minified);
                button.setAttribute('aria-pressed', 'false');
            } else {
                document.body.classList.add(classes.minified);
                button.setAttribute('aria-pressed', 'true');
                isMinified = true;
            }

            try {
                localStorage.setItem(config.minifyStorageKey, isMinified);
            } catch (err) {
                // LocalStorage not available
            }
        });
    });

    // Restore minified state from localStorage
    try {
        const isMinified = localStorage.getItem(config.minifyStorageKey) === 'true';
        if (isMinified) {
            document.body.classList.add(classes.minified);
            document.querySelectorAll(selectors.minifyToggle).forEach(btn => {
                btn.setAttribute('aria-pressed', 'true');
            });
        }
    } catch (err) {
        // LocalStorage not available
    }
};

/**
 * Set Active Menu Item based on current URL
 */
const setActiveMenuItem = () => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // Remove existing active classes
    document.querySelectorAll(`${selectors.sidebar} .${classes.active}`).forEach(el => {
        el.classList.remove(classes.active);
    });

    // Find matching link
    const menuLinks = document.querySelectorAll(`${selectors.sidebar} ${selectors.menuLink}`);

    menuLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            // Mark this item as active
            const menuItem = link.closest(selectors.menuItem);
            if (menuItem) {
                menuItem.classList.add(classes.active);

                // Open parent submenus and update ARIA
                let parent = menuItem.parentElement;
                while (parent) {
                    if (parent.classList && parent.classList.contains('menu-submenu')) {
                        const parentMenuItem = parent.closest(selectors.menuItem);
                        if (parentMenuItem && parentMenuItem.classList.contains(classes.hasSub)) {
                            parentMenuItem.classList.add(classes.active);
                            updateSubmenuAria(parentMenuItem, true);
                            // Show the submenu
                            parent.style.display = 'block';
                        }
                    }
                    parent = parent.parentElement;
                }
            }
        }
    });
};

/**
 * Initialize Scroll Memory
 */
const initScrollMemory = () => {
    if (window.innerWidth < config.mobileBreakpoint) return;

    const sidebar = document.querySelector(selectors.sidebar);
    if (!sidebar) return;

    try {
        // Save scroll position (debounced)
        let scrollTimeout;
        sidebar.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                localStorage.setItem(config.scrollMemoryKey, sidebar.scrollTop);
            }, 100);
        });

        // Restore scroll position
        const savedPosition = localStorage.getItem(config.scrollMemoryKey);
        if (savedPosition) {
            sidebar.scrollTop = parseInt(savedPosition, 10);
        }
    } catch (err) {
        // LocalStorage not available
    }
};

/**
 * Set initial ARIA state for mobile
 */
const initMobileAriaState = () => {
    if (window.innerWidth < config.mobileBreakpoint) {
        const sidebar = document.querySelector(selectors.sidebar);
        if (sidebar) {
            sidebar.setAttribute('aria-hidden', 'true');
        }
    }
};

/**
 * Initialize all sidenav functionality
 */
export const init = () => {
    const setup = () => {
        setActiveMenuItem();
        initSidebarMenu();
        initMobileSidebarToggle();
        initSidebarMinify();
        initScrollMemory();
        initMobileAriaState();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setup);
    } else {
        setup();
    }
};

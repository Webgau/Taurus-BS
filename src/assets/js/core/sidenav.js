/**
 * Sidenav Menu Module
 * Handles submenu toggle, mobile sidebar, minify mode, and scroll memory
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
    menu: '.menu',
    menuItem: '.menu-item',
    menuLink: '.menu-link',
    menuSubmenu: '.menu-submenu',
    mobileToggle: '[data-toggle="sidebar-mobile"]',
    mobileDismiss: '[data-dismiss="sidebar-mobile"]',
    mobileBackdrop: '.sidebar-mobile-backdrop',
    minifyToggle: '[data-toggle="sidebar-minify"]'
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
                    }
                }
            });

            // Toggle current submenu
            const menuItem = submenu.closest(selectors.menuItem);
            if (menuItem.classList.contains(classes.expand) ||
                (menuItem.classList.contains(classes.active) && !submenu.style.display)) {
                menuItem.classList.remove(classes.expand);
                menuItem.classList.add(classes.closed);
                slideToggle(submenu, duration);
            } else {
                menuItem.classList.add(classes.expand);
                menuItem.classList.remove(classes.closed);
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
            document.body.classList.add(classes.mobileToggled);
            document.body.classList.remove(classes.mobileClosed);
        });
    });

    // Close sidebar
    document.querySelectorAll(selectors.mobileDismiss).forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            document.body.classList.remove(classes.mobileToggled);
            document.body.classList.add(classes.mobileClosed);
        });
    });

    // Also close on backdrop click
    const backdrop = document.querySelector(selectors.mobileBackdrop);
    if (backdrop) {
        backdrop.addEventListener('click', (e) => {
            e.preventDefault();
            document.body.classList.remove(classes.mobileToggled);
            document.body.classList.add(classes.mobileClosed);
        });
    }

    // Remove closed class after animation
    const sidebar = document.querySelector(selectors.sidebar);
    if (sidebar) {
        sidebar.addEventListener('animationend', () => {
            document.body.classList.remove(classes.mobileClosed);
        });
    }
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
            } else {
                document.body.classList.add(classes.minified);
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
        if (localStorage.getItem(config.minifyStorageKey) === 'true') {
            document.body.classList.add(classes.minified);
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

                // Open parent submenus
                let parent = menuItem.parentElement;
                while (parent) {
                    if (parent.classList && parent.classList.contains('menu-submenu')) {
                        const parentMenuItem = parent.closest(selectors.menuItem);
                        if (parentMenuItem && parentMenuItem.classList.contains(classes.hasSub)) {
                            parentMenuItem.classList.add(classes.active);
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
        // Save scroll position
        sidebar.addEventListener('scroll', () => {
            localStorage.setItem(config.scrollMemoryKey, sidebar.scrollTop);
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
 * Initialize all sidenav functionality
 */
export const init = () => {
    const setup = () => {
        setActiveMenuItem();
        initSidebarMenu();
        initMobileSidebarToggle();
        initSidebarMinify();
        initScrollMemory();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setup);
    } else {
        setup();
    }
};

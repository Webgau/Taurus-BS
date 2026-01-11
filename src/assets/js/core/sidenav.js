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
let floatSubmenuElement = null;
let floatSubmenuTimeout = null;
let floatSubmenuPinned = false;

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
 * Hide Float Submenu
 */
const hideFloatSubmenu = () => {
    if (floatSubmenuTimeout) {
        clearTimeout(floatSubmenuTimeout);
        floatSubmenuTimeout = null;
    }
    if (floatSubmenuElement) {
        floatSubmenuElement.remove();
        floatSubmenuElement = null;
    }
    floatSubmenuPinned = false;
    document.removeEventListener('click', handleClickOutsideFloatSubmenu);
};

/**
 * Handle click outside Float Submenu to close it
 */
const handleClickOutsideFloatSubmenu = (e) => {
    if (!floatSubmenuElement) return;

    // Check if click is outside the float submenu and outside the sidebar
    const sidebar = document.querySelector(selectors.sidebar);
    const isInsideFloatSubmenu = floatSubmenuElement.contains(e.target);
    const isInsideSidebar = sidebar && sidebar.contains(e.target);

    if (!isInsideFloatSubmenu && !isInsideSidebar) {
        hideFloatSubmenu();
    }
};

/**
 * Get height of a hidden element
 */
const getHiddenMenuHeight = (element) => {
    element.setAttribute('style', 'position: absolute; visibility: hidden; display: block !important');
    const height = element.clientHeight;
    element.removeAttribute('style');
    return height;
};

/**
 * SlideToggle animation for nested submenus
 */
const floatSubmenuSlideToggle = (element, duration = 250) => {
    if (window.getComputedStyle(element).display === 'none') {
        // Slide Down
        element.style.display = 'block';
        element.style.overflow = 'hidden';
        const height = element.scrollHeight;
        element.style.height = '0px';
        element.offsetHeight; // Force reflow
        element.style.transition = `height ${duration}ms ease-in-out`;
        element.style.height = `${height}px`;

        setTimeout(() => {
            element.style.height = '';
            element.style.overflow = '';
            element.style.transition = '';
        }, duration);
    } else {
        // Slide Up
        element.style.overflow = 'hidden';
        element.style.height = `${element.scrollHeight}px`;
        element.offsetHeight; // Force reflow
        element.style.transition = `height ${duration}ms ease-in-out`;
        element.style.height = '0px';

        setTimeout(() => {
            element.style.display = 'none';
            element.style.height = '';
            element.style.overflow = '';
            element.style.transition = '';
        }, duration);
    }
};

/**
 * Handle clicks on nested submenu links inside float submenu
 * Based on reference: docs/collapse-menu.js handleSidebarMinifyFloatMenuClick()
 */
const handleFloatSubmenuClick = () => {
    if (!floatSubmenuElement) return;

    const nestedLinks = floatSubmenuElement.querySelectorAll(
        `.sidebar-float-submenu .${classes.hasSub} > .menu-link`
    );

    nestedLinks.forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();

            const parentItem = link.closest(`.${classes.hasSub}`);
            const submenu = parentItem?.querySelector('.menu-submenu');
            if (!submenu) return;

            const isExpanded = window.getComputedStyle(submenu).display !== 'none';
            const isCollapsed = window.getComputedStyle(submenu).display === 'none';

            // Toggle animation
            floatSubmenuSlideToggle(submenu);

            // Toggle expand class
            if (isExpanded) {
                parentItem.classList.remove(classes.expand);
            } else {
                parentItem.classList.add(classes.expand);
            }

            // Update positioning during animation
            const updateInterval = setInterval(() => {
                if (!floatSubmenuElement) {
                    clearInterval(updateInterval);
                    return;
                }

                const arrow = floatSubmenuElement.querySelector('.sidebar-float-submenu-arrow');
                const line = floatSubmenuElement.querySelector('.sidebar-float-submenu-line');
                if (!arrow || !line) return;

                const submenuHeight = floatSubmenuElement.clientHeight;
                const floatRect = floatSubmenuElement.getBoundingClientRect();
                const originalTop = parseFloat(floatSubmenuElement.getAttribute('data-offset-top') || floatRect.top);
                const menuOffsetTop = parseFloat(floatSubmenuElement.getAttribute('data-menu-offset-top') || originalTop);
                const bodyHeight = document.body.clientHeight;

                // If expanding and menu moves up, keep it at original position
                if (isExpanded && floatRect.top > originalTop) {
                    floatSubmenuElement.style.top = `${originalTop}px`;
                    floatSubmenuElement.style.bottom = 'auto';
                    arrow.style.top = '20px';
                    arrow.style.bottom = 'auto';
                    line.style.top = '20px';
                    line.style.bottom = 'auto';
                }

                // If collapsing and not enough space below
                if (isCollapsed && bodyHeight - floatRect.top < submenuHeight) {
                    const bottomOffset = bodyHeight - menuOffsetTop - 22;
                    floatSubmenuElement.style.top = 'auto';
                    floatSubmenuElement.style.bottom = '0';
                    arrow.style.top = 'auto';
                    arrow.style.bottom = `${bottomOffset}px`;
                    line.style.top = '20px';
                    line.style.bottom = `${bottomOffset}px`;
                }
            }, 1);

            // Stop updating after animation
            setTimeout(() => clearInterval(updateInterval), config.animationTime);
        };
    });
};

/**
 * Show Float Submenu on hover (minified mode only)
 * Based on reference: docs/collapse-menu.js
 */
const showFloatSubmenu = (menuLink, submenu) => {
    // Clear timeout
    if (floatSubmenuTimeout) {
        clearTimeout(floatSubmenuTimeout);
        floatSubmenuTimeout = null;
    }

    const submenuContent = submenu.innerHTML;
    if (!submenuContent) {
        hideFloatSubmenu();
        return;
    }

    // Get sidebar for positioning
    const sidebar = document.querySelector(selectors.sidebar);
    if (!sidebar) return;

    const sidebarRect = sidebar.getBoundingClientRect();
    const sidebarWidth = sidebar.clientWidth;
    const leftPosition = sidebarRect.left + sidebarWidth;
    const submenuHeight = getHiddenMenuHeight(submenu);
    const topPosition = menuLink.getBoundingClientRect().top;
    const bodyHeight = document.body.clientHeight;

    // Check if we need overflow scrolling
    const needsOverflow = submenuHeight > bodyHeight;
    const overflowClass = needsOverflow ? ' overflow-scroll' : '';

    // Check if existing float submenu is for same element
    if (floatSubmenuElement && floatSubmenuElement.getAttribute('data-source') === menuLink.id) {
        // Update content only
        const content = floatSubmenuElement.querySelector('.sidebar-float-submenu');
        if (content) content.innerHTML = submenuContent;
    } else {
        // Remove existing
        hideFloatSubmenu();

        // Create new float submenu
        floatSubmenuElement = document.createElement('div');
        floatSubmenuElement.className = 'sidebar-float-submenu-container';
        floatSubmenuElement.id = 'sidebar-float-submenu';
        floatSubmenuElement.setAttribute('data-offset-top', topPosition);
        floatSubmenuElement.setAttribute('data-menu-offset-top', topPosition);

        floatSubmenuElement.innerHTML = `
            <div class="sidebar-float-submenu-arrow" id="sidebar-float-submenu-arrow"></div>
            <div class="sidebar-float-submenu-line" id="sidebar-float-submenu-line"></div>
            <div class="sidebar-float-submenu${overflowClass}">${submenuContent}</div>
        `;

        document.body.appendChild(floatSubmenuElement);

        // Mouse events to keep open
        floatSubmenuElement.onmouseover = () => {
            if (floatSubmenuTimeout) {
                clearTimeout(floatSubmenuTimeout);
                floatSubmenuTimeout = null;
            }
        };

        floatSubmenuElement.onmouseout = () => {
            // Only auto-close if not pinned
            if (!floatSubmenuPinned) {
                floatSubmenuTimeout = setTimeout(hideFloatSubmenu, config.animationTime);
            }
        };

        // Click inside pins the submenu open
        floatSubmenuElement.onclick = (e) => {
            floatSubmenuPinned = true;
            // Clear any pending close timeout
            if (floatSubmenuTimeout) {
                clearTimeout(floatSubmenuTimeout);
                floatSubmenuTimeout = null;
            }
        };

        // Click outside closes the submenu
        setTimeout(() => {
            document.addEventListener('click', handleClickOutsideFloatSubmenu);
        }, 10);
    }

    // Get actual height after adding to DOM
    const actualHeight = floatSubmenuElement.clientHeight;
    const arrow = floatSubmenuElement.querySelector('.sidebar-float-submenu-arrow');
    const line = floatSubmenuElement.querySelector('.sidebar-float-submenu-line');

    // Position based on available space (exact copy from reference)
    if (bodyHeight - topPosition > actualHeight) {
        // Enough space below - position from top
        floatSubmenuElement.style.top = `${topPosition}px`;
        floatSubmenuElement.style.left = `${leftPosition}px`;
        floatSubmenuElement.style.bottom = 'auto';
        floatSubmenuElement.style.right = 'auto';

        if (arrow) {
            arrow.style.top = '20px';
            arrow.style.bottom = 'auto';
        }
        if (line) {
            line.style.top = '20px';
            line.style.bottom = 'auto';
        }
    } else {
        // Not enough space - position from bottom
        const bottomOffset = bodyHeight - topPosition - 21;

        floatSubmenuElement.style.top = 'auto';
        floatSubmenuElement.style.left = `${leftPosition}px`;
        floatSubmenuElement.style.bottom = '0';
        floatSubmenuElement.style.right = 'auto';

        if (arrow) {
            arrow.style.top = 'auto';
            arrow.style.bottom = `${bottomOffset}px`;
        }
        if (line) {
            line.style.top = '20px';
            line.style.bottom = `${bottomOffset}px`;
        }
    }

    // Initialize click handlers for nested submenus
    handleFloatSubmenuClick();
};

/**
 * Initialize Float Submenu for minified mode
 */
const initFloatSubmenu = () => {
    const sidebar = document.querySelector(selectors.sidebar);
    if (!sidebar) return;

    // Get all top-level menu links with submenus
    const menuLinks = sidebar.querySelectorAll(
        `${selectors.menu} > ${selectors.menuItem}.${classes.hasSub} > ${selectors.menuLink}`
    );

    menuLinks.forEach((link, index) => {
        // Give each link an ID for tracking
        if (!link.id) link.id = `sidebar-menu-link-${index}`;

        link.addEventListener('mouseenter', function() {
            // Only in minified mode on desktop
            if (!document.body.classList.contains(classes.minified)) return;
            if (window.innerWidth < config.mobileBreakpoint) return;

            const menuItem = this.closest(`.${classes.hasSub}`);
            const submenu = menuItem?.querySelector('.menu-submenu');
            if (!submenu) return;

            showFloatSubmenu(this, submenu);
        });

        link.addEventListener('mouseleave', function() {
            if (!document.body.classList.contains(classes.minified)) return;

            // Don't auto-close if submenu is pinned
            if (floatSubmenuPinned) return;

            floatSubmenuTimeout = setTimeout(() => {
                const line = document.querySelector('#sidebar-float-submenu-line');
                if (line) line.remove();
            }, 250);
        });
    });

    // Hide on minify toggle
    document.querySelectorAll(selectors.minifyToggle).forEach(btn => {
        btn.addEventListener('click', hideFloatSubmenu);
    });

    // Hide on scroll
    sidebar.addEventListener('scroll', hideFloatSubmenu);

    // Hide on resize
    window.addEventListener('resize', hideFloatSubmenu);
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

    // Level 4 menu items with submenu
    const level4Selector = `${level3Selector} > ${selectors.menuSubmenu} > ${selectors.menuItem}.${classes.hasSub}`;
    const level4Links = document.querySelectorAll(`${level4Selector} > ${selectors.menuLink}`);
    if (level4Links.length) handleMenuToggle([...level4Links], duration);

    // Level 5 menu items with submenu
    const level5Selector = `${level4Selector} > ${selectors.menuSubmenu} > ${selectors.menuItem}.${classes.hasSub}`;
    const level5Links = document.querySelectorAll(`${level5Selector} > ${selectors.menuLink}`);
    if (level5Links.length) handleMenuToggle([...level5Links], duration);
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
        initFloatSubmenu();
        initScrollMemory();
        initMobileAriaState();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setup);
    } else {
        setup();
    }
};

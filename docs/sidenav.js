/**
 * FeuerwehrManager Sidebar/Sidenav JavaScript
 * Extracted and cleaned up for reuse in other projects
 *
 * Features:
 * - Sidebar menu toggle (expand/collapse)
 * - Mobile sidebar toggle
 * - Sidebar minify (collapse to icons only)
 * - Profile dropdown toggle
 * - Float submenu for minified mode
 * - Sidebar search/filter
 * - Scroll memory (remembers scroll position)
 *
 * Requires:
 * - Bootstrap 5.x (for collapse functionality)
 * - PerfectScrollbar (optional, for custom scrollbars)
 */

(function() {
    'use strict';

    // Configuration
    const config = {
        animationTime: 250,
        minifyToggleCookieName: 'app-sidebar-minified',
        scrollMemoryKey: 'appSidebarScrollPosition',
        breakpoints: {
            mobile: 768,
            tablet: 992
        }
    };

    // Selectors
    const selectors = {
        app: '.app',
        sidebar: '.app-sidebar',
        sidebarBg: '.app-sidebar-bg',
        sidebarContent: '.app-sidebar-content',
        menu: '.menu',
        menuItem: '.menu-item',
        menuLink: '.menu-link',
        menuSubmenu: '.menu-submenu',
        menuProfile: '.menu-profile',
        menuHeader: '.menu-header',
        menuSearch: '.menu-search',
        mobileToggle: '[data-toggle="app-sidebar-mobile"]',
        mobileDismiss: '[data-dismiss="app-sidebar-mobile"]',
        mobileBackdrop: '.app-sidebar-mobile-backdrop',
        minifyToggle: '[data-toggle="app-sidebar-minify"]',
        profileToggle: '[data-toggle="app-sidebar-profile"]',
        searchInput: '[data-sidebar-search="true"]',
        scrollbar: '[data-scrollbar="true"]',
        floatSubmenu: '#app-sidebar-float-submenu'
    };

    // CSS Classes
    const classes = {
        hasSubClass: 'has-sub',
        activeClass: 'active',
        expandClass: 'expand',
        expandingClass: 'expanding',
        closingClass: 'closing',
        closedClass: 'closed',
        minifiedClass: 'app-sidebar-minified',
        mobileToggledClass: 'app-sidebar-mobile-toggled',
        mobileClosedClass: 'app-sidebar-mobile-closed',
        hideClass: 'd-none',
        foundClass: 'has-text'
    };

    // Utility: Slide Up Animation
    function slideUp(element, duration = config.animationTime) {
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

        window.setTimeout(() => {
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
    }

    // Utility: Slide Down Animation
    function slideDown(element, duration = config.animationTime) {
        if (element.classList.contains('transitioning')) return;

        element.classList.add('transitioning');
        element.style.removeProperty('display');

        let display = window.getComputedStyle(element).display;
        if (display === 'none') display = 'block';
        element.style.display = display;

        let height = element.offsetHeight;
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

        window.setTimeout(() => {
            element.style.removeProperty('height');
            element.style.removeProperty('overflow');
            element.style.removeProperty('transition-duration');
            element.style.removeProperty('transition-property');
            element.classList.remove('transitioning');
        }, duration);
    }

    // Utility: Slide Toggle
    function slideToggle(element, duration = config.animationTime) {
        if (window.getComputedStyle(element).display === 'none') {
            return slideDown(element, duration);
        }
        return slideUp(element, duration);
    }

    // Utility: Set Cookie
    function setCookie(name, value) {
        const date = new Date();
        date.setTime(date.getTime() + 3600000); // 1 hour
        document.cookie = name + '=' + value + ';expires=' + date.toUTCString() + ';path=/';
    }

    // Utility: Get Cookie
    function getCookie(name) {
        const cookieName = name + '=';
        const decodedCookie = decodeURIComponent(document.cookie);
        const cookies = decodedCookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.indexOf(cookieName) === 0) {
                return cookie.substring(cookieName.length, cookie.length);
            }
        }
        return '';
    }

    // Handle Sidebar Menu Toggle
    function handleSidebarMenuToggle(links, duration) {
        links.forEach(link => {
            link.onclick = function(e) {
                e.preventDefault();

                const submenu = this.nextElementSibling;

                // Close other submenus at the same level
                links.forEach(otherLink => {
                    const otherSubmenu = otherLink.nextElementSibling;
                    if (otherSubmenu !== submenu) {
                        slideUp(otherSubmenu, duration);
                        otherSubmenu.closest(selectors.menuItem).classList.remove(classes.expandClass);
                        otherSubmenu.closest(selectors.menuItem).classList.add(classes.closedClass);
                    }
                });

                // Toggle current submenu
                const menuItem = submenu.closest(selectors.menuItem);
                if (menuItem.classList.contains(classes.expandClass) ||
                    (menuItem.classList.contains(classes.activeClass) && !submenu.style.display)) {
                    menuItem.classList.remove(classes.expandClass);
                    menuItem.classList.add(classes.closedClass);
                    slideToggle(submenu, duration);
                } else {
                    menuItem.classList.add(classes.expandClass);
                    menuItem.classList.remove(classes.closedClass);
                    slideToggle(submenu, duration);
                }
            };
        });
    }

    // Initialize Sidebar Menu
    function initSidebarMenu() {
        const sidebar = document.querySelector(selectors.sidebar);
        const duration = config.animationTime;

        // Level 1 menu items with submenu
        const level1Selector = `${selectors.sidebar} ${selectors.menu} > ${selectors.menuItem}.${classes.hasSubClass}`;
        const level1Links = document.querySelectorAll(`${level1Selector} > ${selectors.menuLink}`);
        if (level1Links.length) handleSidebarMenuToggle([...level1Links], duration);

        // Level 2 menu items with submenu
        const level2Selector = `${level1Selector} > ${selectors.menuSubmenu} > ${selectors.menuItem}.${classes.hasSubClass}`;
        const level2Links = document.querySelectorAll(`${level2Selector} > ${selectors.menuLink}`);
        if (level2Links.length) handleSidebarMenuToggle([...level2Links], duration);

        // Level 3 menu items with submenu
        const level3Selector = `${level2Selector} > ${selectors.menuSubmenu} > ${selectors.menuItem}.${classes.hasSubClass}`;
        const level3Links = document.querySelectorAll(`${level3Selector} > ${selectors.menuLink}`);
        if (level3Links.length) handleSidebarMenuToggle([...level3Links], duration);
    }

    // Initialize Mobile Sidebar Toggle
    function initMobileSidebarToggle() {
        // Open sidebar
        document.querySelectorAll(selectors.mobileToggle).forEach(button => {
            button.onclick = function(e) {
                e.preventDefault();
                const app = document.querySelector(selectors.app);
                app.classList.add(classes.mobileToggledClass);
                app.classList.remove(classes.mobileClosedClass);
            };
        });

        // Close sidebar
        document.querySelectorAll(selectors.mobileDismiss).forEach(button => {
            button.onclick = function(e) {
                e.preventDefault();
                const app = document.querySelector(selectors.app);
                app.classList.remove(classes.mobileToggledClass);
                app.classList.add(classes.mobileClosedClass);
            };
        });

        // Remove closed class after animation
        document.querySelectorAll(selectors.sidebar).forEach(sidebar => {
            sidebar.addEventListener('animationend', function() {
                document.querySelector(selectors.app).classList.remove(classes.mobileClosedClass);
            });
        });
    }

    // Initialize Sidebar Minify
    function initSidebarMinify() {
        document.querySelectorAll(selectors.minifyToggle).forEach(button => {
            button.onclick = function(e) {
                e.preventDefault();
                const app = document.querySelector(selectors.app);
                let isMinified = false;

                if (app.classList.contains(classes.minifiedClass)) {
                    app.classList.remove(classes.minifiedClass);
                } else {
                    app.classList.add(classes.minifiedClass);
                    isMinified = true;
                }

                // Remove float submenu if exists
                const floatSubmenu = document.querySelector(selectors.floatSubmenu);
                if (floatSubmenu) floatSubmenu.remove();

                setCookie(config.minifyToggleCookieName, isMinified);
            };
        });

        // Restore minified state from cookie
        if (getCookie(config.minifyToggleCookieName) === 'true') {
            const app = document.querySelector(selectors.app);
            if (app) app.classList.add(classes.minifiedClass);
        }
    }

    // Initialize Profile Toggle
    function initProfileToggle() {
        const profileToggle = document.querySelector(selectors.profileToggle);
        if (!profileToggle) return;

        profileToggle.onclick = function(e) {
            e.preventDefault();
            const profile = this.closest(selectors.menuProfile);
            const targetSelector = this.getAttribute('data-target');
            const target = document.querySelector(targetSelector);

            if (target) {
                if (target.style.display === 'block') {
                    profile.classList.remove(classes.activeClass);
                } else {
                    profile.classList.add(classes.activeClass);
                }
                slideToggle(target, config.animationTime);
                target.classList.toggle(classes.expandClass);
            }
        };
    }

    // Initialize Sidebar Search
    function initSidebarSearch() {
        document.querySelectorAll(selectors.searchInput).forEach(input => {
            input.onkeyup = function() {
                const searchValue = this.value.toLowerCase();
                const sidebar = document.querySelector(selectors.sidebar);

                if (searchValue) {
                    // Hide all menu items initially
                    const allItems = sidebar.querySelectorAll(`${selectors.menu} > ${selectors.menuItem}:not(${selectors.menuProfile}):not(${selectors.menuHeader}):not(${selectors.menuSearch}), ${selectors.menuSubmenu} > ${selectors.menuItem}`);
                    allItems.forEach(item => item.classList.add(classes.hideClass));

                    // Remove previous found classes
                    sidebar.querySelectorAll('.' + classes.foundClass).forEach(item => {
                        item.classList.remove(classes.foundClass);
                    });

                    // Remove expand classes
                    sidebar.querySelectorAll('.' + classes.expandClass).forEach(item => {
                        item.classList.remove(classes.expandClass);
                    });

                    // Search through menu links
                    const menuLinks = sidebar.querySelectorAll(`${selectors.menu} > ${selectors.menuItem}:not(${selectors.menuProfile}):not(${selectors.menuHeader}):not(${selectors.menuSearch}) > ${selectors.menuLink}, ${selectors.menuSubmenu} > ${selectors.menuItem} > ${selectors.menuLink}`);

                    menuLinks.forEach(link => {
                        const text = link.textContent.toLowerCase();
                        if (text.includes(searchValue)) {
                            // Show matching item
                            let menuItem = link.closest(selectors.menuItem);
                            if (menuItem) {
                                menuItem.classList.remove(classes.hideClass);
                                menuItem.classList.add(classes.foundClass);
                            }

                            // Show parent submenus
                            let submenu = link.closest(selectors.menuSubmenu);
                            if (submenu) {
                                submenu.style.display = 'block';
                                let parentItem = submenu.closest(`.${classes.hasSubClass}:not(.${classes.foundClass})`);
                                if (parentItem) {
                                    parentItem.classList.remove(classes.hideClass);
                                    parentItem.classList.add(classes.expandClass);

                                    // Check for grandparent
                                    let grandparent = parentItem.closest(`.${classes.hasSubClass}:not(.${classes.foundClass})`);
                                    if (grandparent) {
                                        grandparent.classList.remove(classes.hideClass);
                                        grandparent.classList.add(classes.expandClass);
                                    }
                                }
                            }
                        }
                    });
                } else {
                    // Reset search - show all items
                    const submenus = sidebar.querySelectorAll(`${selectors.menu} > ${selectors.menuItem}.${classes.hasSubClass} ${selectors.menuSubmenu}`);
                    submenus.forEach(submenu => submenu.removeAttribute('style'));

                    const allItems = sidebar.querySelectorAll(`${selectors.menu} > ${selectors.menuItem}:not(${selectors.menuProfile}):not(${selectors.menuHeader}):not(${selectors.menuSearch})`);
                    allItems.forEach(item => item.classList.remove(classes.hideClass));

                    const submenuItems = sidebar.querySelectorAll(`${selectors.menuSubmenu} > ${selectors.menuItem}`);
                    submenuItems.forEach(item => item.classList.remove(classes.hideClass));

                    sidebar.querySelectorAll('.' + classes.expandClass).forEach(item => {
                        item.classList.remove(classes.expandClass);
                    });
                }
            };
        });
    }

    // Initialize Scroll Memory
    function initScrollMemory() {
        if (window.innerWidth < config.breakpoints.mobile) return;

        try {
            const scrollContainer = document.querySelector(`${selectors.sidebar} ${selectors.scrollbar}`);
            if (!scrollContainer) return;

            // Save scroll position
            scrollContainer.addEventListener('scroll', function() {
                localStorage.setItem(config.scrollMemoryKey, this.scrollTop);
            });

            // Restore scroll position
            const savedPosition = localStorage.getItem(config.scrollMemoryKey);
            if (savedPosition) {
                scrollContainer.scrollTop = savedPosition;
            }
        } catch (e) {
            console.log('LocalStorage not available:', e);
        }
    }

    // Initialize Page Scroll Class (adds class when page is scrolled)
    function initPageScrollClass() {
        const app = document.querySelector(selectors.app);
        if (!app) return;

        function updateScrollClass() {
            if (window.scrollY > 0) {
                app.classList.add('has-scroll');
            } else {
                app.classList.remove('has-scroll');
            }
        }

        window.addEventListener('scroll', updateScrollClass);
        updateScrollClass();
    }

    // Main Initialization
    function init() {
        initSidebarMenu();
        initMobileSidebarToggle();
        initSidebarMinify();
        initProfileToggle();
        initSidebarSearch();
        initScrollMemory();
        initPageScrollClass();
    }

    // Auto-init when DOM is ready
    if (document.readyState !== 'loading') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }

    // Expose for manual initialization
    window.SidenavInit = init;
    window.SidenavConfig = config;

})();

/**
 * Header Module
 * Handles expandable search and other header interactions
 */

'use strict';

const selectors = {
    searchExpandable: '.header-search-expandable',
    searchToggle: '.header-search-toggle',
    searchField: '.header-search-field',
    searchInput: '.header-search-input',
    searchClose: '.header-search-close'
};

const classes = {
    expanded: 'expanded'
};

let searchContainer = null;
let searchToggle = null;
let searchInput = null;
let searchClose = null;

/**
 * Open the search field
 */
function openSearch() {
    if (!searchContainer) return;

    searchContainer.classList.add(classes.expanded);
    searchToggle?.setAttribute('aria-expanded', 'true');

    // Focus input after animation
    setTimeout(() => {
        searchInput?.focus();
    }, 150);
}

/**
 * Close the search field
 */
function closeSearch() {
    if (!searchContainer) return;

    searchContainer.classList.remove(classes.expanded);
    searchToggle?.setAttribute('aria-expanded', 'false');

    // Clear input
    if (searchInput) {
        searchInput.value = '';
    }
}

/**
 * Toggle search field
 */
function toggleSearch() {
    if (searchContainer?.classList.contains(classes.expanded)) {
        closeSearch();
    } else {
        openSearch();
    }
}

/**
 * Handle click outside to close search
 */
function handleClickOutside(e) {
    if (!searchContainer?.classList.contains(classes.expanded)) return;

    if (!searchContainer.contains(e.target)) {
        closeSearch();
    }
}

/**
 * Handle keyboard events
 */
function handleKeydown(e) {
    // Escape closes search
    if (e.key === 'Escape' && searchContainer?.classList.contains(classes.expanded)) {
        closeSearch();
        searchToggle?.focus();
    }

    // Cmd/Ctrl+K opens search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
    }
}

/**
 * Initialize header functionality
 */
export function init() {
    document.addEventListener('DOMContentLoaded', () => {
        searchContainer = document.querySelector(selectors.searchExpandable);
        searchToggle = document.querySelector(selectors.searchToggle);
        searchInput = document.querySelector(selectors.searchInput);
        searchClose = document.querySelector(selectors.searchClose);

        if (!searchContainer) return;

        // Toggle button click
        searchToggle?.addEventListener('click', openSearch);

        // Close button click
        searchClose?.addEventListener('click', closeSearch);

        // Click outside to close
        document.addEventListener('click', handleClickOutside);

        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeydown);
    });
}

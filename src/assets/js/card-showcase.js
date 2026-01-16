/**
 * Card Showcase Module
 * Handles card effects (3D tilt) and drag-and-drop sorting
 */

const CardShowcase = (function() {
    'use strict';

    // Configuration
    const CONFIG = {
        tiltMaxAngle: 15,
        tiltPerspective: 1000,
        tiltSpeed: 400,
        sortableAnimation: 200
    };

    // State
    let sortableInstance = null;

    /**
     * Initialize all card effects
     */
    function init() {
        initTiltCards();
        initSortable();
        initCardAnimations();
    }

    /**
     * 3D Tilt Effect for .card-tilt elements
     */
    function initTiltCards() {
        const tiltCards = document.querySelectorAll('.card-tilt');

        tiltCards.forEach(card => {
            const shine = card.querySelector('.card-tilt-shine');

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -CONFIG.tiltMaxAngle;
                const rotateY = ((x - centerX) / centerX) * CONFIG.tiltMaxAngle;

                card.style.transform = `perspective(${CONFIG.tiltPerspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

                // Update shine position
                if (shine) {
                    const percentX = (x / rect.width) * 100;
                    const percentY = (y / rect.height) * 100;
                    shine.style.setProperty('--mouse-x', `${percentX}%`);
                    shine.style.setProperty('--mouse-y', `${percentY}%`);
                }
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
            });
        });
    }

    /**
     * Initialize Sortable.js for drag-and-drop
     */
    function initSortable() {
        const container = document.querySelector('.card-showcase');
        if (!container) return;

        // Check if SortableJS is available
        if (typeof Sortable === 'undefined') {
            console.warn('SortableJS not loaded. Drag-and-drop disabled.');
            return;
        }

        sortableInstance = new Sortable(container, {
            animation: CONFIG.sortableAnimation,
            handle: '.card-drag-handle',
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',

            onStart: function(evt) {
                document.body.style.cursor = 'grabbing';
            },

            onEnd: function(evt) {
                document.body.style.cursor = '';

                // Save order to localStorage
                saveCardOrder();

                // Dispatch custom event
                container.dispatchEvent(new CustomEvent('cards-reordered', {
                    detail: {
                        oldIndex: evt.oldIndex,
                        newIndex: evt.newIndex
                    }
                }));
            }
        });

        // Restore saved order
        restoreCardOrder();
    }

    /**
     * Save card order to localStorage
     */
    function saveCardOrder() {
        const container = document.querySelector('.card-showcase');
        if (!container) return;

        const cards = container.querySelectorAll('.card-showcase-item');
        const order = Array.from(cards).map(card => card.dataset.cardId);

        localStorage.setItem('taurus-card-order', JSON.stringify(order));
    }

    /**
     * Restore card order from localStorage
     */
    function restoreCardOrder() {
        const container = document.querySelector('.card-showcase');
        if (!container) return;

        const savedOrder = localStorage.getItem('taurus-card-order');
        if (!savedOrder) return;

        try {
            const order = JSON.parse(savedOrder);
            const cards = container.querySelectorAll('.card-showcase-item');
            const cardMap = new Map();

            cards.forEach(card => {
                cardMap.set(card.dataset.cardId, card);
            });

            // Reorder cards
            order.forEach(id => {
                const card = cardMap.get(id);
                if (card) {
                    container.appendChild(card);
                }
            });
        } catch (e) {
            console.warn('Could not restore card order:', e);
        }
    }

    /**
     * Initialize entrance animations
     */
    function initCardAnimations() {
        const cards = document.querySelectorAll('.card-showcase-item');

        // Staggered entrance animation
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';

            setTimeout(() => {
                card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 50 + (index * 80));
        });
    }

    /**
     * Reset card order
     */
    function resetOrder() {
        localStorage.removeItem('taurus-card-order');
        location.reload();
    }

    /**
     * Get current card order
     */
    function getOrder() {
        const container = document.querySelector('.card-showcase');
        if (!container) return [];

        const cards = container.querySelectorAll('.card-showcase-item');
        return Array.from(cards).map(card => card.dataset.cardId);
    }

    // Public API
    return {
        init,
        resetOrder,
        getOrder
    };
})();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', CardShowcase.init);
} else {
    CardShowcase.init();
}

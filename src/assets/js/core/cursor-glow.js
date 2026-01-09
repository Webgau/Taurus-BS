/**
 * Cursor Glow Module
 * Subtle lamp/spotlight effect following the cursor
 */

'use strict';

let glowElement = null;

/**
 * Create the glow element
 */
const createGlowElement = () => {
    glowElement = document.createElement('div');
    glowElement.className = 'cursor-glow';
    document.body.appendChild(glowElement);
};

/**
 * Update glow position
 */
const updatePosition = (e) => {
    if (!glowElement) return;

    requestAnimationFrame(() => {
        glowElement.style.left = `${e.clientX}px`;
        glowElement.style.top = `${e.clientY}px`;
    });
};

/**
 * Show glow on mouse enter
 */
const showGlow = () => {
    if (glowElement) {
        glowElement.style.opacity = '1';
    }
};

/**
 * Hide glow on mouse leave
 */
const hideGlow = () => {
    if (glowElement) {
        glowElement.style.opacity = '0';
    }
};

/**
 * Initialize cursor glow
 */
export const init = () => {
    const setup = () => {
        createGlowElement();
        document.addEventListener('mousemove', updatePosition);
        document.addEventListener('mouseenter', showGlow);
        document.addEventListener('mouseleave', hideGlow);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setup);
    } else {
        setup();
    }
};

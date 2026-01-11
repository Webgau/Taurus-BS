/**
 * FOUC Prevention - runs immediately before page render
 * Must be loaded synchronously in <body> tag
 */
(function() {
    var b = document.body;
    // Apply minified state
    if (localStorage.getItem('taurus-sidebar-minified') === 'true') {
        b.classList.add('app-sidebar-minified');
    }
    // Apply saved layout
    var layout = localStorage.getItem('taurus-layout');
    if (layout) b.setAttribute('data-layout', layout);
    // Remove no-transition after first paint
    requestAnimationFrame(function() {
        requestAnimationFrame(function() {
            b.classList.remove('no-transition');
        });
    });
})();

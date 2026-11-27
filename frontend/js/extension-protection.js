// =====================================================================
// PRAGMATIC SOLUTION: Simply suppress the specific extension error
// =====================================================================
(function() {
    'use strict';

    // Since the extension runs in its own isolated context and we can't prevent
    // it from executing, we'll focus on just hiding the console noise

    console.warn('[EXTENSION-SUPPRESSION] Loading extension error suppression...');

    // Store original console methods
    const originalConsole = {
        error: console.error,
        warn: console.warn,
        log: console.log,
        group: console.group,
        groupEnd: console.groupEnd
    };

    // Pattern matching for the specific error we want to suppress
    const isExtensionError = (message) => {
        const msg = String(message || '').toLowerCase();
        return (
            msg.includes('jquery.deferred exception') ||
            msg.includes('contentscript.js') ||
            msg.includes('chrome-extension://') ||
            (msg.includes('cannot read properties of null') && msg.includes('indexof')) ||
            msg.includes('caiblelclndcckfafdaggpephhgfpoip')
        );
    };

    // Override console methods to filter extension noise
    console.error = function(...args) {
        if (args.some(arg => isExtensionError(arg))) {
            return; // Silently ignore
        }
        return originalConsole.error.apply(console, args);
    };

    console.warn = function(...args) {
        if (args.some(arg => isExtensionError(arg))) {
            return; // Silently ignore
        }
        return originalConsole.warn.apply(console, args);
    };

    console.log = function(...args) {
        if (args.some(arg => isExtensionError(arg))) {
            return; // Silently ignore
        }
        return originalConsole.log.apply(console, args);
    };

    // Handle global errors
    window.addEventListener('error', function(event) {
        if (event.filename && (
            event.filename.includes('chrome-extension://') ||
            event.filename.includes('contentScript.js')
        )) {
            event.stopImmediatePropagation();
            event.preventDefault();
            return true;
        }

        if (event.message && isExtensionError(event.message)) {
            event.stopImmediatePropagation();
            event.preventDefault();
            return true;
        }
    }, true);

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
        const reason = event.reason || {};
        const message = String(reason.message || reason || '');
        const stack = String(reason.stack || '');

        if (isExtensionError(message) ||
            stack.includes('chrome-extension://') ||
            stack.includes('contentScript.js')) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }, true);

    // Override window.onerror as final fallback
    const originalOnError = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
        if (source && (
            source.includes('chrome-extension://') ||
            source.includes('contentScript.js')
        )) {
            return true; // Suppress
        }

        if (isExtensionError(message)) {
            return true; // Suppress
        }

        if (originalOnError) {
            return originalOnError.call(this, message, source, lineno, colno, error);
        }
        return false;
    };

    console.warn('[EXTENSION-SUPPRESSION] Extension error suppression active - console noise filtered');
})();
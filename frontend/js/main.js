// =====================================================================
// NUCLEAR EXTENSION PROTECTION - CSP COMPLIANT VERSION
// =====================================================================
(function() {
    'use strict';

    // Store original functions in a secure closure before extensions can interfere
    const SECURE_INDEXOF = String.prototype.indexOf;
    const SECURE_FIND = Array.prototype.find;
    const SECURE_SETTIMEOUT = window.setTimeout;

    console.warn('[NUCLEAR-PROTECTION] Initializing maximum extension isolation...');

    // Create iframe sandbox for completely clean prototypes (CSP compliant)
    let safeIndexOf = SECURE_INDEXOF;
    let safeFind = SECURE_FIND;

    try {
        const sandbox = document.createElement('iframe');
        sandbox.style.display = 'none';
        sandbox.style.position = 'absolute';
        sandbox.style.left = '-9999px';

        if (document.documentElement) {
            document.documentElement.appendChild(sandbox);

            // Get clean prototypes from iframe
            if (sandbox.contentWindow && sandbox.contentWindow.String) {
                safeIndexOf = sandbox.contentWindow.String.prototype.indexOf;
                safeFind = sandbox.contentWindow.Array.prototype.find;
            }

            // Cleanup sandbox after 100ms
            setTimeout(() => {
                try {
                    if (sandbox.parentNode) {
                        sandbox.parentNode.removeChild(sandbox);
                    }
                } catch (e) {}
            }, 100);
        }
    } catch (e) {
        console.warn('[NUCLEAR-PROTECTION] Sandbox creation failed, using fallback');
    }

    // Nuclear protection - completely replace prototypes with bulletproof versions
    String.prototype.indexOf = function(searchString, position) {
        if (this == null || this == undefined) {
            return -1;
        }
        try {
            return safeIndexOf.call(this, searchString, position);
        } catch (e) {
            return -1;
        }
    };

    Array.prototype.find = function(callback, thisArg) {
        if (this == null || this == undefined) {
            return undefined;
        }
        try {
            return safeFind.call(this, callback, thisArg);
        } catch (e) {
            return undefined;
        }
    };

    // Completely silence ALL extension errors
    window.addEventListener('error', function(event) {
        const filename = event.filename || '';
        const message = event.message || '';

        if (filename.includes('extension://') ||
            filename.includes('contentScript') ||
            message.includes('indexOf') ||
            message.includes('jQuery.Deferred')) {

            event.stopImmediatePropagation();
            event.preventDefault();
            return true;
        }
    }, true);

    window.addEventListener('unhandledrejection', function(event) {
        const reason = event.reason || {};
        const message = String(reason.message || reason || '');

        if (message.includes('indexOf') ||
            message.includes('contentScript') ||
            message.includes('extension://') ||
            message.includes('jQuery.Deferred')) {

            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }, true);

    // Override ALL console methods to filter extension noise
    const originalConsole = {
        error: console.error,
        warn: console.warn,
        log: console.log
    };

    ['error', 'warn', 'log'].forEach(method => {
        console[method] = function(...args) {
            const message = String(args[0] || '');

            if (message.includes('jQuery.Deferred exception') ||
                message.includes('extension://') ||
                message.includes('contentScript') ||
                message.includes('Uncaught TypeError: Cannot read properties of null')) {
                return; // Completely silence
            }

            return originalConsole[method].apply(console, args);
        };
    });

    // Patch setTimeout to catch async extension errors
    window.setTimeout = function(fn, delay, ...args) {
        if (typeof fn === 'function') {
            const safeFn = function() {
                try {
                    return fn.apply(this, arguments);
                } catch (error) {
                    const message = error.message || '';
                    if (message.includes('indexOf') || message.includes('contentScript')) {
                        return; // Silently ignore extension errors
                    }
                    throw error;
                }
            };
            return SECURE_SETTIMEOUT.call(window, safeFn, delay, ...args);
        }
        return SECURE_SETTIMEOUT.call(window, fn, delay, ...args);
    };

    console.warn('[NUCLEAR-PROTECTION] Maximum extension isolation active - all extension errors suppressed');
})();

// Global authentication state
let isAuthenticated = false;
let currentUser = null;
let authToken = localStorage.getItem('authToken');

// Block all services by default until authentication is verified
let servicesBlocked = true;

// Authentication verification function
function verifyAuthentication() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        isAuthenticated = false;
        servicesBlocked = true;
        currentUser = null;
        authToken = null;
        return false;
    }

    // If we have a token, validate it with the server
    authToken = token;
    checkAuthStatus();
    return true;
}

// Defensive programming: Protect against extension interference
(function() {
    'use strict';

    // Prevent potential null reference errors from extensions
    if (typeof window !== 'undefined') {
        // Add error boundary for extension conflicts
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function(type, listener, options) {
            try {
                return originalAddEventListener.call(this, type, listener, options);
            } catch (error) {
                console.warn('Event listener error (possibly extension conflict):', error);
            }
        };
    }
})();

// Utility functions for safe DOM access
function safeGetElement(id, context = document) {
    try {
        if (!context || typeof context.getElementById !== 'function') {
            console.warn('Invalid context for element lookup');
            return null;
        }
        return context.getElementById(id);
    } catch (error) {
        console.warn(`Error accessing element ${id}:`, error);
        return null;
    }
}

function safeGetValue(elementId, defaultValue = '') {
    try {
        const element = safeGetElement(elementId);
        if (!element || typeof element.value !== 'string') {
            return defaultValue;
        }
        return element.value.trim();
    } catch (error) {
        console.warn(`Error getting value from ${elementId}:`, error);
        return defaultValue;
    }
}

// Enhanced protection against browser extension interference
function protectFromExtensions() {
    // Protect String.prototype.indexOf from null/undefined 'this' values
    const originalIndexOf = String.prototype.indexOf;
    String.prototype.indexOf = function(searchString, position) {
        try {
            if (this === null || this === undefined) {
                console.warn('Protected: indexOf called on null/undefined');
                return -1;
            }
            return originalIndexOf.call(this, searchString, position);
        } catch (error) {
            console.warn('Protected indexOf call failed:', error);
            return -1;
        }
    };

    // Protect Array.prototype.find from null/undefined arrays
    const originalFind = Array.prototype.find;
    Array.prototype.find = function(callback, thisArg) {
        try {
            if (this === null || this === undefined) {
                console.warn('Protected: find called on null/undefined array');
                return undefined;
            }
            return originalFind.call(this, callback, thisArg);
        } catch (error) {
            console.warn('Protected array find call failed:', error);
            return undefined;
        }
    };

    // Protect jQuery Deferred if jQuery is loaded by extensions
    if (typeof window !== 'undefined' && window.jQuery) {
        const $ = window.jQuery;
        if ($.Deferred) {
            const originalDeferred = $.Deferred;
            $.Deferred = function() {
                try {
                    return originalDeferred.apply(this, arguments);
                } catch (error) {
                    console.warn('Protected jQuery Deferred call failed:', error);
                    // Return a minimal deferred-like object
                    return {
                        promise: () => ({ then: () => {}, catch: () => {}, fail: () => {} }),
                        resolve: () => {},
                        reject: () => {},
                        always: () => {},
                        done: () => {},
                        fail: () => {}
                    };
                }
            };
        }
    }
}

// Initialize extension protection
protectFromExtensions();

// Global error handler to catch extension interference
window.addEventListener('error', function(event) {
    if (event.filename && event.filename.includes('chrome-extension://')) {
        console.warn('Browser extension error caught and suppressed:', event.message);
        return true; // Prevent the error from being displayed in console
    }
    return false; // Let other errors through
});

// Handle unhandled promise rejections from extensions
window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && event.reason.stack && event.reason.stack.includes('chrome-extension://')) {
        console.warn('Extension promise rejection caught and suppressed:', event.reason.message);
        event.preventDefault(); // Prevent unhandled rejection warning
    }
});

// API Base URL - automatically detects if running on Live Server
const API_BASE_URL = (function() {
    try {
        if (!window || !window.location) {
            console.warn('Window or location not available, using fallback URL');
            return 'http://localhost:3002';
        }

        if (window.location.hostname === '127.0.0.1' && window.location.port === '5500') {
            return 'http://localhost:3002';
        }
        return '';
    } catch (e) {
        console.warn('Error detecting API base URL (possibly extension interference):', e);
        return 'http://localhost:3002';
    }
})();

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Small delay to let extensions settle
        setTimeout(() => {
            initializeApp();
        }, 100);
    } catch (error) {
        console.error('Error during app initialization:', error);
        // Fallback: try again after a longer delay
        setTimeout(() => {
            try {
                initializeApp();
            } catch (retryError) {
                console.error('App initialization failed on retry:', retryError);
            }
        }, 1000);
    }
});

// Global error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    console.error('URL:', e.filename, 'Line:', e.lineno);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled Promise Rejection:', e.reason);
});

// Additional safety: override any problematic window.location changes
const originalLocationAssign = window.location.assign;
window.location.assign = function(url) {
    if (url && (url.includes('%22') || url.includes('undefined') || url === '\"')) {
        console.error('Blocked malformed URL assignment:', url);
        return;
    }
    return originalLocationAssign.call(this, url);
};

// Prevent navigation to malformed URLs
document.addEventListener('click', function(e) {
    const target = e.target.closest('a');
    if (target) {
        const href = target.getAttribute('href');
        // Only prevent truly malformed URLs, not legitimate hash links
        if (href === '"' || href === "'" || href === '""' || href === "''" || (href && href.includes('javascript:') && href !== 'javascript:void(0)')) {
            e.preventDefault();
            e.stopPropagation();
            console.warn('Prevented navigation to malformed URL:', href);
            return false;
        }
        // For legitimate hash links (#), let them work normally but prevent page scroll
        if (href === '#') {
            e.preventDefault(); // Prevent scroll to top
            return false;
        }
    }
}, true);

// Initialize application
function initializeApp() {
    try {
        initializeNavigation();
        initializeAuth();
        initializeForms();
        initializeModals();
        initializeEventListeners();

        // Check if user is logged in
        if (authToken) {
            checkAuthStatus();
        }
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

// Initialize event listeners for CSP compliance
function initializeEventListeners() {
    // Login button
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', showLoginModal);
    }

    // Hero section buttons
    const trackNowBtn = document.getElementById('trackNowBtn');
    if (trackNowBtn) {
        trackNowBtn.addEventListener('click', () => scrollToSection('tracking'));
    }

    // Quick track button
    const quickTrackBtn = document.getElementById('quickTrackBtn');
    if (quickTrackBtn) {
        quickTrackBtn.addEventListener('click', quickTrack);
    }

    // Main track button
    const trackPackageBtn = document.getElementById('trackPackageBtn');
    if (trackPackageBtn) {
        trackPackageBtn.addEventListener('click', () => trackPackage());
    }

    // Create account button
    const createAccountBtn = document.getElementById('createAccountBtn');
    if (createAccountBtn) {
        createAccountBtn.addEventListener('click', showRegisterModal);
    }

    // Modal close buttons
    document.querySelectorAll('.close[data-modal]').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            const modalId = e.target.getAttribute('data-modal');
            closeModal(modalId);
        });
    });

    // Register/Login links
    const showRegisterLink = document.getElementById('showRegisterLink');
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            showRegisterModal();
        });
    }

    const showLoginLink = document.getElementById('showLoginLink');
    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            showLoginModal();
        });
    }

    // Quick track input - Enter key support
    const quickTrackInput = document.getElementById('quickTrackInput');
    if (quickTrackInput) {
        quickTrackInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                quickTrack();
            }
        });
    }

    // Main tracking input - Enter key support
    const trackingInput = document.getElementById('trackingInput');
    if (trackingInput) {
        trackingInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                trackPackage();
            }
        });
    }

    // Global event delegation for dynamically created elements
    document.addEventListener('click', (e) => {
        const target = e.target;

        // Handle close buttons with data-close-modal
        if (target.classList.contains('close') && target.hasAttribute('data-close-modal')) {
            e.preventDefault();
            const modalId = target.getAttribute('data-close-modal');
            closeModal(modalId);
        }

        // Handle buttons with data-action (but not checkboxes)
        if (target.hasAttribute('data-action') && target.type !== 'checkbox') {
            e.preventDefault();
            const action = target.getAttribute('data-action');
            const param = target.getAttribute('data-param');

            switch(action) {
                case 'proceedToShip':
                    const service = target.getAttribute('data-service');
                    const cost = parseFloat(target.getAttribute('data-cost'));
                    proceedToShip(service, cost);
                    break;
                case 'trackPackage':
                    if (requireAuth('track packages')) {
                        trackPackage(param);
                    }
                    break;
                case 'closeModal':
                    closeModal(param);
                    break;
                case 'showStatusUpdateModal':
                    showStatusUpdateModal(param);
                    break;
                case 'viewShipmentDetails':
                    if (requireAuth('view shipment details')) {
                        viewShipmentDetails(param);
                    }
                    break;
                case 'searchShipments':
                    searchShipments();
                    break;
                case 'showAdminDashboard':
                    showAdminDashboard();
                    break;
                case 'toggleHistoryUpdate':
                    const detailsId = target.getAttribute('data-details-id');
                    const cardId = target.getAttribute('data-card-id');
                    toggleHistoryUpdate(detailsId, cardId);
                    break;
                case 'closeHistoryUpdate':
                    closeHistoryUpdate(param);
                    break;
                case 'toggleTrackingHistory':
                    toggleTrackingHistory();
                    break;
                case 'filterShipments':
                    filterShipments();
                    break;
                case 'toggleHoldReason':
                    // Don't handle click for checkbox, let change event handle it
                    return;
                case 'filterSupportMessages':
                    filterSupportMessages();
                    break;
                case 'refreshSupportMessages':
                    refreshSupportMessages();
                    break;
                case 'viewSupportMessage':
                    viewSupportMessage(param);
                    break;
                case 'showResponseForm':
                    showResponseForm(param);
                    break;
                case 'updateMessageStatus':
                    updateMessageStatus(param);
                    break;
                case 'deleteInternalNote':
                    const messageId = target.getAttribute('data-message-id');
                    const responseId = target.getAttribute('data-response-id');
                    deleteInternalNote(messageId, responseId);
                    break;
                case 'filterUsers':
                    filterUsers();
                    break;
                case 'searchUsers':
                    searchUsers();
                    break;
                case 'clearFilters':
                    clearFilters();
                    break;
                case 'refreshUsers':
                    refreshUsers();
                    break;
                case 'verifyAllUsers':
                    verifyAllUsers();
                    break;
                case 'verifyUser':
                    const userId = target.getAttribute('data-user-id');
                    const userName = target.getAttribute('data-user-name');
                    verifyUser(userId, userName);
                    break;
                case 'createFirstShipment':
                    if (requireAuth('create shipments')) {
                        closeModal('shipmentsModal');
                        showShippingRateForm();
                    }
                    break;
                case 'loadAdminShipments':
                    loadAdminShipments();
                    break;
                case 'loadCustomerSupport':
                    loadCustomerSupport();
                    break;
                case 'loadAdminUsers':
                    loadAdminUsers();
                    break;
                case 'showAdminRegisterModal':
                    showAdminRegisterModal();
                    break;
                case 'closeToast':
                    target.closest('.toast').remove();
                    break;
            }
        }

        // Handle select elements with data-action (change events)
        if (target.tagName === 'SELECT' && target.hasAttribute('data-action')) {
            const action = target.getAttribute('data-action');
            switch(action) {
                case 'filterShipments':
                    filterShipments();
                    break;
                case 'filterSupportMessages':
                    filterSupportMessages();
                    break;
                case 'filterUsers':
                    filterUsers();
                    break;
            }
        }

        // Handle input elements with data-action (for search)
        if (target.tagName === 'INPUT' && target.hasAttribute('data-action')) {
            const action = target.getAttribute('data-action');
            switch(action) {
                case 'searchUsers':
                    // Add debounced search for real-time filtering
                    clearTimeout(target.searchTimeout);
                    target.searchTimeout = setTimeout(() => {
                        searchUsers();
                    }, 500);
                    break;
            }
        }
    });

    // Global change event delegation for select elements
    document.addEventListener('change', (e) => {
        const target = e.target;

        // Handle select elements with data-action
        if (target.tagName === 'SELECT' && target.hasAttribute('data-action')) {
            const action = target.getAttribute('data-action');
            switch(action) {
                case 'filterShipments':
                    filterShipments();
                    break;
                case 'filterSupportMessages':
                    filterSupportMessages();
                    break;
                case 'filterUsers':
                    filterUsers();
                    break;
            }
        }

    });

    // Separate change event handler for checkboxes
    document.addEventListener('change', (e) => {
        const target = e.target;

        // Handle checkbox for hold reason
        if (target.type === 'checkbox' && target.hasAttribute('data-action')) {
            const action = target.getAttribute('data-action');
            if (action === 'toggleHoldReason') {
                toggleHoldReason(target);
            }
        }
    });

    // Global input event delegation
    document.addEventListener('input', (e) => {
        const target = e.target;

        // Handle support search input
        if (target.id === 'supportSearch') {
            clearTimeout(target.searchTimeout);
            target.searchTimeout = setTimeout(() => {
                filterSupportMessages();
            }, 500);
        }

        // Handle user search input
        if (target.id === 'userSearch') {
            clearTimeout(target.searchTimeout);
            target.searchTimeout = setTimeout(() => {
                filterUsers();
            }, 500);
        }
    });
}

// Navigation functionality
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const target = this.getAttribute('href');
            if (target && target.startsWith('#') && target.length > 1) {
                scrollToSection(target.substring(1));
            }
            return false;
        });
    });

    // Close mobile menu when clicking on links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// Smooth scroll to section
function scrollToSection(sectionId) {
    if (!sectionId || typeof sectionId !== 'string') {
        console.warn('Invalid section ID:', sectionId);
        return;
    }

    // Require authentication for service sections
    const serviceSections = ['shipping', 'tracking', 'ship'];
    if (serviceSections.includes(sectionId)) {
        if (!requireAuth('access this service')) {
            return;
        }
    }

    const element = document.getElementById(sectionId);
    if (element) {
        const navbar = document.querySelector('.navbar');
        const navHeight = navbar ? navbar.offsetHeight : 0;
        const elementPosition = element.offsetTop - navHeight;

        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    } else {
        console.warn('Element not found:', sectionId);
    }
}

// Authentication functions
function initializeAuth() {
    console.log('[AUTH INIT] Starting authentication verification...');

    // Start with everything blocked
    isAuthenticated = false;
    servicesBlocked = true;

    // Try to verify existing authentication
    verifyAuthentication();

    // Update UI to reflect auth state
    updateAuthUI();

    console.log('[AUTH INIT] Complete. Services blocked:', servicesBlocked);
}

// ABSOLUTE service blocking - no services work without authentication
function requireAuth(actionName = 'use this service') {
    console.log('[AUTH CHECK]', {
        isAuthenticated,
        servicesBlocked,
        hasToken: !!authToken,
        hasUser: !!currentUser,
        action: actionName
    });

    // ABSOLUTELY BLOCK if not authenticated
    if (!isAuthenticated || servicesBlocked || !authToken || !currentUser) {
        console.log('[AUTH DENIED]', actionName);
        showToast(`🔒 Please log in to ${actionName}`, 'error');
        showLoginModal();
        // Force stop all execution
        throw new Error('Authentication required');
    }

    console.log('[AUTH APPROVED]', actionName);
    return true;
}

function checkAuthStatus() {
    if (!authToken) {
        isAuthenticated = false;
        servicesBlocked = true;
        return;
    }

    fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Auth check failed');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            currentUser = data.user;
            isAuthenticated = true;
            servicesBlocked = false;
            console.log('[AUTH SUCCESS] User authenticated:', currentUser.email);
            updateAuthUI();
        } else {
            logout();
        }
    })
    .catch(error => {
        console.error('[AUTH ERROR]', error);
        logout();
    });
}

function updateAuthUI() {
    const loginBtn = document.getElementById('loginBtn');

    // Enable/disable service elements based on authentication
    toggleServiceElements();

    // Show/hide authentication notices based on login status
    toggleAuthNotices();

    if (isAuthenticated && currentUser && loginBtn) {
        loginBtn.textContent = `Hi, ${currentUser.firstName}`;
        // Remove existing listeners
        loginBtn.removeEventListener('click', showLoginModal);
        loginBtn.addEventListener('click', showUserMenu);
    } else if (loginBtn) {
        loginBtn.textContent = 'Login';
        loginBtn.removeEventListener('click', showUserMenu);
        loginBtn.addEventListener('click', showLoginModal);
    }
}

// Function to show/hide authentication notices based on login status
function toggleAuthNotices() {
    const authNotices = document.querySelectorAll('.auth-notice, .service-notice');

    // Handle notice visibility
    authNotices.forEach(notice => {
        if (isAuthenticated && currentUser) {
            // Hide notices when user is logged in
            notice.style.display = 'none';
        } else {
            // Show notices when user is not logged in
            notice.style.display = 'block';
        }
    });

    // Update input placeholders based on authentication status
    const trackingInputs = [
        { id: 'quickTrackInput', authPlaceholder: 'Enter tracking number (login required)', normalPlaceholder: 'Enter tracking number' },
        { id: 'trackingInput', authPlaceholder: 'Enter tracking number (login required)', normalPlaceholder: 'Enter tracking number (e.g., FR1234567890)' }
    ];

    trackingInputs.forEach(input => {
        const element = document.getElementById(input.id);
        if (element) {
            if (isAuthenticated && currentUser) {
                element.placeholder = input.normalPlaceholder;
            } else {
                element.placeholder = input.authPlaceholder;
            }
        }
    });
}

// Function to enable/disable all service elements based on authentication
function toggleServiceElements(isAuth) {
    // Override with global authentication state
    const shouldEnable = isAuthenticated && !servicesBlocked && currentUser && authToken;

    console.log('[UI UPDATE] Service elements state:', {
        shouldEnable,
        isAuthenticated,
        servicesBlocked,
        hasUser: !!currentUser,
        hasToken: !!authToken
    });

    const serviceElements = [
        'trackingInput',
        'quickTrackInput',
        'trackPackageBtn',
        'quickTrackBtn',
        'rateForm',
        'contactForm'
    ];

    serviceElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            if (shouldEnable) {
                element.disabled = false;
                element.style.opacity = '1';
                element.style.pointerEvents = 'auto';
                element.removeAttribute('title');
            } else {
                element.disabled = true;
                element.style.opacity = '0.3';
                element.style.pointerEvents = 'none';
                element.setAttribute('title', 'Please log in to use this service');
            }
        }
    });

    // Also disable form submissions
    const forms = document.querySelectorAll('#rateForm, #contactForm');
    forms.forEach(form => {
        if (form) {
            if (shouldEnable) {
                form.style.pointerEvents = 'auto';
                form.style.opacity = '1';
            } else {
                form.style.pointerEvents = 'none';
                form.style.opacity = '0.3';
            }
        }
    });
}

function showUserMenu() {
    // Create user dropdown menu
    const existingMenu = document.querySelector('.user-menu');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }

    const menu = document.createElement('div');
    menu.className = 'user-menu';
    menu.innerHTML = `
        <div class="user-menu-content">
            <div class="user-info">
                <strong>${currentUser.firstName} ${currentUser.lastName}</strong>
                <small>${currentUser.email}</small>
            </div>
            <ul class="user-menu-list">
                <li><a href="#" data-action="showMyShipments">My Shipments</a></li>
                <li><a href="#" data-action="showProfile">Profile</a></li>
                ${currentUser.role === 'admin' ? '<li><a href="#" data-action="showAdminDashboard">Admin Dashboard</a></li>' : ''}
                <li><a href="#" data-action="logout">Logout</a></li>
            </ul>
        </div>
    `;

    document.body.appendChild(menu);

    // Add event listeners to menu items
    menu.querySelectorAll('[data-action]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const action = e.target.getAttribute('data-action');

            // Close menu first
            menu.remove();

            // Execute action
            switch(action) {
                case 'showMyShipments':
                    showMyShipments();
                    break;
                case 'showProfile':
                    showProfile();
                    break;
                case 'showAdminDashboard':
                    showAdminDashboard();
                    break;
                case 'logout':
                    logout();
                    break;
            }
        });
    });

    // Close menu when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 100);
}

function logout() {
    // Reset ALL authentication state
    localStorage.removeItem('authToken');
    authToken = null;
    currentUser = null;
    isAuthenticated = false;
    servicesBlocked = true;

    console.log('[LOGOUT] All authentication state cleared');

    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.textContent = 'Login';
        // Remove existing listeners and reset to login
        loginBtn.removeEventListener('click', showUserMenu);
        loginBtn.addEventListener('click', showLoginModal);
    }

    // Block all services immediately
    updateAuthUI();

    showToast('Logged out successfully', 'success');
}

// Form initialization
function initializeForms() {
    // Rate calculation form
    const rateForm = document.getElementById('rateForm');
    if (rateForm) {
        rateForm.addEventListener('submit', handleRateCalculation);
    }

    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }

    // Contact message validation
    const contactMessage = document.getElementById('contactMessage');
    if (contactMessage) {
        contactMessage.addEventListener('input', validateContactMessage);
        // Run validation on page load
        validateContactMessage();
    }

    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

// Rate calculation
function handleRateCalculation(e) {
    e.preventDefault();

    try {
        // REQUIRE authentication - will throw error if not authenticated
        requireAuth('calculate shipping rates');
    } catch (error) {
        console.log('[BLOCKED] Rate calculation attempt without authentication');
        return;
    }

    showLoading(true);

    const formData = new FormData(e.target);
    const data = {
        weight: parseFloat(formData.get('weight')),
        dimensions: {
            length: parseFloat(formData.get('length')),
            width: parseFloat(formData.get('width')),
            height: parseFloat(formData.get('height'))
        },
        senderZip: formData.get('fromZip'),
        recipientZip: formData.get('toZip'),
        service: formData.get('service'),
        value: parseFloat(formData.get('value')) || 0
    };

    fetch(`${API_BASE_URL}/api/shipments/calculate-rate`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        showLoading(false);
        if (data.success) {
            displayRateResults(data.rate);
        } else {
            showToast(data.message || 'Error calculating rate', 'error');
        }
    })
    .catch(error => {
        showLoading(false);
        console.error('Rate calculation error:', error);
        showToast('Error calculating shipping rate', 'error');
    });
}

function displayRateResults(rate) {
    const resultsDiv = document.getElementById('rateResults');
    if (!resultsDiv) return;

    const deliveryDate = new Date(rate.estimatedDelivery).toLocaleDateString();

    resultsDiv.innerHTML = `
        <div class="rate-display">
            <div>
                <div class="rate-service">${rate.service.toUpperCase()}</div>
                <p>Estimated Delivery: ${deliveryDate}</p>
            </div>
            <div class="rate-price">$${rate.cost.toFixed(2)}</div>
        </div>
        <div class="rate-details">
            <p><strong>Chargeable Weight:</strong> ${rate.chargeableWeight} lbs</p>
            <p><strong>Distance Factor:</strong> ${rate.details.distanceMultiplier}</p>
            <p><strong>Base Rate:</strong> $${rate.details.baseRate}</p>
        </div>
        <button class="btn-primary" data-action="proceedToShip" data-service="${rate.service}" data-cost="${rate.cost}">
            Create Shipment
        </button>
    `;

    resultsDiv.style.display = 'block';
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
}

function proceedToShip(service, cost) {
    // Require authentication for creating shipments
    if (!requireAuth('create shipments')) {
        return;
    }

    // Create shipment modal (simplified version)
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'shipmentModal';
    modal.innerHTML = `
        <div class="modal-content shipment-modal">
            <div class="modal-header">
                <h2><i class="fas fa-shipping-fast"></i> Create New Shipment</h2>
                <span class="close" data-close-modal="shipmentModal">&times;</span>
            </div>
            <div class="modal-body">
                <form id="shipmentForm">
                    <div class="shipment-section">
                        <h3><i class="fas fa-user"></i> Recipient Information</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label><i class="fas fa-user"></i> Recipient Name</label>
                                <input type="text" name="recipient.name" placeholder="John Doe" required>
                            </div>
                            <div class="form-group">
                                <label><i class="fas fa-envelope"></i> Email Address</label>
                                <input type="email" name="recipient.email" placeholder="john.doe@email.com" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-phone"></i> Phone Number</label>
                            <input type="tel" name="recipient.phone" placeholder="(555) 123-4567" required>
                        </div>
                    </div>

                    <div class="shipment-section">
                        <h3><i class="fas fa-map-marker-alt"></i> Delivery Address</h3>
                        <div class="form-group">
                            <label><i class="fas fa-road"></i> Street Address</label>
                            <input type="text" name="recipient.address.street" placeholder="123 Main Street, Apt 4B" required>
                        </div>
                        <div class="form-row three-col">
                            <div class="form-group">
                                <label><i class="fas fa-city"></i> City</label>
                                <input type="text" name="recipient.address.city" placeholder="New York" required>
                            </div>
                            <div class="form-group">
                                <label><i class="fas fa-flag"></i> State</label>
                                <input type="text" name="recipient.address.state" placeholder="e.g., New York or NY" required>
                            </div>
                            <div class="form-group">
                                <label><i class="fas fa-mail-bulk"></i> ZIP Code</label>
                                <input type="text" name="recipient.address.zipCode" placeholder="10001" required>
                            </div>
                        </div>
                    </div>

                    <div class="shipment-section">
                        <h3><i class="fas fa-box"></i> Package Details</h3>
                        <div class="form-group">
                            <label><i class="fas fa-clipboard-list"></i> Package Description</label>
                            <textarea name="package.description" placeholder="Describe what's in the package..." rows="3" required></textarea>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label><i class="fas fa-dollar-sign"></i> Package Value ($)</label>
                                <input type="number" name="package.value" step="0.01" min="0" placeholder="100.00" required>
                            </div>
                            <div class="form-group">
                                <label><i class="fas fa-tags"></i> Package Category</label>
                                <select name="package.category" required>
                                    <option value="">Select Category</option>
                                    <option value="documents">📄 Documents</option>
                                    <option value="electronics">📱 Electronics</option>
                                    <option value="clothing">👕 Clothing</option>
                                    <option value="books">📚 Books</option>
                                    <option value="fragile">🔔 Fragile Items</option>
                                    <option value="other">📦 Other</option>
                                </select>
                            </div>
                        </div>
                        <div class="dimensions-section">
                            <h4><i class="fas fa-ruler-combined"></i> Package Dimensions (inches)</h4>
                            <div class="form-row three-col">
                                <div class="form-group">
                                    <label>Length</label>
                                    <input type="number" name="package.dimensions.length" step="0.1" min="1" placeholder="12.0" required>
                                </div>
                                <div class="form-group">
                                    <label>Width</label>
                                    <input type="number" name="package.dimensions.width" step="0.1" min="1" placeholder="8.0" required>
                                </div>
                                <div class="form-group">
                                    <label>Height</label>
                                    <input type="number" name="package.dimensions.height" step="0.1" min="1" placeholder="4.0" required>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="shipment-section">
                        <h3><i class="fas fa-credit-card"></i> Payment & Summary</h3>
                        <div class="form-group">
                            <label><i class="fas fa-payment"></i> Payment Method</label>
                            <select name="payment.method" required>
                                <option value="">Select Payment Method</option>
                                <option value="credit_card">💳 Credit Card</option>
                                <option value="debit_card">💳 Debit Card</option>
                                <option value="paypal">🅿️ PayPal</option>
                            </select>
                        </div>
                        <div class="shipment-summary">
                            <h4><i class="fas fa-receipt"></i> Shipment Summary</h4>
                            <div class="summary-grid">
                                <div class="summary-item">
                                    <span class="summary-label">Service Type:</span>
                                    <span class="summary-value">${service.toUpperCase()}</span>
                                </div>
                                <div class="summary-item">
                                    <span class="summary-label">Shipping Cost:</span>
                                    <span class="summary-value cost-highlight">$${cost.toFixed(2)}</span>
                                </div>
                                <div class="summary-item">
                                    <span class="summary-label">Package Weight:</span>
                                    <span class="summary-value">${document.getElementById('rateForm').weight.value} lbs</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn-secondary" data-action="closeModal" data-param="shipmentModal">Cancel</button>
                        <button type="submit" class="btn-primary"><i class="fas fa-shipping-fast"></i> Create Shipment</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    showModal('shipmentModal');

    // Handle form submission
    document.getElementById('shipmentForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        // Double-check authentication before processing
        if (!requireAuth('create shipments')) {
            return;
        }

        showLoading(true);

        const formData = new FormData(e.target);

        // Calculate estimated delivery based on service type
        const deliveryDays = {
            'standard': 7,
            'express': 3,
            'overnight': 1,
            'international': 14
        };

        const estimatedDelivery = new Date();
        estimatedDelivery.setDate(estimatedDelivery.getDate() + deliveryDays[service]);

        const shipmentData = {
            recipient: {
                name: formData.get('recipient.name'),
                email: formData.get('recipient.email'),
                phone: formData.get('recipient.phone'),
                address: {
                    street: formData.get('recipient.address.street'),
                    city: formData.get('recipient.address.city'),
                    state: formData.get('recipient.address.state'),
                    zipCode: formData.get('recipient.address.zipCode'),
                    country: 'USA'
                }
            },
            package: {
                description: formData.get('package.description'),
                weight: parseFloat(document.getElementById('rateForm').weight.value),
                value: parseFloat(formData.get('package.value')),
                dimensions: {
                    length: parseFloat(formData.get('package.dimensions.length')),
                    width: parseFloat(formData.get('package.dimensions.width')),
                    height: parseFloat(formData.get('package.dimensions.height'))
                },
                category: formData.get('package.category') || 'other'
            },
            service: {
                type: service,
                cost: cost,
                estimatedDelivery: estimatedDelivery.toISOString()
            },
            payment: {
                method: formData.get('payment.method'),
                status: 'paid'
            }
        };

        console.log('Sending shipment data:', JSON.stringify(shipmentData, null, 2));

        try {
            const response = await fetch(`${API_BASE_URL}/api/shipments/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(shipmentData)
            });

            const data = await response.json();
            showLoading(false);

            if (data.success) {
                // Create enhanced success notification for shipment creation
                showShipmentSuccessNotification(data.shipment.trackingNumber);
                closeModal('shipmentModal');
                modal.remove();
            } else {
                console.error('Shipment creation failed:', data);
                if (data.errors && data.errors.length > 0) {
                    const errorMessages = data.errors.map(err => err.msg).join(', ');
                    showShipmentErrorNotification(errorMessages);
                } else {
                    showShipmentErrorNotification(data.message || 'Unable to create shipment. Please try again.');
                }
            }
        } catch (error) {
            showLoading(false);
            console.error('Shipment creation error:', error);
            showShipmentErrorNotification('Network error occurred. Please check your connection and try again.');
        }
    });
}

// Tracking functionality
function quickTrack() {
    try {
        // REQUIRE authentication - will throw error if not authenticated
        requireAuth('track packages');
    } catch (error) {
        console.log('[BLOCKED] Quick track attempt without authentication');
        return;
    }

    const trackingNumber = safeGetValue('quickTrackInput');
    if (!trackingNumber) {
        showToast('Please enter a tracking number', 'warning');
        return;
    }
    trackPackage(trackingNumber);
}

function trackPackage(trackingNumber = null) {
    try {
        // REQUIRE authentication - will throw error if not authenticated
        requireAuth('track packages');
    } catch (error) {
        console.log('[BLOCKED] Tracking attempt without authentication');
        return;
    }

    let input = trackingNumber;

    // Check if the parameter is an event object and ignore it
    if (input && typeof input === 'object' && input.constructor.name.includes('Event')) {
        input = null;
    }

    if (!input) {
        input = safeGetValue('trackingInput');
    }

    if (!input) {
        showToast('Please enter a tracking number', 'warning');
        return;
    }

    if (input.length < 8) {
        showToast('Tracking number must be at least 8 characters', 'warning');
        return;
    }

    showLoading(true);

    fetch(`${API_BASE_URL}/api/tracking/${input}`, {
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        showLoading(false);
        if (data.success) {
            displayTrackingResults(data.tracking);
        } else {
            showToast('Tracking number not found', 'error');
        }
    })
    .catch(error => {
        showLoading(false);
        console.error('Tracking error:', error);
        showToast('Error retrieving tracking information', 'error');
    });
}

function toggleTrackingHistory() {
    const historyContent = document.getElementById('historyContent');
    const toggleIcon = document.getElementById('historyToggleIcon');

    if (historyContent && toggleIcon) {
        const isCollapsed = historyContent.classList.contains('collapsed');

        if (isCollapsed) {
            // Expand
            historyContent.classList.remove('collapsed');
            historyContent.style.maxHeight = historyContent.scrollHeight + 'px';
            historyContent.style.opacity = '1';
            historyContent.style.padding = '25px';
            toggleIcon.classList.remove('fa-chevron-down');
            toggleIcon.classList.add('fa-chevron-up');
        } else {
            // Collapse
            historyContent.classList.add('collapsed');
            historyContent.style.maxHeight = '0px';
            historyContent.style.opacity = '0';
            historyContent.style.padding = '0 25px';
            toggleIcon.classList.remove('fa-chevron-up');
            toggleIcon.classList.add('fa-chevron-down');
        }
    }
}

function toggleHistoryUpdate(detailsId, cardId) {
    const details = document.getElementById(detailsId);
    const expandIcon = document.getElementById(`expand-${cardId}`);

    if (details && expandIcon) {
        const isCollapsed = details.classList.contains('collapsed');

        if (isCollapsed) {
            // Expand
            details.classList.remove('collapsed');
            details.style.maxHeight = details.scrollHeight + 'px';
            details.style.opacity = '1';
            expandIcon.innerHTML = '<i class="fas fa-chevron-up"></i>';
        } else {
            // Collapse
            details.classList.add('collapsed');
            details.style.maxHeight = '0px';
            details.style.opacity = '0';
            expandIcon.innerHTML = '<i class="fas fa-chevron-down"></i>';
        }
    }
}

function closeHistoryUpdate(cardId) {
    const card = document.getElementById(cardId);
    if (card) {
        // Add fade-out animation
        card.style.transition = 'all 0.3s ease';
        card.style.opacity = '0';
        card.style.transform = 'translateX(100%)';

        // Remove the card after animation
        setTimeout(() => {
            card.style.display = 'none';
        }, 300);
    }
}

// Initialize history as expanded when page loads
function initializeTrackingHistory() {
    setTimeout(() => {
        const historyContent = document.getElementById('historyContent');
        const toggleIcon = document.getElementById('historyToggleIcon');

        if (historyContent && toggleIcon) {
            historyContent.style.maxHeight = historyContent.scrollHeight + 'px';
            historyContent.style.opacity = '1';
            historyContent.style.padding = '25px';
            toggleIcon.classList.remove('fa-chevron-down');
            toggleIcon.classList.add('fa-chevron-up');
        }
    }, 100);
}

function displayTrackingResults(tracking) {
    const resultsDiv = document.getElementById('trackingResults');
    if (!resultsDiv) return;

    const estimatedDelivery = new Date(tracking.service.estimatedDelivery).toLocaleDateString();
    const lastUpdated = new Date(tracking.dates.lastUpdated).toLocaleString();

    // Get the latest status update information BEFORE reversing the array
    const latestUpdate = tracking.status.history && tracking.status.history.length > 0
        ? tracking.status.history[tracking.status.history.length - 1]
        : null;

    console.log('Latest update:', latestUpdate); // Debug log

    const currentEstimatedArrival = latestUpdate?.estimatedArrival
        ? new Date(latestUpdate.estimatedArrival).toLocaleString()
        : estimatedDelivery;

    const isCurrentlyHeld = latestUpdate?.isHeld || false;
    const currentLocation = latestUpdate?.location || 'Processing Center';
    const currentTransportation = latestUpdate?.transportationType || null;
    const currentVehicle = latestUpdate?.vehicleId || null;
    const holdReason = latestUpdate?.holdReason || null;

    let historyHTML = '';
    if (tracking.status.history && tracking.status.history.length > 0) {
        historyHTML = tracking.status.history.slice().reverse().map((item, index) => {
            const timestamp = new Date(item.timestamp).toLocaleString();
            const transportIcon = getTransportIcon(item.transportationType);
            const itemId = `history-item-${index}`;
            const detailsId = `history-details-${index}`;

            return `
                <div class="history-update-card ${item.isHeld ? 'held-item' : ''}" id="${itemId}">
                    <div class="update-header" data-action="toggleHistoryUpdate" data-details-id="${detailsId}" data-card-id="${itemId}">>
                        <div class="update-summary">
                            <div class="update-icon">
                                <i class="fas fa-${getStatusIcon(item.status)}"></i>
                            </div>
                            <div class="update-title">
                                <h4>${formatStatus(item.status)} ${item.isHeld ? '<span class="hold-badge">HELD</span>' : ''}</h4>
                                <p class="update-timestamp">
                                    <i class="fas fa-clock"></i> ${timestamp}
                                    ${item.location ? ` • <i class="fas fa-map-marker-alt"></i> ${item.location}` : ''}
                                </p>
                            </div>
                        </div>
                        <div class="update-controls">
                            <span class="expand-icon" id="expand-${itemId}">
                                <i class="fas fa-chevron-down"></i>
                            </span>
                            <button class="close-update-btn" data-action="closeHistoryUpdate" data-param="${itemId}" title="Hide this update">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>

                    <div class="update-details collapsed" id="${detailsId}">
                        <div class="details-content">
                            <div class="detail-row">
                                <div class="detail-item">
                                    <i class="fas fa-clipboard-list"></i>
                                    <div>
                                        <span class="detail-label">Description</span>
                                        <span class="detail-value">${item.description}</span>
                                    </div>
                                </div>
                                ${item.location ? `
                                    <div class="detail-item">
                                        <i class="fas fa-map-marker-alt"></i>
                                        <div>
                                            <span class="detail-label">Location</span>
                                            <span class="detail-value">${item.location}</span>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>

                            ${item.transportationType || item.vehicleId || item.estimatedArrival ? `
                                <div class="detail-row">
                                    ${item.transportationType ? `
                                        <div class="detail-item">
                                            <i class="fas fa-${transportIcon}"></i>
                                            <div>
                                                <span class="detail-label">Transportation</span>
                                                <span class="detail-value">${item.transportationType.toUpperCase()}</span>
                                            </div>
                                        </div>
                                    ` : ''}
                                    ${item.vehicleId ? `
                                        <div class="detail-item">
                                            <i class="fas fa-barcode"></i>
                                            <div>
                                                <span class="detail-label">Vehicle/Container</span>
                                                <span class="detail-value">${item.vehicleId}</span>
                                            </div>
                                        </div>
                                    ` : ''}
                                    ${item.estimatedArrival ? `
                                        <div class="detail-item">
                                            <i class="fas fa-calendar-alt"></i>
                                            <div>
                                                <span class="detail-label">Est. Arrival</span>
                                                <span class="detail-value">${new Date(item.estimatedArrival).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ` : ''}
                                </div>
                            ` : ''}

                            ${item.isHeld && item.holdReason ? `
                                <div class="hold-details">
                                    <div class="detail-item hold-info">
                                        <i class="fas fa-pause-circle"></i>
                                        <div>
                                            <span class="detail-label">Hold Reason</span>
                                            <span class="detail-value">${item.holdReason}</span>
                                        </div>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    resultsDiv.innerHTML = `
        <div class="tracking-status">
            <div class="status-main">
                <h3>Package Status: ${formatStatus(tracking.status.current)} ${isCurrentlyHeld ? '<span class="hold-badge">HELD</span>' : ''}</h3>
                <p><strong>Tracking #:</strong> ${tracking.trackingNumber}</p>
                <p><strong>To:</strong> ${tracking.recipient.name}, ${tracking.recipient.city}, ${tracking.recipient.state}</p>
            </div>
            <div class="status-details">
                <p><strong>Service:</strong> ${tracking.service.type.toUpperCase()}</p>
                <p><strong>Est. Arrival:</strong> ${currentEstimatedArrival}</p>
            </div>
        </div>

        <div class="current-status-info">
            <h4><i class="fas fa-info-circle"></i> Current Status Details</h4>
            <div class="status-grid">
                <div class="status-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <div>
                        <strong>Current Location</strong>
                        <p>${currentLocation}</p>
                    </div>
                </div>
                ${latestUpdate?.estimatedArrival ? `
                    <div class="status-item">
                        <i class="fas fa-calendar-check"></i>
                        <div>
                            <strong>Updated Estimated Arrival</strong>
                            <p>${new Date(latestUpdate.estimatedArrival).toLocaleString()}</p>
                        </div>
                    </div>
                ` : ''}
                ${currentTransportation ? `
                    <div class="status-item">
                        <i class="fas fa-${getTransportIcon(currentTransportation)}"></i>
                        <div>
                            <strong>Transportation Type</strong>
                            <p>${currentTransportation.toUpperCase()}</p>
                        </div>
                    </div>
                ` : ''}
                ${currentVehicle ? `
                    <div class="status-item">
                        <i class="fas fa-barcode"></i>
                        <div>
                            <strong>Vehicle/Container ID</strong>
                            <p>${currentVehicle}</p>
                        </div>
                    </div>
                ` : ''}
                ${isCurrentlyHeld ? `
                    <div class="status-item hold-info">
                        <i class="fas fa-pause-circle"></i>
                        <div>
                            <strong>Package Status</strong>
                            <p>CURRENTLY HELD</p>
                        </div>
                    </div>
                ` : ''}
                ${isCurrentlyHeld && holdReason ? `
                    <div class="status-item hold-info">
                        <i class="fas fa-exclamation-triangle"></i>
                        <div>
                            <strong>Hold Reason</strong>
                            <p>${holdReason}</p>
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>

        <div class="tracking-progress">
            <p><strong>Progress: ${tracking.status.progress}%</strong></p>
            <div class="progress-bar">
                <div class="progress-fill" data-width="${tracking.status.progress}"></div>
            </div>
        </div>

        <div class="package-info">
            <p><strong>Package:</strong> ${tracking.package.description} (${tracking.package.weight} lbs)</p>
            <p><strong>Last Updated:</strong> ${lastUpdated}</p>
        </div>

        ${historyHTML ? `
            <div class="tracking-history">
                <div class="history-header" data-action="toggleTrackingHistory">>
                    <h4><i class="fas fa-history"></i> Tracking History</h4>
                    <button class="history-toggle-btn" type="button">
                        <i class="fas fa-chevron-down" id="historyToggleIcon"></i>
                    </button>
                </div>
                <div class="history-content" id="historyContent">
                    ${historyHTML}
                </div>
            </div>
        ` : ''}
    `;

    resultsDiv.style.display = 'block';
    resultsDiv.scrollIntoView({ behavior: 'smooth' });

    // Initialize history as expanded
    initializeTrackingHistory();
}

function getStatusIcon(status) {
    const icons = {
        'pending': 'clock',
        'confirmed': 'check-circle',
        'picked_up': 'truck-pickup',
        'in_transit': 'truck',
        'out_for_delivery': 'shipping-fast',
        'delivered': 'check-circle',
        'exception': 'exclamation-triangle',
        'returned': 'undo'
    };
    return icons[status] || 'info-circle';
}

function getTransportIcon(transportType) {
    const icons = {
        'truck': 'truck',
        'plane': 'plane',
        'ship': 'ship',
        'train': 'train',
        'van': 'shuttle-van',
        'motorcycle': 'motorcycle',
        'warehouse': 'warehouse'
    };
    return icons[transportType] || 'truck';
}

function formatStatus(status) {
    const statusMap = {
        'pending': 'Pending',
        'confirmed': 'Confirmed',
        'picked_up': 'Picked Up',
        'in_transit': 'In Transit',
        'out_for_delivery': 'Out for Delivery',
        'delivered': 'Delivered',
        'exception': 'Exception',
        'returned': 'Returned'
    };
    return statusMap[status] || status;
}

// Apply dynamic colors for status and priority badges
function applyBadgeColors(container) {
    // Status badge colors
    const statusColors = {
        pending: '#ffc107',
        processing: '#17a2b8',
        shipped: '#007bff',
        in_transit: '#28a745',
        delivered: '#28a745',
        cancelled: '#dc3545',
        hold: '#6c757d'
    };

    // Priority badge colors
    const priorityColors = {
        low: '#28a745',
        normal: '#17a2b8',
        high: '#ffc107',
        urgent: '#dc3545'
    };

    // Role badge colors
    const roleColors = {
        admin: '#dc3545',
        staff: '#007bff',
        customer: '#28a745'
    };

    // Apply status colors
    container.querySelectorAll('[data-status-color]').forEach(badge => {
        const status = badge.getAttribute('data-status-color');
        badge.style.backgroundColor = statusColors[status] || '#6c757d';
    });

    // Apply priority colors
    container.querySelectorAll('[data-priority-color]').forEach(badge => {
        const priority = badge.getAttribute('data-priority-color');
        badge.style.backgroundColor = priorityColors[priority] || '#6c757d';
    });

    // Apply role colors
    container.querySelectorAll('[data-role-color]').forEach(badge => {
        const role = badge.getAttribute('data-role-color');
        badge.style.backgroundColor = roleColors[role] || '#6c757d';
    });
}

// Contact form validation
function validateContactMessage() {
    const messageField = document.getElementById('contactMessage');
    const submitBtn = document.getElementById('contactSubmitBtn');

    if (messageField && submitBtn) {
        const messageLength = messageField.value.trim().length;
        submitBtn.disabled = messageLength < 3;

        if (messageLength < 3) {
            submitBtn.style.opacity = '0.5';
            submitBtn.style.cursor = 'not-allowed';
        } else {
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
        }
    }
}

// Contact form handler
function handleContactForm(e) {
    e.preventDefault();

    // Require authentication for contact support
    if (!requireAuth('send support messages')) {
        return;
    }

    showLoading(true);

    const formData = new FormData(e.target);
    const contactData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        subject: formData.get('subject'),
        message: formData.get('message')
    };

    fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactData)
    })
    .then(response => response.json())
    .then(data => {
        showLoading(false);
        if (data.success) {
            showToast(data.message, 'success');
            e.target.reset();
        } else {
            showToast(data.message || 'Error sending message', 'error');
        }
    })
    .catch(error => {
        showLoading(false);
        console.error('Contact form error:', error);
        showToast('Error sending message. Please try again.', 'error');
    });
}

// Authentication handlers
function handleLogin(e) {
    e.preventDefault();
    showLoading(true);

    const formData = new FormData(e.target);
    const loginData = {
        email: formData.get('email'),
        password: formData.get('password')
    };

    fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
    })
    .then(response => response.json())
    .then(data => {
        showLoading(false);
        if (data.success) {
            // Set ALL authentication state
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            currentUser = data.user;
            isAuthenticated = true;
            servicesBlocked = false;

            console.log('[LOGIN SUCCESS] Authentication state set:', {
                user: currentUser.email,
                isAuthenticated,
                servicesBlocked
            });

            updateAuthUI();
            closeModal('loginModal');
            showToast(`🎉 Welcome back, ${data.user.firstName}!`, 'success');
        } else {
            showToast(data.message || 'Login failed', 'error');
        }
    })
    .catch(error => {
        showLoading(false);
        console.error('Login error:', error);
        showToast('Login error. Please try again.', 'error');
    });
}

function handleRegister(e) {
    e.preventDefault();
    showLoading(true);

    const formData = new FormData(e.target);
    const registerData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        password: formData.get('password'),
        phone: formData.get('phone'),
        address: {
            street: formData.get('address.street'),
            city: formData.get('address.city'),
            state: formData.get('address.state'),
            zipCode: formData.get('address.zipCode'),
            country: 'USA'
        }
    };

    fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerData)
    })
    .then(response => response.json())
    .then(data => {
        showLoading(false);
        if (data.success) {
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            currentUser = data.user;
            updateAuthUI();
            closeModal('registerModal');
            showToast(`Welcome to PrimeRoute Cargos, ${data.user.firstName}!`, 'success');
        } else {
            if (data.errors && data.errors.length > 0) {
                data.errors.forEach(error => {
                    showToast(error.msg, 'error');
                });
            } else {
                showToast(data.message || 'Registration failed', 'error');
            }
        }
    })
    .catch(error => {
        showLoading(false);
        console.error('Registration error:', error);
        showToast('Registration error. Please try again.', 'error');
    });
}

// Modal functions
function initializeModals() {
    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });

    // Close modals with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal[style*="block"]');
            if (openModal) {
                closeModal(openModal.id);
            }
        }
    });
}

function showLoginModal() {
    closeModal('registerModal');
    showModal('loginModal');
}

function showRegisterModal() {
    closeModal('loginModal');
    showModal('registerModal');
}

function showAdminRegisterModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'adminRegisterModal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" data-close-modal="adminRegisterModal">&times;</span>
            <h2><i class="fas fa-user-shield"></i> Admin Registration</h2>
            <p class="admin-description">Create an admin account to access the dashboard</p>
            <form id="adminRegisterForm">
                <div class="form-group">
                    <label>First Name</label>
                    <input type="text" name="firstName" value="Admin" required>
                </div>
                <div class="form-group">
                    <label>Last Name</label>
                    <input type="text" name="lastName" value="User" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" placeholder="Admin email address" autocomplete="email" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" name="password" minlength="6" autocomplete="new-password" required>
                </div>
                <div class="form-group">
                    <label>Phone (10+ digits)</label>
                    <input type="tel" name="phone" value="1234567890" required>
                </div>
                <div class="form-group">
                    <label>Street Address</label>
                    <input type="text" name="address.street" required>
                </div>
                <div class="form-group">
                    <label>Street Address</label>
                    <input type="text" name="address.street" value="123 Admin Street" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>City</label>
                        <input type="text" name="address.city" value="Admin City" required>
                    </div>
                    <div class="form-group">
                        <label>State</label>
                        <input type="text" name="address.state" value="CA" placeholder="e.g., California or CA" required>
                    </div>
                    <div class="form-group">
                        <label>ZIP Code</label>
                        <input type="text" name="address.zipCode" value="12345" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Admin Key</label>
                    <input type="password" name="adminKey" autocomplete="off" required>
                    <small class="admin-key-note">Enter the admin key provided by your site administrator.</small>
                </div>
                <button type="submit" class="btn-primary">Create Admin Account</button>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    showModal('adminRegisterModal');

    document.getElementById('adminRegisterForm').addEventListener('submit', handleAdminRegister);
}

function handleAdminRegister(e) {
    e.preventDefault();
    showLoading(true);

    const formData = new FormData(e.target);
    const adminData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        password: formData.get('password'),
        phone: formData.get('phone'),
        address: {
            street: formData.get('address.street'),
            city: formData.get('address.city'),
            state: formData.get('address.state'),
            zipCode: formData.get('address.zipCode')
        },
        adminKey: formData.get('adminKey')
    };

    fetch(`${API_BASE_URL}/api/auth/register-admin`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(adminData)
    })
    .then(response => response.json())
    .then(data => {
        showLoading(false);
        if (data.success) {
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            currentUser = data.user;
            updateAuthUI();
            closeModal('adminRegisterModal');
            document.getElementById('adminRegisterModal').remove();
            showToast(`Welcome Admin ${data.user.firstName}! You now have admin access.`, 'success');
        } else {
            if (data.errors && data.errors.length > 0) {
                data.errors.forEach(error => {
                    showToast(error.msg, 'error');
                });
            } else {
                showToast(data.message || 'Admin registration failed', 'error');
            }
        }
    })
    .catch(error => {
        showLoading(false);
        console.error('Admin registration error:', error);
        showToast('Admin registration error. Please try again.', 'error');
    });
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';

        // Clear form data
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

// User features (placeholder functions)
function showMyShipments() {
    if (!currentUser) {
        showToast('Please login first', 'warning');
        return;
    }

    // Remove user menu
    const userMenu = document.querySelector('.user-menu');
    if (userMenu) userMenu.remove();

    showLoading(true);

    fetch(`${API_BASE_URL}/api/shipments/my-shipments`, {
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        showLoading(false);
        if (data.success) {
            displayMyShipments(data.shipments);
        } else {
            showToast('Error loading shipments', 'error');
        }
    })
    .catch(error => {
        showLoading(false);
        console.error('Error loading shipments:', error);
        showToast('Error loading shipments', 'error');
    });
}

function getStatusClass(status) {
    const statusClasses = {
        'pending': 'status-pending',
        'confirmed': 'status-confirmed',
        'picked_up': 'status-picked-up',
        'in_transit': 'status-in-transit',
        'out_for_delivery': 'status-out-for-delivery',
        'delivered': 'status-delivered',
        'exception': 'status-exception',
        'returned': 'status-returned'
    };
    return statusClasses[status] || 'status-default';
}

function displayMyShipments(shipments) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'shipmentsModal';
    modal.innerHTML = `
        <div class="modal-content my-shipments-modal">
            <div class="modal-header">
                <h2><i class="fas fa-boxes"></i> My Shipments</h2>
                <span class="close" data-close-modal="shipmentsModal">&times;</span>
            </div>
            <div class="modal-body">
                ${shipments.length === 0 ? `
                    <div class="empty-shipments">
                        <i class="fas fa-shipping-fast empty-icon"></i>
                        <h3>No Shipments Found</h3>
                        <p>You haven't created any shipments yet. Create your first shipment to get started!</p>
                        <button data-action="createFirstShipment" class="btn-primary">
                            <i class="fas fa-plus"></i> Create Shipment
                        </button>
                    </div>
                ` : `
                    <div class="shipments-summary">
                        <div class="summary-stats">
                            <div class="stat-item">
                                <i class="fas fa-boxes"></i>
                                <div>
                                    <span class="stat-number">${shipments.length}</span>
                                    <span class="stat-label">Total Shipments</span>
                                </div>
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-truck"></i>
                                <div>
                                    <span class="stat-number">${shipments.filter(s => ['in_transit', 'out_for_delivery'].includes(s.status.current)).length}</span>
                                    <span class="stat-label">In Transit</span>
                                </div>
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-check-circle"></i>
                                <div>
                                    <span class="stat-number">${shipments.filter(s => s.status.current === 'delivered').length}</span>
                                    <span class="stat-label">Delivered</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="shipments-list">
                        ${shipments.map(shipment => {
                            const statusClass = getStatusClass(shipment.status.current);
                            const statusIcon = getStatusIcon(shipment.status.current);
                            const lastUpdate = shipment.status.history && shipment.status.history.length > 0
                                ? shipment.status.history[shipment.status.history.length - 1]
                                : null;

                            return `
                                <div class="my-shipment-card ${statusClass}">
                                    <div class="shipment-header">
                                        <div class="tracking-info">
                                            <h3><i class="fas fa-barcode"></i> ${shipment.trackingNumber}</h3>
                                            <div class="status-badge ${statusClass}">
                                                <i class="fas fa-${statusIcon}"></i>
                                                ${formatStatus(shipment.status.current)}
                                                ${lastUpdate?.isHeld ? '<span class="hold-indicator">HELD</span>' : ''}
                                            </div>
                                        </div>
                                        <div class="shipment-actions">
                                            <button data-action="trackPackage" data-param="${shipment.trackingNumber}" class="btn-track">
                                                <i class="fas fa-search"></i> Track
                                            </button>
                                        </div>
                                    </div>

                                    <div class="shipment-details">
                                        <div class="detail-section">
                                            <div class="detail-item">
                                                <i class="fas fa-user"></i>
                                                <div>
                                                    <span class="detail-label">Recipient</span>
                                                    <span class="detail-value">${shipment.recipient.name}</span>
                                                </div>
                                            </div>
                                            <div class="detail-item">
                                                <i class="fas fa-map-marker-alt"></i>
                                                <div>
                                                    <span class="detail-label">Destination</span>
                                                    <span class="detail-value">${shipment.recipient.address.city}, ${shipment.recipient.address.state}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="detail-section">
                                            <div class="detail-item">
                                                <i class="fas fa-shipping-fast"></i>
                                                <div>
                                                    <span class="detail-label">Service</span>
                                                    <span class="detail-value">${shipment.service.type.toUpperCase()}</span>
                                                </div>
                                            </div>
                                            <div class="detail-item">
                                                <i class="fas fa-calendar"></i>
                                                <div>
                                                    <span class="detail-label">Est. Delivery</span>
                                                    <span class="detail-value">${new Date(shipment.service.estimatedDelivery).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        ${lastUpdate?.location ? `
                                            <div class="detail-section">
                                                <div class="detail-item">
                                                    <i class="fas fa-location-dot"></i>
                                                    <div>
                                                        <span class="detail-label">Last Location</span>
                                                        <span class="detail-value">${lastUpdate.location}</span>
                                                    </div>
                                                </div>
                                                <div class="detail-item">
                                                    <i class="fas fa-clock"></i>
                                                    <div>
                                                        <span class="detail-label">Last Update</span>
                                                        <span class="detail-value">${new Date(lastUpdate.timestamp).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ` : ''}
                                    </div>

                                    <div class="shipment-footer">
                                        <div class="cost-info">
                                            <span class="cost-label">Shipping Cost:</span>
                                            <span class="cost-value">$${shipment.service.cost?.toFixed(2) || 'N/A'}</span>
                                        </div>
                                        <div class="date-info">
                                            <span class="date-label">Shipped:</span>
                                            <span class="date-value">${new Date(shipment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    showModal('shipmentsModal');
}

function showProfile() {
    if (!currentUser) {
        showToast('Please login first', 'warning');
        return;
    }

    // Remove user menu
    const userMenu = document.querySelector('.user-menu');
    if (userMenu) userMenu.remove();

    // Fetch current user profile
    showLoading(true);

    fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        showLoading(false);
        if (data.success) {
            displayProfileModal(data.user);
        } else {
            showToast('Error loading profile', 'error');
        }
    })
    .catch(error => {
        showLoading(false);
        console.error('Error loading profile:', error);
        showToast('Error loading profile', 'error');
    });
}

function displayProfileModal(user) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'profileModal';
    modal.innerHTML = `
        <div class="modal-content profile-modal">
            <div class="modal-header">
                <h2><i class="fas fa-user-circle"></i> My Profile</h2>
                <span class="close" data-close-modal="profileModal">&times;</span>
            </div>
            <div class="modal-body">
                <form id="profileForm">
                    <div class="profile-section">
                        <h3><i class="fas fa-user"></i> Personal Information</h3>
                        <div class="form-row">
                            <div class="form-group half-width">
                                <label><i class="fas fa-user"></i> First Name</label>
                                <input type="text" name="firstName" value="${user.firstName}" required>
                            </div>
                            <div class="form-group half-width">
                                <label><i class="fas fa-user"></i> Last Name</label>
                                <input type="text" name="lastName" value="${user.lastName}" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-envelope"></i> Email Address</label>
                            <input type="email" value="${user.email}" disabled class="disabled-field">
                            <small class="field-note">Email cannot be changed</small>
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-phone"></i> Phone Number</label>
                            <input type="tel" name="phone" value="${user.phone || ''}" placeholder="(555) 123-4567" required>
                        </div>
                    </div>

                    <div class="profile-section">
                        <h3><i class="fas fa-map-marker-alt"></i> Address Information</h3>
                        <div class="form-group">
                            <label><i class="fas fa-road"></i> Street Address</label>
                            <input type="text" name="address.street" value="${user.address?.street || ''}" placeholder="123 Main Street" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group half-width">
                                <label><i class="fas fa-city"></i> City</label>
                                <input type="text" name="address.city" value="${user.address?.city || ''}" placeholder="New York" required>
                            </div>
                            <div class="form-group quarter-width">
                                <label><i class="fas fa-flag"></i> State</label>
                                <input type="text" name="address.state" value="${user.address?.state || ''}" placeholder="NY" required maxlength="2">
                            </div>
                            <div class="form-group quarter-width">
                                <label><i class="fas fa-mail-bulk"></i> ZIP Code</label>
                                <input type="text" name="address.zipCode" value="${user.address?.zipCode || ''}" placeholder="10001" required>
                            </div>
                        </div>
                    </div>

                    <div class="profile-actions">
                        <button type="button" class="btn-secondary" data-action="closeModal" data-param="profileModal">Cancel</button>
                        <button type="submit" class="btn-primary"><i class="fas fa-save"></i> Update Profile</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    showModal('profileModal');

    // Handle form submission
    document.getElementById('profileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoading(true);

        const formData = new FormData(e.target);
        const profileData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            phone: formData.get('phone'),
            address: {
                street: formData.get('address.street'),
                city: formData.get('address.city'),
                state: formData.get('address.state'),
                zipCode: formData.get('address.zipCode')
            }
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(profileData)
            });

            const data = await response.json();
            showLoading(false);

            if (data.success) {
                currentUser = data.user;
                updateAuthUI();
                showToast('Profile updated successfully!', 'success');
                closeModal('profileModal');
                modal.remove();
            } else {
                showToast(data.message || 'Error updating profile', 'error');
            }
        } catch (error) {
            showLoading(false);
            console.error('Profile update error:', error);
            showToast('Error updating profile', 'error');
        }
    });
}

function showAdminDashboard() {
    if (!currentUser || currentUser.role !== 'admin') {
        showToast('Admin access required', 'error');
        return;
    }

    // Remove user menu
    const userMenu = document.querySelector('.user-menu');
    if (userMenu) userMenu.remove();

    showLoading(true);

    fetch(`${API_BASE_URL}/api/admin/dashboard`, {
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        showLoading(false);
        if (data.success) {
            displayAdminDashboard(data.stats);
        } else {
            showToast('Error loading dashboard', 'error');
        }
    })
    .catch(error => {
        showLoading(false);
        console.error('Error loading dashboard:', error);
        showToast('Error loading dashboard', 'error');
    });
}

function loadAdminShipments(page = 1, status = 'all', search = '') {
    showLoading(true);

    const params = new URLSearchParams({
        page: page,
        limit: 20,
        status: status,
        search: search
    });

    fetch(`${API_BASE_URL}/api/shipments/admin/all-shipments?${params}`, {
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        showLoading(false);
        if (data.success) {
            displayAdminShipments(data.shipments, data.pagination);
        } else {
            showToast('Error loading shipments', 'error');
        }
    })
    .catch(error => {
        showLoading(false);
        console.error('Error loading shipments:', error);
        showToast('Error loading shipments', 'error');
    });
}

function displayAdminShipments(shipments) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'adminShipmentsModal';
    modal.innerHTML = `
        <div class="modal-content modal-content-dashboard">
            <div class="modal-header">
                <h2><i class="fas fa-shipping-fast"></i> Manage Shipments</h2>
                <span class="close" data-close-modal="adminShipmentsModal">&times;</span>
            </div>
            <div class="modal-body">
                <div class="shipments-controls">
                    <input type="text" id="shipmentSearch" placeholder="Search by tracking number, name, or email..." class="shipment-search-input">
                    <select id="statusFilter" data-action="filterShipments" class="status-filter-select">
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="picked_up">Picked Up</option>
                        <option value="in_transit">In Transit</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="exception">Exception</option>
                    </select>
                    <button data-action="searchShipments" class="search-shipments-btn">
                        <i class="fas fa-search"></i> Search
                    </button>
                </div>
                <div class="shipments-list">
                    ${shipments.map(shipment => `
                        <div class="shipment-item">
                            <div class="shipment-item-header">
                                <div class="shipment-item-left">
                                    <h4 class="tracking-number">${shipment.trackingNumber}</h4>
                                    <p class="shipment-detail"><strong>From:</strong> ${shipment.sender?.name || 'N/A'}</p>
                                    <p class="shipment-detail"><strong>To:</strong> ${shipment.recipient.name}</p>
                                    <p class="shipment-detail"><strong>Status:</strong> <span class="status-badge status-${shipment.status.current}">${formatStatus(shipment.status.current)}</span></p>
                                    <p class="shipment-detail"><strong>Service:</strong> ${shipment.service.type.toUpperCase()}</p>
                                    ${shipment.status.history && shipment.status.history.length > 0 ? `
                                        <p class="shipment-detail"><strong>Last Update:</strong> ${shipment.status.history[shipment.status.history.length - 1].location || 'Processing Center'}</p>
                                    ` : ''}
                                </div>
                                <div class="shipment-item-right">
                                    <p><strong>$${shipment.service.cost?.toFixed(2) || 'N/A'}</strong></p>
                                    <p class="shipment-date">${new Date(shipment.createdAt).toLocaleDateString()}</p>
                                    <button data-action="showStatusUpdateModal" data-param="${shipment.trackingNumber}" class="action-button btn-primary">
                                        <i class="fas fa-edit"></i> Update Status
                                    </button>
                                    <button data-action="viewShipmentDetails" data-param="${shipment.trackingNumber}" class="action-button btn-secondary">
                                        <i class="fas fa-eye"></i> View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    showModal('adminShipmentsModal');
}

// Show detailed status update modal
function showStatusUpdateModal(trackingNumber) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'statusUpdateModal';
    modal.innerHTML = `
        <div class="modal-content modal-content-wide">
            <div class="modal-header">
                <h2>Update Shipment Status</h2>
                <span class="close" data-close-modal="statusUpdateModal">&times;</span>
            </div>
            <div class="modal-body">
                <form id="statusUpdateForm">
                    <input type="hidden" name="trackingNumber" value="${trackingNumber}">

                    <h3>Status Information</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Status *</label>
                            <select name="status" required>
                                <option value="">Select Status</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="picked_up">Picked Up</option>
                                <option value="in_transit">In Transit</option>
                                <option value="out_for_delivery">Out for Delivery</option>
                                <option value="delivered">Delivered</option>
                                <option value="exception">Exception</option>
                                <option value="returned">Returned</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Location *</label>
                            <input type="text" name="location" required placeholder="Current location">
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Description *</label>
                        <textarea name="description" required rows="3" placeholder="Status update description"></textarea>
                    </div>

                    <h3>Transportation Details</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Transportation Type</label>
                            <select name="transportationType">
                                <option value="">Not specified</option>
                                <option value="truck">Truck</option>
                                <option value="plane">Plane</option>
                                <option value="ship">Ship</option>
                                <option value="train">Train</option>
                                <option value="van">Van</option>
                                <option value="motorcycle">Motorcycle</option>
                                <option value="warehouse">Warehouse</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Vehicle ID</label>
                            <input type="text" name="vehicleId" placeholder="Vehicle/Container ID">
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Estimated Arrival</label>
                        <input type="datetime-local" name="estimatedArrival">
                    </div>

                    <h3>Hold Information</h3>
                    <div class="form-group">
                        <label class="form-label-checkbox">
                            <input type="checkbox" name="isHeld" data-action="toggleHoldReason">
                            Package is currently held
                        </label>
                    </div>

                    <div class="form-group form-group-hidden" id="holdReasonGroup">
                        <label>Hold Reason</label>
                        <textarea name="holdReason" rows="2" placeholder="Reason for holding package"></textarea>
                    </div>

                    <div class="form-actions">
                        <button type="button" data-action="showAdminDashboard" class="btn-secondary btn-margin-right">Cancel</button>
                        <button type="submit" class="btn-primary">Update Status</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    showModal('statusUpdateModal');

    // Handle form submission
    document.getElementById('statusUpdateForm').addEventListener('submit', handleStatusUpdate);
}

// Toggle hold reason field
function toggleHoldReason(checkbox) {
    const holdReasonGroup = document.getElementById('holdReasonGroup');
    const holdReasonTextarea = holdReasonGroup.querySelector('textarea');

    console.log('Toggling hold reason:', checkbox.checked);

    if (checkbox.checked) {
        holdReasonGroup.classList.remove('form-group-hidden');
        holdReasonGroup.style.display = 'block';
        holdReasonTextarea.required = true;
        holdReasonTextarea.focus();
    } else {
        holdReasonGroup.classList.add('form-group-hidden');
        holdReasonGroup.style.display = 'none';
        holdReasonTextarea.required = false;
        holdReasonTextarea.value = '';
    }
}

// Handle status update form submission
async function handleStatusUpdate(e) {
    e.preventDefault();
    showLoading(true);

    const formData = new FormData(e.target);
    const trackingNumber = formData.get('trackingNumber');

    // Get hold status
    const isHeld = formData.get('isHeld') === 'on';
    const holdReason = formData.get('holdReason');

    // Validate hold reason if package is held
    if (isHeld && (!holdReason || holdReason.trim() === '')) {
        showLoading(false);
        showToast('Hold reason is required when package is held', 'error');
        return;
    }

    const updateData = {
        status: formData.get('status'),
        location: formData.get('location'),
        description: formData.get('description'),
        transportationType: formData.get('transportationType') || null,
        vehicleId: formData.get('vehicleId') || null,
        estimatedArrival: formData.get('estimatedArrival') || null,
        isHeld: isHeld,
        holdReason: isHeld ? holdReason.trim() : null
    };

    console.log('Updating status for:', trackingNumber, updateData);

    try {
        const response = await fetch(`${API_BASE_URL}/api/shipments/admin/update-status/${trackingNumber}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(updateData)
        });

        const data = await response.json();
        showLoading(false);

        if (data.success) {
            const statusMessage = isHeld ?
                'Shipment updated successfully - Package is now held' :
                'Shipment updated successfully';
            showToast(statusMessage, 'success');
            closeModal('statusUpdateModal');
            document.getElementById('statusUpdateModal').remove();
            loadAdminShipments(); // Refresh the list
        } else {
            showToast(data.message || 'Error updating status', 'error');
        }
    } catch (error) {
        showLoading(false);
        console.error('Status update error:', error);
        showToast('Error updating shipment status', 'error');
    }
}

// Search and filter functions
function searchShipments() {
    const search = document.getElementById('shipmentSearch').value;
    const status = document.getElementById('statusFilter').value;
    loadAdminShipments(1, status, search);
}

function filterShipments() {
    searchShipments();
}

// View detailed shipment information
function viewShipmentDetails(trackingNumber) {
    // This will use the existing tracking functionality but in admin context
    trackPackage(trackingNumber);
}

function updateShipmentStatus(trackingNumber, newStatus) {
    if (!newStatus) return;

    showLoading(true);

    fetch(`${API_BASE_URL}/api/shipments/admin/update-status/${trackingNumber}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
            status: newStatus,
            description: newStatus === 'confirmed' ? 'Shipment status awaiting confirmation' : `Status updated to ${newStatus} by admin`
        })
    })
    .then(response => response.json())
    .then(data => {
        showLoading(false);
        if (data.success) {
            showToast('Status updated successfully', 'success');
            loadAdminShipments(); // Refresh the list
        } else {
            showToast('Error updating status', 'error');
        }
    })
    .catch(error => {
        showLoading(false);
        console.error('Error updating status:', error);
        showToast('Error updating status', 'error');
    });
}

// Utility functions
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = show ? 'flex' : 'none';
    }
}

function createToast(className, role) {
    const container = document.getElementById('toastContainer');
    if (!container) return null;

    const toast = document.createElement('div');
    toast.className = className;
    toast.setAttribute('role', role);

    const content = document.createElement('div');
    content.className = 'toast-content';

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'toast-close-btn';
    closeButton.setAttribute('data-action', 'closeToast');
    closeButton.setAttribute('aria-label', 'Dismiss notification');
    closeButton.textContent = '×';

    content.appendChild(closeButton);
    toast.appendChild(content);
    container.appendChild(toast);

    return { toast, content };
}

function showToast(message, type = 'info') {
    const role = type === 'error' ? 'alert' : 'status';
    const notification = createToast(`toast ${type}`, role);
    if (!notification) return;

    const messageElement = document.createElement('span');
    messageElement.textContent = String(message);
    notification.content.insertBefore(messageElement, notification.content.firstChild);

    setTimeout(() => {
        notification.toast.remove();
    }, 5000);
}

function showShipmentSuccessNotification(trackingNumber) {
    const notification = createToast('toast shipment-success', 'status');
    if (!notification) return;

    const message = document.createElement('div');
    message.className = 'shipment-notification-content';

    const icon = document.createElement('div');
    icon.className = 'shipment-icon';
    icon.textContent = '📦';

    const details = document.createElement('div');
    details.className = 'shipment-details';

    const heading = document.createElement('h4');
    heading.textContent = '🎉 Shipment Created Successfully!';
    const label = document.createElement('p');
    label.textContent = 'Tracking Number:';
    const trackingNumberDisplay = document.createElement('div');
    trackingNumberDisplay.className = 'tracking-number-display';
    trackingNumberDisplay.textContent = String(trackingNumber);
    const note = document.createElement('p');
    note.className = 'shipment-note';
    note.textContent = 'You can track your package using this number';

    details.append(heading, label, trackingNumberDisplay, note);
    message.append(icon, details);
    notification.content.insertBefore(message, notification.content.firstChild);

    setTimeout(() => {
        notification.toast.remove();
    }, 8000);
}

function showShipmentErrorNotification(errorMessage) {
    const notification = createToast('toast shipment-error', 'alert');
    if (!notification) return;

    const message = document.createElement('div');
    message.className = 'shipment-notification-content';

    const icon = document.createElement('div');
    icon.className = 'shipment-icon';
    icon.textContent = '❌';

    const details = document.createElement('div');
    details.className = 'shipment-details';

    const heading = document.createElement('h4');
    heading.textContent = 'Shipment Creation Failed';
    const error = document.createElement('p');
    error.className = 'error-message';
    error.textContent = String(errorMessage);
    const note = document.createElement('p');
    note.className = 'shipment-note';
    note.textContent = 'Please check your information and try again';

    details.append(heading, error, note);
    message.append(icon, details);
    notification.content.insertBefore(message, notification.content.firstChild);

    setTimeout(() => {
        notification.toast.remove();
    }, 7000);
}

// Scroll animations (intersection observer)
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.service-card, .feature-item, .stat-item').forEach(el => {
        observer.observe(el);
    });
}

// Initialize scroll animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeScrollAnimations, 500);
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Add CSS for scroll effects and animations
const style = document.createElement('style');
style.textContent = `
    .navbar.scrolled {
        background: rgba(255, 255, 255, 0.98);
        box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
    }

    .animate-in {
        animation: fadeInUp 0.6s ease forwards;
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .user-menu {
        position: fixed;
        top: 70px;
        right: 20px;
        z-index: 2000;
        background: white;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        min-width: 200px;
        animation: fadeInDown 0.3s ease;
    }

    .user-menu-content {
        padding: 20px;
    }

    .user-info {
        padding-bottom: 15px;
        border-bottom: 1px solid #eee;
        margin-bottom: 15px;
    }

    .user-info strong {
        display: block;
        color: #333;
    }

    .user-info small {
        color: #666;
        font-size: 0.9rem;
    }

    .user-menu-list {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .user-menu-list li {
        margin-bottom: 8px;
    }

    .user-menu-list a {
        text-decoration: none;
        color: #333;
        display: block;
        padding: 8px 0;
        border-radius: 4px;
        transition: color 0.3s ease;
    }

    .user-menu-list a:hover {
        color: #1762c4;
    }

    @keyframes fadeInDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* Admin Registration Modal Styles */
    #adminRegisterModal .modal-content {
        max-width: 600px;
        max-height: 90vh;
        overflow-y: auto;
    }

    #adminRegisterModal h2 {
        color: #dc3545;
        text-align: center;
        margin-bottom: 10px;
    }

    #adminRegisterModal p {
        text-align: center;
        margin-bottom: 25px;
        font-size: 0.9rem;
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr 100px 120px;
        gap: 15px;
        margin-bottom: 15px;
    }

    .form-group {
        margin-bottom: 15px;
    }

    .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
        color: #333;
    }

    .form-group input {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        transition: border-color 0.3s ease;
    }

    .form-group input:focus {
        outline: none;
        border-color: #1762c4;
        box-shadow: 0 0 5px rgba(23, 98, 196, 0.3);
    }

    .form-group small {
        display: block;
        margin-top: 5px;
        font-size: 0.8rem;
        color: #666;
    }

    .btn-admin {
        background: #dc3545;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background-color 0.3s ease;
    }

    .btn-admin:hover {
        background: #c82333;
    }

    /* CSP Compliance Classes */
    .admin-description {
        color: #666;
        margin-bottom: 20px;
    }

    .admin-key-note {
        color: #666;
    }

    .progress-fill {
        transition: width 0.3s ease;
    }

    .back-to-dashboard {
        margin-bottom: 15px;
    }

    .shipments-controls {
        margin-bottom: 20px;
    }

    .shipment-search-input {
        padding: 8px;
        width: 300px;
        margin-right: 10px;
    }

    .status-filter-select {
        padding: 8px;
        margin-right: 10px;
    }

    .search-shipments-btn {
        padding: 8px 15px;
    }

    .shipment-item {
        border: 1px solid #ddd;
        padding: 15px;
        margin: 10px 0;
        border-radius: 8px;
        background: white;
    }

    .shipment-item-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        flex-wrap: wrap;
    }

    .shipment-item-left {
        flex: 1;
        min-width: 250px;
    }

    .shipment-item-right {
        text-align: right;
        min-width: 200px;
    }

    .tracking-number {
        margin: 0 0 10px 0;
        color: #1762c4;
    }

    .shipment-detail {
        margin: 5px 0;
    }

    .shipment-date {
        margin: 5px 0;
        font-size: 0.9em;
        color: #666;
    }

    .action-button {
        padding: 8px 12px;
        margin: 5px 0;
        font-size: 0.9em;
    }

    @media (max-width: 768px) {
        .form-row {
            grid-template-columns: 1fr;
        }

        #adminRegisterModal .modal-content {
            margin: 20px;
            max-width: calc(100% - 40px);
        }

        .shipment-item-header {
            flex-direction: column;
        }

        .shipment-item-right {
            text-align: left;
            margin-top: 10px;
        }

        .shipment-search-input {
            width: 100%;
            margin-bottom: 10px;
        }
    }
`;
document.head.appendChild(style);// Customer Support Functions
function loadCustomerSupport() {
    // Check if user is authenticated
    if (!authToken) {
        showToast('Please login to access customer support', 'error');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'supportModal';
    modal.innerHTML = `
        <div class="modal-content modal-content-extra-wide">
            <div class="modal-header">
                <h2><i class="fas fa-headset"></i> Customer Support</h2>
                <span class="close" data-close-modal="supportModal">&times;</span>
            </div>
            <div class="modal-body">
                <div class="support-stats">
                    <div class="stat-card">
                        <div class="stat-icon new">
                            <i class="fas fa-envelope"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="newMessagesCount">0</h3>
                            <p>New Messages</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon progress">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="inProgressCount">0</h3>
                            <p>In Progress</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon resolved">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="resolvedCount">0</h3>
                            <p>Resolved</p>
                        </div>
                    </div>
                </div>

                <div class="support-filters">
                    <div class="filter-group">
                        <select id="statusFilter" data-action="filterSupportMessages">
                            <option value="">All Status</option>
                            <option value="new">New</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                    <div class="search-group">
                        <input type="text" id="supportSearch" placeholder="Search messages...">
                        <button data-action="refreshSupportMessages" class="refresh-btn">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                </div>

                <div class="support-messages" id="supportMessagesList">
                    <div class="loading-placeholder">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Loading messages...</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    showModal('supportModal');
    loadSupportMessages();
}

let currentSupportPage = 1;
let supportFilters = { status: '', search: '' };

async function loadSupportMessages(page = 1) {
    try {
        showLoading(true);
        const params = new URLSearchParams({ page, limit: 20, ...supportFilters });
        const response = await fetch(`${API_BASE_URL}/api/contact/admin/messages?${params}`, {
            headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' }
        });

        if (response.status === 401) {
            showToast('Authentication failed. Please login again.', 'error');
            logout();
            return;
        }

        const result = await response.json();
        if (result.success) {
            displaySupportMessages(result.data.messages);
            updateSupportStats(result.data.stats);
        } else {
            showToast(result.message || 'Error loading messages', 'error');
        }
    } catch (error) {
        console.error('Error loading support messages:', error);
        showToast('Error loading messages', 'error');
    } finally {
        showLoading(false);
    }
}

function displaySupportMessages(messages) {
    const container = document.getElementById('supportMessagesList');
    if (!messages || messages.length === 0) {
        container.innerHTML = '<div class="no-messages"><i class="fas fa-inbox fa-3x"></i><h3>No Messages Found</h3></div>';
        return;
    }
    container.innerHTML = messages.map(message => `
        <div class="support-message-card status-${message.status}" data-action="viewSupportMessage" data-param="${message._id}">
            <div class="message-header">
                <div class="message-info">
                    <h4>${message.name}</h4>
                    <div class="message-meta">
                        <span>${message.reference}</span> •
                        <span>${message.subject}</span> •
                        <span>${message.email}</span>
                    </div>
                </div>
                <div class="message-status">
                    <span class="status-badge status-${message.status}">${message.status.toUpperCase()}</span>
                </div>
            </div>
            <div class="message-preview">
                <p>${message.message.length > 120 ? message.message.substring(0, 120) + '...' : message.message}</p>
            </div>
            <div class="message-footer">
                <small>Created: ${new Date(message.createdAt).toLocaleDateString()}</small>
                <small>Responses: ${message.responses.length}</small>
            </div>
        </div>
    `).join('');
}

function updateSupportStats(stats) {
    if (document.getElementById('newMessagesCount')) {
        document.getElementById('newMessagesCount').textContent = stats.new || 0;
        document.getElementById('inProgressCount').textContent = stats['in-progress'] || 0;
        document.getElementById('resolvedCount').textContent = stats.resolved || 0;
    }
}

function filterSupportMessages() {
    supportFilters.status = document.getElementById('statusFilter').value;
    supportFilters.search = document.getElementById('supportSearch').value;
    loadSupportMessages(1);
}

function refreshSupportMessages() {
    loadSupportMessages(currentSupportPage);
}

async function viewSupportMessage(messageId) {
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/contact/admin/messages/${messageId}`, {
            headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' }
        });

        if (response.status === 401) {
            showToast('Authentication failed. Please login again.', 'error');
            logout();
            return;
        }

        const result = await response.json();
        if (result.success) {
            showMessageDetailModal(result.data);
        } else {
            showToast(result.message || 'Error loading message', 'error');
        }
    } catch (error) {
        console.error('Error loading support message:', error);
        showToast('Error loading message', 'error');
    } finally {
        showLoading(false);
    }
}

function showMessageDetailModal(message) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'messageDetailModal';

    const statusColors = {
        'new': '#007bff',
        'in-progress': '#ffc107',
        'resolved': '#28a745',
        'closed': '#6c757d'
    };

    const priorityColors = {
        'low': '#28a745',
        'medium': '#ffc107',
        'high': '#fd7e14',
        'urgent': '#dc3545'
    };

    modal.innerHTML = `
        <div class="modal-content modal-content-medium">
            <div class="modal-header">
                <h2><i class="fas fa-envelope-open"></i> Message Details</h2>
                <span class="close" data-close-modal="messageDetailModal">&times;</span>
            </div>
            <div class="modal-body">
                <div class="message-detail-header">
                    <div class="message-info">
                        <h3>${message.name}</h3>
                        <p><i class="fas fa-envelope"></i> ${message.email}</p>
                        ${message.phone ? `<p><i class="fas fa-phone"></i> ${message.phone}</p>` : ''}
                        <p><i class="fas fa-hashtag"></i> ${message.reference}</p>
                    </div>
                    <div class="message-badges">
                        <span class="status-badge status-badge-custom" data-status-color="${message.status}">
                            ${message.status.toUpperCase()}
                        </span>
                        <span class="priority-badge priority-badge-custom" data-priority-color="${message.priority}">
                            ${message.priority ? message.priority.toUpperCase() : 'NORMAL'}
                        </span>
                    </div>
                </div>

                <div class="message-content">
                    <h4>Subject: ${message.subject}</h4>
                    <div class="message-text">
                        <p>${message.message}</p>
                    </div>
                </div>

                <div class="message-meta">
                    <p><strong>Received:</strong> ${new Date(message.createdAt).toLocaleString()}</p>
                    ${message.assignedTo ? `<p><strong>Assigned to:</strong> ${message.assignedTo.firstName} ${message.assignedTo.lastName}</p>` : ''}
                </div>

                ${message.responses && message.responses.length > 0 ? `
                    <div class="message-responses">
                        ${(() => {
                            const customerResponses = message.responses.filter(r => !r.isInternal);
                            const internalNotes = message.responses.filter(r => r.isInternal);

                            let html = '';

                            if (customerResponses.length > 0) {
                                html += `
                                    <h4><i class="fas fa-comments"></i> Customer Responses (${customerResponses.length})</h4>
                                    <div class="customer-responses">
                                        ${customerResponses.map(response => `
                                            <div class="response-item customer-response">
                                                <div class="response-header">
                                                    <strong>${response.adminName || 'Admin'}</strong>
                                                    <span class="response-date">${new Date(response.timestamp || response.createdAt).toLocaleString()}</span>
                                                </div>
                                                <div class="response-text">${response.message}</div>
                                            </div>
                                        `).join('')}
                                    </div>
                                `;
                            }

                            if (internalNotes.length > 0) {
                                html += `
                                    <h4><i class="fas fa-sticky-note"></i> Internal Notes (${internalNotes.length})</h4>
                                    <div class="internal-notes">
                                        ${internalNotes.map(note => `
                                            <div class="response-item internal-note">
                                                <div class="response-header">
                                                    <div class="response-info">
                                                        <strong>${note.adminName || 'Admin'}</strong>
                                                        <span class="response-date">${new Date(note.timestamp || note.createdAt).toLocaleString()}</span>
                                                    </div>
                                                    <div class="response-badges">
                                                        <span class="internal-badge">Internal</span>
                                                        <button class="delete-note-btn" data-action="deleteInternalNote" data-message-id="${message._id}" data-response-id="${note._id}" title="Delete this note">
                                                            <i class="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div class="response-text">${note.message}</div>
                                            </div>
                                        `).join('')}
                                    </div>
                                `;
                            }

                            return html;
                        })()
                        }
                    </div>
                ` : ''}

                <div class="message-actions">
                    <button class="btn-secondary" data-action="closeModal" data-param="messageDetailModal">
                        <i class="fas fa-times"></i> Close
                    </button>
                    <button class="btn-primary" data-action="showResponseForm" data-param="${message._id}">
                        <i class="fas fa-reply"></i> Add Response
                    </button>
                    <button class="btn-warning" data-action="updateMessageStatus" data-param="${message._id}">
                        <i class="fas fa-edit"></i> Update Status
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Apply badge colors after content is added to DOM
    applyBadgeColors(modal);

    showModal('messageDetailModal');
}

function showResponseForm(messageId) {
    // TODO: Implement response form modal
    showToast('Response form coming soon!', 'info');
}

function updateMessageStatus(messageId) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'statusUpdateModal';

    modal.innerHTML = `
        <div class="modal-content modal-content-small">
            <div class="modal-header">
                <h2><i class="fas fa-edit"></i> Update Message Status</h2>
                <span class="close" data-close-modal="statusUpdateModal">&times;</span>
            </div>
            <div class="modal-body">
                <form id="statusUpdateForm">
                    <div class="form-group">
                        <label for="messageStatus">Status:</label>
                        <select id="messageStatus" required>
                            <option value="new">New</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="messagePriority">Priority:</label>
                        <select id="messagePriority">
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="statusNotes">Notes (optional):</label>
                        <textarea id="statusNotes" rows="3" placeholder="Add any notes about this status change..."></textarea>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn-secondary" data-action="closeModal" data-param="statusUpdateModal">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-save"></i> Update Status
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    showModal('statusUpdateModal');

    // Handle form submission
    document.getElementById('statusUpdateForm').addEventListener('submit', (e) => {
        e.preventDefault();
        submitStatusUpdate(messageId);
    });
}

async function deleteInternalNote(messageId, responseId) {
    if (!confirm('Are you sure you want to delete this internal note? This action cannot be undone.')) {
        return;
    }

    try {
        showLoading(true);

        const response = await fetch(`${API_BASE_URL}/api/contact/admin/messages/${messageId}/responses/${responseId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            showToast('Authentication failed. Please login again.', 'error');
            logout();
            return;
        }

        const result = await response.json();

        if (result.success) {
            showToast('Internal note deleted successfully', 'success');

            // Refresh the message details with updated data
            if (result.data) {
                closeModal('messageDetailModal');
                showMessageDetailModal(result.data);
            }

            // Refresh the customer support data
            loadCustomerSupport();
        } else {
            showToast(result.message || 'Failed to delete note', 'error');
        }
    } catch (error) {
        console.error('Delete note error:', error);
        showToast('Error deleting note', 'error');
    } finally {
        showLoading(false);
    }
}

async function submitStatusUpdate(messageId) {
    const status = document.getElementById('messageStatus').value;
    const priority = document.getElementById('messagePriority').value;
    const notes = document.getElementById('statusNotes').value.trim();

    try {
        showLoading(true);

        const updateData = { status, priority };
        if (notes) {
            updateData.notes = notes;
        }

        const response = await fetch(`${API_BASE_URL}/api/contact/admin/messages/${messageId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (response.status === 401) {
            showToast('Authentication failed. Please login again.', 'error');
            logout();
            return;
        }

        const result = await response.json();

        if (result.success) {
            showToast(`Message status updated to ${status.toUpperCase()}`, 'success');
            closeModal('statusUpdateModal');

            // Refresh the message details with updated data
            if (result.data) {
                closeModal('messageDetailModal');
                showMessageDetailModal(result.data);
            }

            // Refresh the customer support data
            loadCustomerSupport();
        } else {
            showToast(result.message || 'Failed to update status', 'error');
        }
    } catch (error) {
        console.error('Status update error:', error);
        showToast('Error updating status', 'error');
    } finally {
        showLoading(false);
    }
}

function loadAdminUsers() {
    // Check if user is authenticated and has admin role
    if (!authToken) {
        showToast('Please login to access user management', 'error');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'adminUsersModal';
    modal.innerHTML = `
        <div class="modal-content modal-content-dashboard">
            <div class="modal-header">
                <h2><i class="fas fa-users"></i> User Management</h2>
                <span class="close" data-close-modal="adminUsersModal">&times;</span>
            </div>
            <div class="modal-body">
                <div class="user-management-stats">
                    <div class="stat-card">
                        <div class="stat-icon stat-icon-blue">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="totalUsersCount">0</h3>
                            <p>Total Users</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon stat-icon-green">
                            <i class="fas fa-user-shield"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="adminUsersCount">0</h3>
                            <p>Admin Users</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon stat-icon-yellow">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="customerUsersCount">0</h3>
                            <p>Customers</p>
                        </div>
                    </div>
                </div>

                <div class="user-filters">
                    <div class="filter-group">
                        <select id="roleFilter" data-action="filterUsers">
                            <option value="">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="staff">Staff</option>
                            <option value="customer">Customer</option>
                        </select>
                        <select id="verifiedFilter" data-action="filterUsers">
                            <option value="">All Status</option>
                            <option value="true">Verified</option>
                            <option value="false">Unverified</option>
                        </select>
                    </div>
                    <div class="search-group">
                        <input type="text" id="userSearch" placeholder="Search users..." data-action="searchUsers">
                        <button data-action="clearFilters" class="clear-btn" title="Clear all filters">
                            <i class="fas fa-times"></i>
                        </button>
                        <button data-action="refreshUsers" class="refresh-btn">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                        <button data-action="verifyAllUsers" class="verify-btn">
                            <i class="fas fa-check-circle"></i> Verify All
                        </button>
                    </div>
                </div>
                <div class="users-results-info"></div>

                <div class="users-list" id="adminUsersList">
                    <div class="loading-placeholder">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Loading users...</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    showModal('adminUsersModal');

    // Load real user statistics and user list
    loadUserStats();
    loadUsersList();
}

async function loadUserStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users/stats`, {
            headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' }
        });

        if (response.status === 401) {
            showToast('Authentication failed. Please login again.', 'error');
            logout();
            return;
        }

        const result = await response.json();
        if (result.success) {
            document.getElementById('totalUsersCount').textContent = result.data.total;
            document.getElementById('adminUsersCount').textContent = result.data.admin;
            document.getElementById('customerUsersCount').textContent = result.data.customer;
        }
    } catch (error) {
        console.error('Error loading user stats:', error);
        document.getElementById('totalUsersCount').textContent = 'Error';
        document.getElementById('adminUsersCount').textContent = 'Error';
        document.getElementById('customerUsersCount').textContent = 'Error';
    }
}

async function loadUsersList(filters = {}) {
    try {
        showLoading(true);

        // Build query parameters
        const params = new URLSearchParams({ page: 1, limit: 20 });
        if (filters.role) params.append('role', filters.role);
        if (filters.search) params.append('search', filters.search);
        if (filters.verified !== undefined) params.append('verified', filters.verified);

        const response = await fetch(`${API_BASE_URL}/api/admin/users?${params.toString()}`, {
            headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' }
        });

        if (response.status === 401) {
            showToast('Authentication failed. Please login again.', 'error');
            logout();
            return;
        }

        const result = await response.json();
        if (result.success) {
            displayUsersList(result.users);

            // Update results count
            const resultsInfo = document.querySelector('.users-results-info');
            if (resultsInfo) {
                const filterText = Object.keys(filters).length > 0 ? ' (filtered)' : '';
                resultsInfo.textContent = `Showing ${result.users.length} of ${result.pagination.total} users${filterText}`;
            }
        } else {
            document.getElementById('adminUsersList').innerHTML = `
                <div class="no-users">
                    <i class="fas fa-exclamation-triangle fa-3x"></i>
                    <h3>Error Loading Users</h3>
                    <p>${result.message || 'Unable to load user list'}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading users list:', error);
        document.getElementById('adminUsersList').innerHTML = `
            <div class="no-users">
                <i class="fas fa-exclamation-triangle fa-3x"></i>
                <h3>Error Loading Users</h3>
                <p>Unable to connect to server</p>
            </div>
        `;
    } finally {
        showLoading(false);
    }
}

function displayUsersList(users) {
    const container = document.getElementById('adminUsersList');

    if (!users || users.length === 0) {
        container.innerHTML = `
            <div class="no-users">
                <i class="fas fa-users fa-3x"></i>
                <h3>No Users Found</h3>
                <p>No users match the current filters.</p>
            </div>
        `;
        return;
    }

    const roleColors = {
        'admin': '#dc3545',
        'staff': '#ffc107',
        'customer': '#28a745'
    };

    container.innerHTML = users.map(user => `
        <div class="user-card">
            <div class="user-header">
                <div class="user-info">
                    <h4>${user.firstName} ${user.lastName}</h4>
                    <p><i class="fas fa-envelope"></i> ${user.email}</p>
                    ${user.phone ? `<p><i class="fas fa-phone"></i> ${user.phone}</p>` : ''}
                </div>
                <div class="user-role">
                    <span class="role-badge role-badge-custom" data-role-color="${user.role}">
                        ${user.role.toUpperCase()}
                    </span>
                </div>
            </div>
            <div class="user-meta">
                <p><strong>Joined:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
                <div class="user-status">
                    <span><strong>Status:</strong> ${user.isVerified ? 'Verified' : 'Unverified'}</span>
                    ${!user.isVerified ? `
                        <button data-action="verifyUser" data-user-id="${user._id}" data-user-name="${user.firstName} ${user.lastName}"
                                class="verify-single-btn" title="Verify this user">
                            <i class="fas fa-check"></i> Verify
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');

    // Apply badge colors after content is added
    applyBadgeColors(container);
}

function filterUsers() {
    const roleFilter = document.getElementById('roleFilter').value;
    const searchFilter = document.getElementById('userSearch').value.trim();
    const verifiedFilter = document.getElementById('verifiedFilter')?.value;

    const filters = {};
    if (roleFilter) filters.role = roleFilter;
    if (searchFilter) filters.search = searchFilter;
    if (verifiedFilter) filters.verified = verifiedFilter;

    // Show loading state
    const usersList = document.getElementById('usersList');
    if (usersList) {
        usersList.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Filtering users...</div>';
    }

    loadUsersList(filters);
}

// Add debounced search function
let searchTimeout;
function searchUsers() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        filterUsers();
    }, 500);
}

function clearFilters() {
    document.getElementById('roleFilter').value = '';
    document.getElementById('userSearch').value = '';
    if (document.getElementById('verifiedFilter')) {
        document.getElementById('verifiedFilter').value = '';
    }
    filterUsers();
    showToast('Filters cleared', 'info');
}

function refreshUsers() {
    // Clear all filters first
    document.getElementById('roleFilter').value = '';
    document.getElementById('userSearch').value = '';
    if (document.getElementById('verifiedFilter')) {
        document.getElementById('verifiedFilter').value = '';
    }

    // Reload data
    loadUserStats();
    loadUsersList(); // Load without filters
    showToast('User data refreshed!', 'success');
}

// Verify individual user
async function verifyUser(userId, userName) {
    if (!confirm(`Are you sure you want to verify ${userName}?`)) {
        return;
    }

    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/verify`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            showToast('Authentication failed. Please login again.', 'error');
            logout();
            return;
        }

        const result = await response.json();
        if (result.success) {
            showToast(result.message, 'success');
            refreshUsers();
        } else {
            showToast(result.message || 'Failed to verify user', 'error');
        }
    } catch (error) {
        console.error('Verify user error:', error);
        showToast('Error verifying user', 'error');
    } finally {
        showLoading(false);
    }
}

async function verifyAllUsers() {
    if (!confirm('Are you sure you want to verify all unverified users? This action cannot be undone.')) {
        return;
    }

    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/admin/users/verify-all`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' }
        });

        if (response.status === 401) {
            showToast('Authentication failed. Please login again.', 'error');
            logout();
            return;
        }

        const result = await response.json();
        if (result.success) {
            showToast(`Successfully verified ${result.modifiedCount} users!`, 'success');
            refreshUsers(); // Refresh the user list to show updated status
        } else {
            showToast(result.message || 'Error verifying users', 'error');
        }
    } catch (error) {
        console.error('Error verifying all users:', error);
        showToast('Error verifying users. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

function displayAdminDashboard(stats) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'adminModal';
    modal.innerHTML = `
        <div class="modal-content admin-dashboard-modal">
            <div class="modal-header">
                <h2><i class="fas fa-tachometer-alt"></i> Admin Dashboard</h2>
                <span class="close" data-close-modal="adminModal">&times;</span>
            </div>
            <div class="modal-body">
                <div class="admin-stats">
                    <div class="stat-card total-shipments">
                        <div class="stat-icon">
                            <i class="fas fa-shipping-fast"></i>
                        </div>
                        <div class="stat-content">
                            <h3>${stats.shipments?.total || 0}</h3>
                            <p>Total Shipments</p>
                        </div>
                    </div>
                    <div class="stat-card delivered-shipments">
                        <div class="stat-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="stat-content">
                            <h3>${stats.shipments?.delivered || 0}</h3>
                            <p>Delivered</p>
                        </div>
                    </div>
                    <div class="stat-card transit-shipments">
                        <div class="stat-icon">
                            <i class="fas fa-truck"></i>
                        </div>
                        <div class="stat-content">
                            <h3>${stats.shipments?.inTransit || 0}</h3>
                            <p>In Transit</p>
                        </div>
                    </div>
                    <div class="stat-card pending-shipments">
                        <div class="stat-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-content">
                            <h3>${stats.shipments?.pending || 0}</h3>
                            <p>Pending</p>
                        </div>
                    </div>
                    <div class="stat-card total-users">
                        <div class="stat-icon">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-content">
                            <h3>${stats.users?.total || 0}</h3>
                            <p>Total Users</p>
                        </div>
                    </div>
                    <div class="stat-card total-revenue">
                        <div class="stat-icon">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <div class="stat-content">
                            <h3>$${(stats.revenue?.total || 0).toFixed(2)}</h3>
                            <p>Total Revenue</p>
                        </div>
                    </div>
                </div>
                <div class="admin-actions">
                    <button data-action="loadAdminShipments" class="admin-btn shipments-btn">
                        <i class="fas fa-boxes"></i>
                        <span>Manage Shipments</span>
                    </button>
                    <button data-action="loadCustomerSupport" class="admin-btn support-btn">
                        <i class="fas fa-headset"></i>
                        <span>Customer Support</span>
                    </button>
                    <button data-action="loadAdminUsers" class="admin-btn users-btn">
                        <i class="fas fa-user-cog"></i>
                        <span>Manage Users</span>
                    </button>
                    <button data-action="showAdminRegisterModal" class="admin-btn setup-btn">
                        <i class="fas fa-user-shield"></i>
                        <span>Admin Setup</span>
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    showModal('adminModal');
}

// Helper function to scroll to shipping section
function showShippingRateForm() {
    // Require authentication for shipping rate calculation
    if (!requireAuth('calculate shipping rates')) {
        return;
    }
    if (!document.getElementById('shipping')) {
        window.location.href = 'shipping.html';
        return;
    }
    scrollToSection('shipping');
}

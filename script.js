/**
 * Main application scripts for TheSizNexus
 * @file scripts.js
 * @version 2.0
 */

// Constants
const CONFIG = {
    MOBILE_BREAKPOINT: 767,
    OFFICIAL_DOMAIN: "thesiznexus.org",
    RESIZE_DEBOUNCE_DELAY: 100,
    UNAUTHORIZED_STYLES: `
        body { 
            background-color: #000; 
            color: #f00; 
            font-family: monospace; 
            text-align: center; 
            padding: 100px; 
            margin: 0;
        }
        a { 
            color: #0ff; 
            text-decoration: underline; 
        }
    `
};

// DOM Elements
const DOM = {
    mobileMenu: document.getElementById('mobileMenu'),
    menuButton: document.querySelector('[aria-controls="mobileMenu"]')
};

// Utility Functions
const Utils = {
    /**
     * Check if current device is mobile
     * @returns {boolean}
     */
    isMobileDevice: () => window.innerWidth <= CONFIG.MOBILE_BREAKPOINT,

    /**
     * Debounce function to limit how often a function is called
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function}
     */
    debounce: (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    /**
     * Display unauthorized clone warning
     */
    showUnauthorizedWarning: () => {
        document.body.innerHTML = `
            <style>${CONFIG.UNAUTHORIZED_STYLES}</style>
            <h1>This site is a clone and is unauthorized.</h1>
            <p>Visit the official version at <a href="https://${CONFIG.OFFICIAL_DOMAIN}" rel="noopener noreferrer">${CONFIG.OFFICIAL_DOMAIN}</a></p>
        `;
        document.title = "Unauthorized Clone";
    }
};

// View Management
const ViewManager = {
    /**
     * Toggle mobile menu visibility
     */
    toggleMenu: () => {
        try {
            if (DOM.mobileMenu) {
                DOM.mobileMenu.classList.toggle('active');
                
                if (DOM.menuButton) {
                    const isExpanded = DOM.mobileMenu.classList.contains('active');
                    DOM.menuButton.setAttribute('aria-expanded', isExpanded);
                    
                    // Update button text for screen readers
                    const buttonText = isExpanded ? 'Close menu' : 'Open menu';
                    DOM.menuButton.setAttribute('aria-label', buttonText);
                }
            }
        } catch (error) {
            console.error('Error toggling menu:', error);
        }
    },

    /**
     * Handle view changes between mobile and desktop
     */
    handleViewChange: () => {
        try {
            const isMobile = Utils.isMobileDevice();
            document.body.classList.toggle('mobile-view', isMobile);
            document.body.classList.toggle('desktop-view', !isMobile);

            // Ensure mobile menu is closed when switching to desktop
            if (!isMobile && DOM.mobileMenu) {
                DOM.mobileMenu.classList.remove('active');
                if (DOM.menuButton) {
                    DOM.menuButton.setAttribute('aria-expanded', 'false');
                }
            }
        } catch (error) {
            console.error('Error handling view change:', error);
        }
    }
};

// Security Check
const Security = {
    /**
     * Verify if running on official domain
     * @returns {boolean}
     */
    isOfficialDomain: () => {
        try {
            return window.location.hostname === CONFIG.OFFICIAL_DOMAIN || 
                   window.location.hostname.endsWith('.' + CONFIG.OFFICIAL_DOMAIN);
        } catch (error) {
            console.error('Domain verification failed:', error);
            return false;
        }
    }
};

// Main Application Initialization
const App = {
    init: () => {
        try {
            // Security check
            if (!Security.isOfficialDomain()) {
                Utils.showUnauthorizedWarning();
                return;
            }

            // Initial setup
            ViewManager.handleViewChange();

            // Event listeners
            window.addEventListener('resize', 
                Utils.debounce(ViewManager.handleViewChange, CONFIG.RESIZE_DEBOUNCE_DELAY)
            );

            if (DOM.menuButton) {
                DOM.menuButton.addEventListener('click', ViewManager.toggleMenu);
                DOM.menuButton.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        ViewManager.toggleMenu();
                    }
                });
            }

            // Additional initialization can go here
            console.log('Application initialized successfully');
            
        } catch (error) {
            console.error('Application initialization failed:', error);
        }
    }
};

// Start the application
document.addEventListener('DOMContentLoaded', App.init);

/**
 * Copyright Notice
 * © 2023-2025 $iz. All designs, layouts, and content are property of $iz. 
 * Do not duplicate or redistribute without permission.
 */

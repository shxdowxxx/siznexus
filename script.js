// Constants
const MOBILE_BREAKPOINT = 767;

/**
 * Detect if the user is on a mobile device based on viewport width
 * @returns {boolean} True if mobile device, false otherwise
 */
function isMobileDevice() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
}

/**
 * Toggle the mobile menu visibility
 */
function toggleMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('active');
        
        // Optional: Toggle aria-expanded for accessibility
        const menuButton = document.querySelector('[aria-controls="mobileMenu"]');
        if (menuButton) {
            const isExpanded = mobileMenu.classList.contains('active');
            menuButton.setAttribute('aria-expanded', isExpanded);
        }
    }
}

/**
 * Handle view changes based on screen size
 */
function handleViewChange() {
    const isMobile = isMobileDevice();
    document.body.classList.toggle('mobile-view', isMobile);
    document.body.classList.toggle('desktop-view', !isMobile);
    
    // Close mobile menu when switching to desktop view
    if (!isMobile) {
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu) {
            mobileMenu.classList.remove('active');
        }
    }
}

// Initialize view on load
handleViewChange();

// Debounced resize event listener
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleViewChange, 100);
});

// Add click event for menu toggle
const menuButton = document.querySelector('.menu-toggle');
if (menuButton) {
    menuButton.addEventListener('click', toggleMenu);
}

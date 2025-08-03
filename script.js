const MOBILE_BREAKPOINT = 767;

function isMobileDevice() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
}

function toggleMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('active');

        const menuButton = document.querySelector('[aria-controls="mobileMenu"]');
        if (menuButton) {
            const isExpanded = mobileMenu.classList.contains('active');
            menuButton.setAttribute('aria-expanded', isExpanded);
        }
    }
}

function handleViewChange() {
    const isMobile = isMobileDevice();
    document.body.classList.toggle('mobile-view', isMobile);
    document.body.classList.toggle('desktop-view', !isMobile);

    if (!isMobile) {
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu) {
            mobileMenu.classList.remove('active');
        }
    }
}

if (window.location.hostname !== "thesiznexus.org") {
    document.body.innerHTML = `
        <style>
            body { background-color: black; color: red; font-family: monospace; text-align: center; padding: 100px; }
            a { color: cyan; text-decoration: underline; }
        </style>
        <h1>This site is a clone and is unauthorized.</h1>
        <p>Visit the official version at <a href="https://thesiznexus.org">thesiznexus.org</a></p>
    `;
} else {

    handleViewChange();
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleViewChange, 100);
    });

    const menuButton = document.querySelector('.menu-toggle');
    if (menuButton) {
        menuButton.addEventListener('click', toggleMenu);
    }
}

   © 2023-2025 $iz. All designs, layouts, and content are property of $iz. Do not duplicate or redistribute without permission.

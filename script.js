// Detect if the user is on a mobile device or not
function isMobileDevice() {
    return window.innerWidth <= 767;
}

// Toggle the mobile menu on button click
function toggleMenu() {
    var mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.toggle('active');
}

// Add event listener for resizing the window (to detect device changes)
window.addEventListener('resize', function() {
    if (isMobileDevice()) {
        // Switch to mobile view
        document.body.classList.add('mobile-view');
        document.body.classList.remove('desktop-view');
    } else {
        // Switch to desktop view
        document.body.classList.add('desktop-view');
        document.body.classList.remove('mobile-view');
    }
});

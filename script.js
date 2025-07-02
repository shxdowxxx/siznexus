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

// Initial check on page load
if (isMobileDevice()) {
    document.body.classList.add('mobile-view');
} else {
    document.body.classList.add('desktop-view');
}
const profileBtn = document.getElementById("profileButton");
const dropdown = document.getElementById("dropdownMenu");
const logoutBtn = document.getElementById("logoutBtn");

// Simulating logged in state (you can replace this with real Firebase logic later)
localStorage.setItem("loggedIn", "false"); // Change to "true" for testing logged-in state

profileBtn.addEventListener("click", () => {
  if (localStorage.getItem("loggedIn") !== "true") {
    alert("You are not logged in. Redirecting to login...");
    window.location.href = "receiver.html"; // Replace with your actual login page
  } else {
    dropdown.style.display = dropdown.style.display === "flex" ? "none" : "flex";
  }
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("loggedIn");
  dropdown.style.display = "none";
  alert("Logged out.");
});

// Close dropdown if clicked outside
document.a

/* ============================================
   🏔️ PEAKDLE - JavaScript
   ============================================ */

// ============================================
// NAVIGATION & BURGER MENU
// ============================================

document.addEventListener("DOMContentLoaded", function () {
  // Elements
  const navToggle = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");
  const pages = document.querySelectorAll(".page");
  const playButtons = document.querySelectorAll(".play-btn");
  const backButtons = document.querySelectorAll(".back-btn");
  const navHome = document.getElementById("nav-home");

  // Toggle burger menu
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      navMenu.classList.toggle("active");
      navToggle.classList.toggle("active");

      // Animate burger icon
      const spans = navToggle.querySelectorAll("span");
      if (navMenu.classList.contains("active")) {
        spans[0].style.transform = "rotate(45deg) translateY(10px)";
        spans[1].style.opacity = "0";
        spans[2].style.transform = "rotate(-45deg) translateY(-10px)";
      } else {
        spans[0].style.transform = "none";
        spans[1].style.opacity = "1";
        spans[2].style.transform = "none";
      }
    });
  }

  // Navigation - Switch pages
  function switchPage(pageId) {
    // Hide all pages
    pages.forEach((page) => {
      page.classList.remove("active");
    });

    // Show target page
    const targetPage = document.getElementById(`${pageId}-page`);
    if (targetPage) {
      targetPage.classList.add("active");
    }

    // Update active nav link
    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.dataset.page === pageId) {
        link.classList.add("active");
      }
    });

    // Close mobile menu if open
    navMenu.classList.remove("active");
    if (navToggle) {
      const spans = navToggle.querySelectorAll("span");
      spans[0].style.transform = "none";
      spans[1].style.opacity = "1";
      spans[2].style.transform = "none";
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Nav links click
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const pageId = this.dataset.page;
      switchPage(pageId);
    });
  });

  // Play buttons click
  playButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      const pageId = this.dataset.page;
      switchPage(pageId);
    });
  });

  // Back buttons click
  backButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      const pageId = this.dataset.page;
      switchPage(pageId);
    });
  });

  // Logo nav-brand click (Home)
  if (navHome) {
    navHome.addEventListener("click", function (e) {
      e.preventDefault();
      switchPage("home");
    });
  }

  // Close menu when clicking outside
  document.addEventListener("click", function (e) {
    if (
      navMenu.classList.contains("active") &&
      !navMenu.contains(e.target) &&
      !navToggle.contains(e.target)
    ) {
      navMenu.classList.remove("active");
      const spans = navToggle.querySelectorAll("span");
      spans[0].style.transform = "none";
      spans[1].style.opacity = "1";
      spans[2].style.transform = "none";
    }
  });

  // ============================================
  // COUNTDOWN TIMER
  // ============================================

  function updateCountdown() {
    const countdownElement = document.getElementById("countdown-home");
    if (!countdownElement) return;

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setHours(24, 0, 0, 0);

    const diff = tomorrow - now;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    countdownElement.textContent = `${hours
      .toString()
      .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  // Update countdown every second
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ============================================
  // GAME LOGIC (Placeholder)
  // ============================================

  console.log("🏔️ Peakdle loaded successfully!");
  console.log("Ready to climb!");
});

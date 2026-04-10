const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
const header = document.querySelector(".site-header");
const navAnchors = document.querySelectorAll(".nav-links a");
const sections = document.querySelectorAll("section[id]");

// Toggle mobile menu
menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.classList.toggle("active");
  menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
});

// Close menu when a link is clicked
navAnchors.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

// Header background on scroll
window.addEventListener("scroll", () => {
  if (window.scrollY > 40) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

// Active nav link on scroll
function setActiveLink() {
  let currentSection = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 140;
    const sectionHeight = section.offsetHeight;

    if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
      currentSection = section.getAttribute("id");
    }
  });

  navAnchors.forEach((link) => {
    link.classList.remove("active");
    const href = link.getAttribute("href").replace("#", "");

    if (href === currentSection) {
      link.classList.add("active");
    }
  });
}

window.addEventListener("scroll", setActiveLink);
window.addEventListener("load", setActiveLink);
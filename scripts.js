const navAnchors = document.querySelectorAll(".nav-menu a");
const sections = document.querySelectorAll("section[id]");

function setActiveNavLink() {
  let current = "";

  sections.forEach((section) => {
    const top = section.offsetTop - 120;
    const height = section.offsetHeight;

    if (window.scrollY >= top && window.scrollY < top + height) {
      current = section.getAttribute("id") || "";
    }
  });

  navAnchors.forEach((link) => {
    link.classList.remove("active");
    const href = link.getAttribute("href") || "";
    const id = href.startsWith("#") ? href.slice(1) : "";

    if (id && id === current) {
      link.classList.add("active");
    }
  });
}

window.addEventListener("scroll", setActiveNavLink);
window.addEventListener("load", setActiveNavLink);

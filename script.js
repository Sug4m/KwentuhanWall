// Mobile menu toggle
const burgerBtn = document.getElementById("burgerBtn");
const mobileMenu = document.getElementById("mobileMenu");
const iconMenu = document.getElementById("iconMenu");
const iconClose = document.getElementById("iconClose");

burgerBtn.addEventListener("click", () => {
  const isOpen = !mobileMenu.hidden;

  if (isOpen) {
    mobileMenu.hidden = true;
    iconMenu.style.display = "block";
    iconClose.style.display = "none";
    burgerBtn.setAttribute("aria-expanded", "false");
  } else {
    mobileMenu.hidden = false;
    iconMenu.style.display = "none";
    iconClose.style.display = "block";
    burgerBtn.setAttribute("aria-expanded", "true");
  }
});

// Close the mobile menu when a nav link inside it is clicked
mobileMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.hidden = true;
    iconMenu.style.display = "block";
    iconClose.style.display = "none";
    burgerBtn.setAttribute("aria-expanded", "false");
  });
});
/* =========================================================
   Write page — logic
   ========================================================= */

const toast = document.getElementById("toast");
const identityBox = document.getElementById("identityBox");
const catPills = document.querySelectorAll(".kw-cat-pill");
const writeForm = document.getElementById("writeForm");
const storyText = document.getElementById("storyText");
const safetyHelpBtn = document.getElementById("safetyHelpBtn");

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { toast.hidden = true; }, 2800);
}

/* ---- Require login: kailangang naka-login (Gmail) bago makapag-post ---- */
const storedUser = localStorage.getItem("kwentuhanwall_user");
let currentUser = null;

if (!storedUser) {
  showToast("Kailangan mo munang mag-login para makapagsulat. Papunta ka sa login...");
  setTimeout(() => { window.location.href = "index.html"; }, 1200);
} else {
  currentUser = JSON.parse(storedUser);
  identityBox.textContent = currentUser.alias;
}

/* ---- Hamburger dropdown (parehong pattern sa wall.js) ---- */
const hamburgerBtn = document.getElementById("hamburgerBtn");
const hamburgerMenu = document.getElementById("hamburgerMenu");

(function initHamburgerMenu() {
  if (currentUser) {
    const chip = document.createElement("span");
    chip.className = "kw-user-chip";
    chip.textContent = currentUser.alias;

    const logoutBtn = document.createElement("button");
    logoutBtn.className = "kw-btn kw-btn-outline kw-btn-sm";
    logoutBtn.textContent = "Log Out";
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("kwentuhanwall_user");
      window.location.href = "index.html";
    });

    hamburgerMenu.appendChild(chip);
    hamburgerMenu.appendChild(logoutBtn);
  } else {
    const loginBtn = document.createElement("button");
    loginBtn.className = "kw-btn kw-btn-primary kw-btn-sm";
    loginBtn.textContent = "Log In";
    loginBtn.addEventListener("click", () => (window.location.href = "index.html"));
    hamburgerMenu.appendChild(loginBtn);
  }
})();

hamburgerBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  hamburgerMenu.hidden = !hamburgerMenu.hidden;
});
document.addEventListener("click", (e) => {
  if (!hamburgerMenu.hidden && !hamburgerMenu.contains(e.target)) {
    hamburgerMenu.hidden = true;
  }
});

/* ---- Category pills ---- */
let selectedCategory = "Love Life";
catPills.forEach((pill) => {
  pill.addEventListener("click", () => {
    catPills.forEach((p) => p.classList.remove("kw-cat-pill-active"));
    pill.classList.add("kw-cat-pill-active");
    selectedCategory = pill.dataset.category;
  });
});

/* ---- "How to post safely?" ---- */
safetyHelpBtn.addEventListener("click", () => {
  showToast("Iwasan ang totoong pangalan, numero, o address ng ibang tao sa kwento mo.");
});

/* ---- Submit — totoo na, nage-save sa MySQL via backend/posts.php ---- */
writeForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const content = storyText.value.trim();
  if (!content || !currentUser) return;

  const submitBtn = writeForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = "Nagpo-post...";

  try {
    const res = await fetch("backend/posts.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: currentUser.id,
        category: selectedCategory,
        content: content,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || "May problema sa pag-post. Subukan ulit.");
      submitBtn.disabled = false;
      submitBtn.textContent = "Post Now";
      return;
    }

    showToast("Nailathala ang kwento mo sa Pader. Papunta ka na...");
    setTimeout(() => {
      window.location.href = "wall.html";
    }, 900);
  } catch (err) {
    showToast("Hindi makonekta sa server. Siguraduhing tumatakbo ang XAMPP.");
    submitBtn.disabled = false;
    submitBtn.textContent = "Post Now";
  }
});
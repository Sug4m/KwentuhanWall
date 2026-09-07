/* =========================================================
   IMPORTANT — Google Login Setup
   =========================================================
   Para totoong gumana ang "Log in / Sign up with Google" button,
   kailangan mo munang gumawa ng sarili mong Google OAuth Client ID:

   1. Pumunta sa https://console.cloud.google.com/apis/credentials
   2. Gumawa ng bagong project (o gamitin ang existing).
   3. "Create Credentials" > "OAuth client ID" > Application type: "Web application".
   4. Sa "Authorized JavaScript origins", idagdag ang URL kung saan mo
      pinapatakbo ang site (hal. http://127.0.0.1:5500 o http://localhost:5500,
      o yung totoong domain mo pag na-deploy mo na).
   5. I-kopya yung Client ID na binigay sa'yo, at ipalit dito sa ibaba:
   ========================================================= */

const GOOGLE_CLIENT_ID = "766337207-5ufuj02bejmruogmtl77bm70etaubedr.apps.googleusercontent.com";

/* ========================================================= */

const loginOverlay = document.getElementById("loginOverlay");
const signupOverlay = document.getElementById("signupOverlay");
const loginBtn = document.getElementById("loginBtn");
const signupLink = document.getElementById("signupLink");
const signupTriggers = document.querySelectorAll(".kw-js-open-signup");
const toast = document.getElementById("toast");

function openModal(overlay) {
  document.querySelectorAll(".kw-overlay").forEach((o) => (o.hidden = true));
  overlay.hidden = false;
}
function closeModals() {
  document.querySelectorAll(".kw-overlay").forEach((o) => (o.hidden = true));
}

loginBtn.addEventListener("click", () => openModal(loginOverlay));
signupLink.addEventListener("click", (e) => { e.preventDefault(); openModal(signupOverlay); });
signupTriggers.forEach((btn) => btn.addEventListener("click", () => openModal(signupOverlay)));

document.querySelectorAll("[data-close-modal]").forEach((btn) =>
  btn.addEventListener("click", closeModals)
);
document.querySelectorAll("[data-open-signup]").forEach((btn) =>
  btn.addEventListener("click", () => openModal(signupOverlay))
);
document.querySelectorAll("[data-open-login]").forEach((btn) =>
  btn.addEventListener("click", () => openModal(loginOverlay))
);
document.querySelectorAll(".kw-overlay").forEach((overlay) => {
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModals(); });
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModals(); });

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { toast.hidden = true; }, 2800);
}

// Decode the JWT credential Google sends back (client-side only, for display purposes).
function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch (e) {
    return null;
  }
}

function setLoggedInUI(name) {
  const actions = document.querySelector(".kw-nav-actions");
  actions.innerHTML = `
    <span class="kw-user-chip">${name}</span>
    <button class="kw-btn kw-btn-outline kw-btn-sm" id="logoutBtn">Log Out</button>
  `;
  document.getElementById("logoutBtn").addEventListener("click", () => location.reload());
}

function handleGoogleCredential(response) {
  const data = decodeJwt(response.credential);
  closeModals();
  if (data && data.name) {
    setLoggedInUI(data.given_name || data.name);
    showToast(`Naka-login ka gamit ang Google bilang ${data.given_name || data.name}. Anonymous pa rin ang ipapakita mo sa Pader.`);
  } else {
    showToast("Na-login ka gamit ang Google.");
  }
}

window.addEventListener("load", () => {
  const wraps = document.querySelectorAll(".kw-g-btn-wrap");

  if (!window.google || GOOGLE_CLIENT_ID.startsWith("PASTE_YOUR")) {
    // No real Client ID configured yet — keep our custom black button visible,
    // but clicking it explains what still needs to be set up instead of doing nothing.
    wraps.forEach((wrap) => {
      wrap.querySelector(".kw-g-btn-visual").style.opacity = "0.55";
      wrap.style.cursor = "not-allowed";
      wrap.addEventListener("click", () => {
        showToast("Kailangan mo munang ilagay ang Google Client ID sa script.js.");
      });
    });
    return;
  }

  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleCredential,
  });

  // Render Google's real (invisible) button inside each overlay wrap.
  google.accounts.id.renderButton(document.getElementById("gLoginBtn"), {
    theme: "filled_black",
    shape: "pill",
    size: "large",
    text: "signin_with",
    width: 300,
  });

  google.accounts.id.renderButton(document.getElementById("gSignupBtn"), {
    theme: "filled_black",
    shape: "pill",
    size: "large",
    text: "signup_with",
    width: 300,
  });
});
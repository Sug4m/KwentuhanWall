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

const KW_USER_KEY = "kwentuhanwall_user";

// Ipinapadala ang Google credential sa backend (auth.php), na siyang
// mag-ve-verify nito sa Google mismo at maghahanap/gagawa ng user row
// sa totoong MySQL database.
async function handleGoogleCredential(response) {
  try {
    const res = await fetch("backend/auth.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential: response.credential }),
    });
    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || "May problema sa pag-login. Subukan ulit.");
      return;
    }

    // I-save lang ang PUBLIC na impormasyon sa localStorage
    // (para may alam kaagad ang wall.html kung sino ang naka-login).
    localStorage.setItem(KW_USER_KEY, JSON.stringify({
      id: data.id,
      alias: data.alias,
      avatar: data.avatar,
    }));

    showToast(`Naka-login ka bilang ${data.alias}. Papunta ka na sa Pader...`);
    setTimeout(() => {
      window.location.href = "wall.html";
    }, 700);
  } catch (err) {
    showToast("Hindi makonekta sa server. Siguraduhing tumatakbo ang XAMPP (Apache).");
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
/* =========================================================
   The Wall — page logic
   Walang laman pa ang feed dahil wala pang totoong users/posts.
   Ang mga function sa ibaba (renderPost, initInfiniteScroll) ay
   handa nang gamitin sa oras na may backend/API na — dun mo na lang
   ipapasa ang totoong listahan ng posts.
   ========================================================= */

const postList = document.getElementById("postList");
const emptyState = document.getElementById("emptyState");
const friendsEmpty = document.getElementById("friendsEmpty");
const loadSentinel = document.getElementById("loadSentinel");
const toast = document.getElementById("toast");
const tabs = document.querySelectorAll(".kw-tab");
const storiesCountEl = document.getElementById("storiesCount");

const CATEGORY_ROW_MAP = {
  "Love Life": "kw-dot-lovelife",
  "Career": "kw-dot-career",
  "Family": "kw-dot-family",
  "School": "kw-dot-school",
  "Mental Health": "kw-dot-mentalhealth",
  "Others": "kw-dot-others",
};

let lastPosts = [];

/* ---- Kunin ang totoong mga post mula sa MySQL (backend/posts.php) ---- */
async function loadPosts(category = null) {
  try {
    const url = category
      ? `backend/posts.php?category=${encodeURIComponent(category)}`
      : "backend/posts.php";
    const res = await fetch(url);
    const data = await res.json();

    lastPosts = data.posts;
    renderPostList(lastPosts);

    storiesCountEl.textContent = `${data.totalThisWeek} Stories This Week`;

    document.querySelectorAll(".kw-cat-row").forEach((row) => {
      const cat = row.dataset.category;
      const count = cat
        ? (data.categoryCounts[cat] ?? 0)
        : Object.values(data.categoryCounts).reduce((sum, n) => sum + n, 0);
      row.querySelector(".kw-cat-count").textContent = count;
    });
  } catch (err) {
    showToast("Hindi makuha ang mga kwento. Siguraduhing tumatakbo ang XAMPP.");
  }
}

function renderPostList(posts) {
  postList.innerHTML = "";
  posts.forEach(renderPost);
  emptyState.hidden = posts.length > 0;
}

loadPosts();


/* ---- Reflect logged-in state (from index.html's Gmail login) inside the hamburger dropdown ---- */
const hamburgerBtn = document.getElementById("hamburgerBtn");
const hamburgerMenu = document.getElementById("hamburgerMenu");

(function initLoggedInMenu() {
  const stored = localStorage.getItem("kwentuhanwall_user");

  if (stored) {
    const user = JSON.parse(stored);

    const chip = document.createElement("span");
    chip.className = "kw-user-chip";
    chip.textContent = user.alias;

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

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { toast.hidden = true; }, 2600);
}

/* ---- Categories (sidebar) ---- */
const catRows = document.querySelectorAll(".kw-cat-row");
catRows.forEach((row) => {
  row.addEventListener("click", () => {
    catRows.forEach((r) => r.classList.remove("kw-cat-row-active"));
    row.classList.add("kw-cat-row-active");
    loadPosts(row.dataset.category);
  });
});

/* ---- Tabs (Latest / Popular / Friends) ---- */
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("kw-tab-active"));
    tab.classList.add("kw-tab-active");

    const which = tab.dataset.tab;
    if (which === "friends") {
      postList.hidden = true;
      emptyState.hidden = true;
      friendsEmpty.hidden = false;
    } else {
      friendsEmpty.hidden = true;
      postList.hidden = false;
      const list = which === "popular"
        ? [...lastPosts].sort((a, b) => b.comfort - a.comfort)
        : lastPosts;
      renderPostList(list);
    }
  });
});

/* ---- Renders a single post card (for future use with real data) ----
   post = { id, alias, time, category, categoryColor, text, comfort, comments } */
function renderPost(post) {
  const card = document.createElement("div");
  card.className = "kw-postcard";
  card.innerHTML = `
    <div class="kw-postcard-top">
      <div class="kw-postcard-who">
        <div class="kw-avatar">#</div>
        <div>
          <span class="kw-postcard-alias">${post.alias}</span>
          <span class="kw-postcard-time">${post.time}</span>
        </div>
      </div>
      <span class="kw-badge" style="background:${post.categoryColor}26;color:${post.categoryColor}">${post.category}</span>
    </div>
    <p class="kw-postcard-text">${post.text}</p>
    <div class="kw-postcard-bottom">
      <button class="kw-reaction kw-heart-btn">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
        <span>${post.comfort}</span>
      </button>
      <span class="kw-reaction">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span>${post.comments} Comments</span>
      </span>
      <div class="kw-more-wrap">
        <button class="kw-more-btn" aria-label="Higit pang opsyon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>
        </button>
        <div class="kw-more-menu" hidden>
          <button class="kw-report-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            I-report ang post
          </button>
        </div>
      </div>
    </div>
  `;

  // Heart / comfort reaction — totoo na, nagse-save sa MySQL
  card.querySelector(".kw-heart-btn").addEventListener("click", async () => {
    const stored = localStorage.getItem("kwentuhanwall_user");
    if (!stored) {
      showToast("Kailangan mo munang mag-login para makapagbigay ng ginhawa.");
      return;
    }
    const user = JSON.parse(stored);

    try {
      const res = await fetch("backend/reactions.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: post.id, user_id: user.id }),
      });
      const data = await res.json();
      const span = card.querySelector(".kw-heart-btn span");

      if (data.alreadyReacted) {
        showToast("Nabigyan mo na ng ginhawa ang post na ito.");
      } else {
        span.textContent = data.comfort;
      }
    } catch (err) {
      showToast("Hindi makonekta sa server.");
    }
  });

  // Kebab (⋮) menu open/close
  const moreBtn = card.querySelector(".kw-more-btn");
  const moreMenu = card.querySelector(".kw-more-menu");
  moreBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    document.querySelectorAll(".kw-more-menu").forEach((m) => { if (m !== moreMenu) m.hidden = true; });
    moreMenu.hidden = !moreMenu.hidden;
  });

  // Report action
  card.querySelector(".kw-report-btn").addEventListener("click", () => {
    moreMenu.hidden = true;
    showToast("Na-report ang post na ito. Susuriin ito ng aming team.");
  });

  postList.appendChild(card);
  emptyState.hidden = true;
}

// Close any open report menu when clicking elsewhere on the page.
document.addEventListener("click", () => {
  document.querySelectorAll(".kw-more-menu").forEach((m) => (m.hidden = true));
});

/* ---- Infinite scroll (ready for when there are real posts to page through) ----
   Tawagin ito pag may function ka nang kumukuha ng susunod na batch ng posts
   mula sa backend, hal:

   initInfiniteScroll(async () => {
     const morePosts = await fetchMorePostsFromAPI();
     morePosts.forEach(renderPost);
     return morePosts.length > 0; // false kapag wala nang dagdag na post
   });
*/
function initInfiniteScroll(loadMoreFn) {
  const loadingLabel = document.getElementById("loadingLabel");
  let loading = false;

  const observer = new IntersectionObserver(async (entries) => {
    if (!entries[0].isIntersecting || loading) return;
    loading = true;
    loadingLabel.hidden = false;
    const hasMore = await loadMoreFn();
    loadingLabel.hidden = true;
    loading = false;
    if (!hasMore) observer.disconnect();
  }, { rootMargin: "200px" });

  loadSentinel.hidden = false;
  observer.observe(loadSentinel);
}
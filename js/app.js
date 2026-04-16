// /js/app.js
(() => {
  "use strict";

  const CONFIG = {
    videosApiUrl: "/api/videos",
    newDays: 14,
    comingSoonDays: 30,
    watchHistoryLimit: 20
  };

  const $ = (sel) => document.querySelector(sel);
  const safeText = (s) => (s ?? "").toString();

  function daysDiffFromNow(dateStr){
    const d = new Date(dateStr);
    if(Number.isNaN(d.getTime())) return null;
    return (Date.now() - d.getTime()) / 86400000;
  }
  function daysUntil(dateStr){
    const d = new Date(dateStr);
    if(Number.isNaN(d.getTime())) return null;
    return (d.getTime() - Date.now()) / 86400000;
  }

  function setBodyModalOpen(isOpen){
    document.body.classList.toggle("modal-open", !!isOpen);
  }

  // optional whoosh
  const whoosh = (() => {
    try {
      const a = new Audio("sounds/whoosh.mp3");
      a.volume = 0.25;
      return a;
    } catch { return null; }
  })();
  function playWhoosh(){
    if(!whoosh) return;
    try { whoosh.currentTime = 0; whoosh.play().catch(()=>{}); } catch {}
  }

  // API wrapper
  window.ZagaAPI = window.ZagaAPI || (() => {
    async function postForm(url, data){
      const body = new URLSearchParams(data).toString();
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        credentials: "include"
      });

      const ct = (res.headers.get("content-type") || "").toLowerCase();
      let payload = null;
      try {
        payload = ct.includes("application/json") ? await res.json() : { ok: res.ok, message: await res.text() };
      } catch {
        payload = { ok: res.ok, message: "Failed to parse response" };
      }

      return { ok: res.ok && payload?.ok !== false, status: res.status, ...payload };
    }

    async function getJSON(url){
      const res = await fetch(url, { credentials: "include", cache: "no-store" });
      const ct = (res.headers.get("content-type") || "").toLowerCase();
      let payload = null;
      try {
        payload = ct.includes("application/json") ? await res.json() : { ok: res.ok, message: await res.text() };
      } catch {
        payload = { ok: res.ok, message: "Failed to parse response" };
      }
      return { ok: res.ok && payload?.ok !== false, status: res.status, ...payload };
    }

    return {
      login: (username, password) => postForm("/api/login", { username, password }),
      register: (username, password, invite) => postForm("/api/register", { username, password, invite }),
      me: () => getJSON("/api/me"),
      logout: () => postForm("/api/logout", {}),
      adminUsers: () => getJSON("/api/admin/users"),
      adminApprove: (username) => postForm("/api/admin/approve", { username }),
      adminDeny: (username) => postForm("/api/admin/deny", { username })
    };
  })();

  /* ====================== WATCH HISTORY (ALL USERS) ====================== */
  function getHistoryKey(username){ return `zaga_history:${username}`; }

  function readHistory(username){
    try {
      const raw = localStorage.getItem(getHistoryKey(username));
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  }

  function writeHistory(username, history){
    try {
      localStorage.setItem(
        getHistoryKey(username),
        JSON.stringify(history.slice(0, CONFIG.watchHistoryLimit))
      );
    } catch {}
  }

  function markWatched(username, video){
    if(!username || !video?.id) return;

    const h = readHistory(username);
    const next = [
      { id: video.id, title: video.title, date: video.date, watchedAt: Date.now() },
      ...h.filter(x => x?.id !== video.id)
    ];

    writeHistory(username, next);
    try { localStorage.setItem("lastWatched", video.id); } catch {}
  }

  function renderHistory(username){
    const section = document.getElementById("historySection");
    const row = document.getElementById("historyRow");
    const clearBtn = document.getElementById("clearHistoryBtn");
    if(!section || !row) return;

    const history = readHistory(username);
    if(history.length === 0){
      section.style.display = "none";
      return;
    }

    section.style.display = "block";
    row.innerHTML = "";

    history.slice(0, 8).forEach(item => {
      const card = document.createElement("div");
      card.className = "history-item";
      card.innerHTML = `
        <img class="history-thumb" src="https://img.youtube.com/vi/${item.id}/hqdefault.jpg" alt="">
        <div class="history-meta">
          <div class="t">${safeText(item.title || "")}</div>
          <div class="d">Last watched: ${item.watchedAt ? new Date(item.watchedAt).toLocaleString("el-GR") : "-"}</div>
        </div>
      `;
      card.addEventListener("click", () => openModalById(item.id));
      row.appendChild(card);
    });

    if(clearBtn && !clearBtn.__bound){
      clearBtn.__bound = true;
      clearBtn.addEventListener("click", () => {
        try { localStorage.removeItem(getHistoryKey(username)); } catch {}
        renderHistory(username);
      });
    }
  }

  /* ====================== MODAL ====================== */
  let currentUser = null;
  let currentVideoId = null;
  let videosCache = [];
  let videosById = new Map();

  function openModalById(id){
    const modal = document.getElementById("modal");
    const iframe = document.getElementById("modal-video");
    if(!modal || !iframe) return;

    const video = videosById.get(id) || { id, title: "", date: "" };
    currentVideoId = id;

    if(currentUser){
      markWatched(currentUser, video);
      renderHistory(currentUser);
    }

    setBodyModalOpen(true);

    modal.style.display = "block";
    modal.style.opacity = "0";
    iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;

    setTimeout(() => {
      modal.style.transition = "opacity 0.35s ease";
      modal.style.opacity = "1";
    }, 10);
  }

  function closeModal(){
    const modal = document.getElementById("modal");
    const iframe = document.getElementById("modal-video");
    if(!modal || !iframe) return;

    iframe.src = "";
    modal.style.opacity = "0";
    setTimeout(() => {
      modal.style.display = "none";
      setBodyModalOpen(false);
    }, 250);
  }

  function bindModalEvents(){
    const close = document.getElementById("close");
    const modal = document.getElementById("modal");
    if(close) close.onclick = closeModal;

    window.addEventListener("click", (e) => {
      if(modal && e.target === modal) closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if(e.key === "Escape") closeModal();
    });
  }

  /* ====================== BADGES (NEW / COMING SOON) ====================== */
  function computeBadge(video){
    const until = daysUntil(video.date);
    if(until !== null && until > 0){
      if(until <= CONFIG.comingSoonDays) return { text: "⏳ COMING SOON" };
      return { text: "🔒 SOON" };
    }
    const diff = daysDiffFromNow(video.date);
    if(diff !== null && diff <= CONFIG.newDays) return { text: "🔥 NEW" };
    return null;
  }

  /* ====================== RENDER GRID ====================== */
  function renderVideos(filterText=""){
    const grid = document.getElementById("video-grid");
    const search = document.getElementById("search-input");
    if(!grid) return;

    grid.innerHTML = "";

    const lastWatched = (() => {
      try { return localStorage.getItem("lastWatched"); } catch { return null; }
    })();

    const filtered = videosCache
  .filter(v =>
    safeText(v.title).toLowerCase().includes(filterText.toLowerCase())
  );

    filtered.forEach((video, index) => {
      const container = document.createElement("div");
      container.className = "video-container";

      const img = document.createElement("img");
      img.className = "thumbnail";
      img.loading = "lazy";
      img.alt = safeText(video.title);
      img.src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;

      const overlay = document.createElement("div");
      overlay.className = "overlay";
      overlay.innerHTML = `
        <div class="title">${safeText(video.title)}</div>
        <div class="date">${safeText(video.date)}</div>
      `;

      const badge = computeBadge(video);
      if(badge){
        const b = document.createElement("div");
        b.className = "new-badge";
        b.textContent = badge.text;
        container.appendChild(b);
      }

      container.appendChild(img);
      container.appendChild(overlay);

      container.addEventListener("click", () => {
        playWhoosh();
        openModalById(video.id);
      });

      // fade-in
      container.style.opacity = "0";
      container.style.transform = "translateY(18px)";
      setTimeout(() => {
        container.style.transition = "opacity 0.45s ease, transform 0.45s ease";
        container.style.opacity = "1";
        container.style.transform = "translateY(0)";
      }, index * 60);

      grid.appendChild(container);
    });

    if(search && !search.__bound){
      search.__bound = true;
      search.addEventListener("input", (e) => renderVideos(e.target.value));
    }
  }

  /* ====================== LOAD VIDEOS FROM API (AUTH) ====================== */
  async function loadVideosFromAPI(){
    const res = await fetch(CONFIG.videosApiUrl, { credentials: "include", cache: "no-store" });
    const ct = (res.headers.get("content-type") || "").toLowerCase();

    let payload = null;
    try { payload = ct.includes("application/json") ? await res.json() : null; } catch {}

    if(res.status === 401 || payload?.ok === false){
      window.location.href = "login.html";
      return false;
    }

    const list = payload?.videos || payload?.data || payload;
    if(!Array.isArray(list)) throw new Error("Invalid /api/videos response");

    videosCache = list;
    videosById = new Map(list.map(v => [v.id, v]));
    return true;
  }

  async function requireAuth(){
    const me = await ZagaAPI.me();
    if(!me.ok){
      window.location.href = "login.html";
      return null;
    }
    return me;
  }

  function hideSpinner(){
    const loading = document.getElementById("loading-screen");
    if(!loading) return;
    loading.style.transition = "opacity 0.45s ease";
    loading.style.opacity = "0";
    setTimeout(() => loading.remove(), 450);
  }

  /* ====================== ADMIN PAGE ====================== */
  async function initAdminPage(){
    const file = (location.pathname.split("/").pop() || "").toLowerCase();
    if(file !== "admin.html") return;

    const adminUserSpan = document.getElementById("admin-user");
    const usersTable = document.getElementById("usersTable");
    const adminErr = document.getElementById("adminErr");
    const adminMsg = document.getElementById("adminMsg");

    const me = await requireAuth();
    if(!me) return;

    if(adminUserSpan) adminUserSpan.textContent = me.username || "admin";

    if(me.role !== "admin"){
      if(adminErr){
        adminErr.style.display = "block";
        adminErr.textContent = "Δεν είσαι admin.";
      }
      return;
    }

    async function refresh(){
      if(adminErr) adminErr.style.display = "none";
      if(adminMsg) adminMsg.style.display = "none";

      const res = await ZagaAPI.adminUsers();
      if(!res.ok){
        if(adminErr){
          adminErr.style.display = "block";
          adminErr.textContent = "Δεν φορτώθηκαν users (endpoint /api/admin/users).";
        }
        return;
      }

      const users = res.users || [];
      const rows = users.map(u => `
        <tr>
          <td><b>${safeText(u.username)}</b></td>
          <td>${safeText(u.role)}</td>
          <td>${safeText(u.status)}</td>
          <td style="white-space:nowrap;">
            <button class="btn" data-approve="${safeText(u.username)}">Approve</button>
            <button class="btn danger" data-deny="${safeText(u.username)}">Deny</button>
          </td>
        </tr>
      `).join("");

      usersTable.innerHTML = `
        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr style="text-align:left; opacity:0.9;">
              <th style="padding:10px 8px;">Username</th>
              <th style="padding:10px 8px;">Role</th>
              <th style="padding:10px 8px;">Status</th>
              <th style="padding:10px 8px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${rows || `<tr><td style="padding:12px 8px;" colspan="4">No users</td></tr>`}
          </tbody>
        </table>
      `;

      usersTable.querySelectorAll("[data-approve]").forEach(btn => {
        btn.addEventListener("click", async () => {
          const username = btn.getAttribute("data-approve");
          const r = await ZagaAPI.adminApprove(username);
          if(adminMsg){
            adminMsg.style.display = "block";
            adminMsg.textContent = r.ok ? `✅ Approved ${username}` : `❌ Failed approve ${username}`;
          }
          refresh();
        });
      });

      usersTable.querySelectorAll("[data-deny]").forEach(btn => {
        btn.addEventListener("click", async () => {
          const username = btn.getAttribute("data-deny");
          const r = await ZagaAPI.adminDeny(username);
          if(adminMsg){
            adminMsg.style.display = "block";
            adminMsg.textContent = r.ok ? `✅ Denied ${username}` : `❌ Failed deny ${username}`;
          }
          refresh();
        });
      });
    }

    refresh();
  }

  /* ====================== VIDEOS PAGE ====================== */
  async function initVideosPage(){
    const file = (location.pathname.split("/").pop() || "").toLowerCase();
    if(file !== "videos.html") return;

    try {
      bindModalEvents();

      const logoutBtn = document.getElementById("logoutBtn");
      if(logoutBtn && !logoutBtn.__bound){
        logoutBtn.__bound = true;
        logoutBtn.addEventListener("click", async () => {
          await ZagaAPI.logout();
          window.location.href = "login.html";
        });
      }

      const me = await requireAuth();
      if(!me) return;

      currentUser = me.username || null;

      const userSpan = document.getElementById("current-user");
      if(userSpan && currentUser) userSpan.textContent = currentUser;

      const adminLink = document.getElementById("admin-link");
      if(adminLink && me.role === "admin") adminLink.style.display = "inline-flex";

      const ok = await loadVideosFromAPI();
      if(!ok) return;

      renderVideos("");
      if(currentUser) renderHistory(currentUser);

    } catch (err) {
      console.error("videos init error:", err);
    } finally {
      hideSpinner();
    }
  }

  function boot(){
    initVideosPage();
    initAdminPage();
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  // expose
  window.openModal = openModalById;
  window.closeModal = closeModal;
})();

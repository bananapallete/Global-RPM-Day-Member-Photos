/* 2026 Global RPM Day — Profile Gallery */
(function () {
  "use strict";

  const homeEl = document.getElementById("home");
  const teamViewEl = document.getElementById("team-view");
  const cardsEl = document.getElementById("cards");
  const teamTitleEl = document.getElementById("team-title");
  const teamTitleEnEl = document.getElementById("team-title-en");
  const teamCountEl = document.getElementById("team-count");
  const viewToggleEl = document.getElementById("view-toggle");
  const backBtn = document.getElementById("back-btn");
  const backLabelEl = document.getElementById("back-label");
  const siteSubEl = document.getElementById("site-sub");
  const langModalEl = document.getElementById("lang-modal");
  const langToggleBtn = document.getElementById("lang-toggle");

  /* ---------- 다국어 ---------- */
  const I18N = {
    ko: {
      title: "프로필 갤러리",
      sub: "행사를 빛낸 구성원들의 사진을 만나보세요",
      back: "전체 사업부",
      memberCount: function (n) { return "구성원 " + n + "명"; },
      btnCount: function (n) { return n + "명"; },
      download: "사진 다운로드",
      photoAlt: function (name) { return name + " 사진"; },
      toggleLabel: "English",
      viewAi: "AI",
      viewPolo: "카라티",
      dlAi: "AI 사진",
      dlPolo: "카라티 사진",
      poloSuffix: "_카라티",
    },
    en: {
      title: "Profile Gallery",
      sub: "Meet the members who lit up the event",
      back: "All Divisions",
      memberCount: function (n) { return n + " members"; },
      btnCount: function (n) { return String(n); },
      download: "Download Photo",
      photoAlt: function (name) { return "Photo of " + name; },
      toggleLabel: "한국어",
      viewAi: "AI",
      viewPolo: "Polo",
      dlAi: "AI Photo",
      dlPolo: "Polo Photo",
      poloSuffix: "_polo",
    },
  };

  const LANG_KEY = "rpm-gallery-lang";
  let lang = localStorage.getItem(LANG_KEY);
  if (lang !== "ko" && lang !== "en") lang = null;

  function t() { return I18N[lang || "ko"]; }

  function memberName(m) {
    return lang === "en" ? (m.en || m.name) : m.name;
  }

  const teamById = {};
  DATA.forEach(function (div) {
    div.teams.forEach(function (t) { teamById[t.id] = t; });
  });

  /* ---------- 히어로 롤링 배너: 접속마다 랜덤 구성원 샘플 ---------- */
  const HERO_COUNT = 12;
  const heroSample = (function () {
    const all = [];
    DATA.forEach(function (div) {
      div.teams.forEach(function (team) {
        team.members.forEach(function (m) { all.push({ m: m, team: team }); });
      });
    });
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = all[i]; all[i] = all[j]; all[j] = tmp;
    }
    return all.slice(0, HERO_COUNT);
  })();

  function buildHeroRoll() {
    const roll = document.createElement("div");
    roll.className = "hero-roll";
    const track = document.createElement("div");
    track.className = "hero-track";
    // 끊김 없는 무한 루프를 위해 같은 목록을 두 번 이어 붙임
    for (let copy = 0; copy < 2; copy++) {
      heroSample.forEach(function (item) {
        const card = document.createElement("a");
        card.className = "hero-card";
        card.href = "#/team/" + item.team.id;
        if (copy === 1) {
          card.setAttribute("aria-hidden", "true");
          card.tabIndex = -1;
        }
        const photo = document.createElement("div");
        photo.className = "hero-card-photo";
        const img = document.createElement("img");
        img.src = encodePath(item.m.thumb);
        img.alt = "";
        photo.appendChild(img);
        const nm = document.createElement("p");
        nm.className = "hero-card-name";
        nm.textContent = memberName(item.m);
        const tm = document.createElement("p");
        tm.className = "hero-card-team";
        tm.textContent = lang === "en" ? item.team.en : item.team.kr;
        card.append(photo, nm, tm);
        track.appendChild(card);
      });
    }
    track.style.animationDuration = heroSample.length * 3.2 + "s";
    roll.appendChild(track);
    ensureHeroRolling(track);
    return roll;
  }

  // CSS 애니메이션이 동작하지 않는 환경(동작 줄이기 설정, 구형 브라우저 등)에서는
  // requestAnimationFrame으로 직접 슬라이딩
  function ensureHeroRolling(track) {
    setTimeout(function () {
      if (!track.isConnected) return;
      const before = getComputedStyle(track).transform;
      setTimeout(function () {
        if (!track.isConnected) return;
        if (getComputedStyle(track).transform !== before) return; // CSS 애니메이션 정상 동작
        track.style.animation = "none";
        let x = 0;
        let last = performance.now();
        const SPEED = 45; // px/s — CSS 애니메이션과 비슷한 속도
        function step(now) {
          if (!track.isConnected) return;
          x += ((now - last) / 1000) * SPEED;
          last = now;
          const half = track.scrollWidth / 2;
          if (half > 0 && x >= half) x -= half;
          track.style.transform = "translateX(" + -x + "px)";
          requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      }, 700);
    }, 300);
  }

  /* ---------- 홈 렌더링 ---------- */
  function renderHome() {
    homeEl.replaceChildren();
    const frag = document.createDocumentFragment();
    frag.appendChild(buildHeroRoll());
    DATA.forEach(function (div) {
      const section = document.createElement("div");
      section.className = "division";

      const head = document.createElement("div");
      head.className = "division-head";
      const headKr = document.createElement("span");
      headKr.className = "division-kr";
      headKr.textContent = lang === "en" ? div.en : div.kr;
      head.appendChild(headKr);
      if (lang !== "en") {
        const headEn = document.createElement("span");
        headEn.className = "division-en";
        headEn.textContent = div.en;
        head.appendChild(headEn);
      }
      section.appendChild(head);

      const grid = document.createElement("div");
      grid.className = "team-grid";
      div.teams.forEach(function (team) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "team-btn";
        const kr = document.createElement("span");
        kr.className = "kr";
        kr.textContent = lang === "en" ? team.en : team.kr;
        btn.appendChild(kr);
        if (lang !== "en") {
          const en = document.createElement("span");
          en.className = "en";
          en.textContent = team.en;
          btn.appendChild(en);
        }
        const cnt = document.createElement("span");
        cnt.className = "cnt";
        cnt.textContent = t().btnCount(team.members.length);
        btn.appendChild(cnt);
        btn.addEventListener("click", function () {
          location.hash = "#/team/" + team.id;
        });
        grid.appendChild(btn);
      });
      section.appendChild(grid);
      frag.appendChild(section);
    });
    homeEl.appendChild(frag);
  }

  /* ---------- 팀 카드 렌더링 ---------- */
  function encodePath(path) {
    return path.split("/").map(encodeURIComponent).join("/");
  }

  function renderTeam(team) {
    teamTitleEl.textContent = lang === "en" ? team.en : team.kr;
    teamTitleEnEl.textContent = lang === "en" ? "" : team.en;
    teamTitleEnEl.hidden = lang === "en";
    teamCountEl.textContent = t().memberCount(team.members.length);
    cardsEl.replaceChildren();

    // 카드별 뷰 전환 함수 목록 (우측 상단 일괄 토글용)
    const cardSetters = [];
    const frag = document.createDocumentFragment();
    team.members.forEach(function (m) {
      const card = document.createElement("div");
      card.className = "card";

      const photo = document.createElement("div");
      photo.className = "card-photo";
      const img = document.createElement("img");
      img.src = encodePath(m.thumb);
      img.alt = t().photoAlt(memberName(m));
      img.loading = "lazy";
      photo.appendChild(img);

      // 카라티 사진이 있으면 AI ↔ 카라티 전환 토글
      if (m.thumbPolo) {
        const seg = document.createElement("div");
        seg.className = "photo-toggle";
        const btnAi = document.createElement("button");
        btnAi.type = "button";
        btnAi.textContent = t().viewAi;
        btnAi.className = "on";
        const btnPolo = document.createElement("button");
        btnPolo.type = "button";
        btnPolo.textContent = t().viewPolo;
        function setView(v) {
          img.src = encodePath(v === "polo" ? m.thumbPolo : m.thumb);
          btnAi.classList.toggle("on", v === "ai");
          btnPolo.classList.toggle("on", v === "polo");
        }
        btnAi.addEventListener("click", function () { setView("ai"); });
        btnPolo.addEventListener("click", function () { setView("polo"); });
        seg.append(btnAi, btnPolo);
        photo.appendChild(seg);
        cardSetters.push(setView);
      }

      const displayName = memberName(m);
      const name = document.createElement("p");
      name.className = "card-name";
      // 긴 영문 이름이 카드를 벗어나지 않도록 길이에 따라 글자 크기 축소
      if (displayName.length > 24) name.classList.add("xlong");
      else if (displayName.length > 14) name.classList.add("long");
      name.textContent = displayName;

      const teamLabel = document.createElement("p");
      teamLabel.className = "card-team";
      teamLabel.textContent = lang === "en" ? team.en : m.team;

      let dl;
      if (m.photoPolo) {
        // 다운로드 버튼 → AI / 카라티 선택 메뉴
        dl = document.createElement("div");
        dl.className = "card-dl-wrap";
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "card-dl";
        btn.innerHTML = '<span></span>' +
          '<img src="assets/download-icon.svg" alt="" aria-hidden="true" />';
        btn.querySelector("span").textContent = t().download;
        const menu = document.createElement("div");
        menu.className = "dl-menu";
        menu.hidden = true;
        [[t().dlAi, m.photo, displayName + ".png"],
         [t().dlPolo, m.photoPolo, displayName + t().poloSuffix + ".png"]]
          .forEach(function (opt) {
            const a = document.createElement("a");
            a.href = encodePath(opt[1]);
            a.setAttribute("download", opt[2]);
            a.textContent = opt[0];
            a.addEventListener("click", function () { menu.hidden = true; });
            menu.appendChild(a);
          });
        btn.addEventListener("click", function (e) {
          e.stopPropagation();
          const wasHidden = menu.hidden;
          closeDlMenus();
          menu.hidden = !wasHidden;
        });
        dl.append(menu, btn);
      } else {
        dl = document.createElement("a");
        dl.className = "card-dl";
        dl.href = encodePath(m.photo);
        dl.setAttribute("download", displayName + ".png");
        dl.innerHTML = '<span></span>' +
          '<img src="assets/download-icon.svg" alt="" aria-hidden="true" />';
        dl.querySelector("span").textContent = t().download;
      }

      card.append(photo, name, teamLabel, dl);
      frag.appendChild(card);
    });
    cardsEl.appendChild(frag);

    // 우측 상단 일괄 토글: 팀 내 모든 카드의 AI ↔ 카라티를 한 번에 전환
    viewToggleEl.replaceChildren();
    viewToggleEl.hidden = cardSetters.length === 0;
    if (cardSetters.length) {
      const gAi = document.createElement("button");
      gAi.type = "button";
      gAi.textContent = t().viewAi;
      gAi.className = "on";
      const gPolo = document.createElement("button");
      gPolo.type = "button";
      gPolo.textContent = t().viewPolo;
      function setAll(v) {
        cardSetters.forEach(function (fn) { fn(v); });
        gAi.classList.toggle("on", v === "ai");
        gPolo.classList.toggle("on", v === "polo");
      }
      gAi.addEventListener("click", function () { setAll("ai"); });
      gPolo.addEventListener("click", function () { setAll("polo"); });
      viewToggleEl.append(gAi, gPolo);
    }
  }

  function closeDlMenus() {
    document.querySelectorAll(".dl-menu").forEach(function (el) {
      el.hidden = true;
    });
  }
  document.addEventListener("click", closeDlMenus);

  /* ---------- 언어 적용 ---------- */
  function applyLang() {
    document.documentElement.lang = lang === "en" ? "en" : "ko";
    document.body.classList.toggle("lang-en", lang === "en");
    document.querySelector(".site-title").textContent = t().title;
    siteSubEl.textContent = t().sub;
    backLabelEl.textContent = t().back;
    langToggleBtn.textContent = t().toggleLabel;
    renderHome();
    route();
  }

  function setLang(next) {
    lang = next;
    localStorage.setItem(LANG_KEY, next);
    applyLang();
  }

  langModalEl.querySelectorAll(".lang-choice").forEach(function (btn) {
    btn.addEventListener("click", function () {
      langModalEl.hidden = true;
      setLang(btn.dataset.lang);
    });
  });

  langToggleBtn.addEventListener("click", function () {
    setLang(lang === "en" ? "ko" : "en");
  });

  /* ---------- 라우팅 ---------- */
  function route() {
    const match = location.hash.match(/^#\/team\/([\w-]+)$/);
    const team = match ? teamById[match[1]] : null;
    if (team) {
      homeEl.hidden = true;
      teamViewEl.hidden = false;
      renderTeam(team);
      window.scrollTo(0, 0);
    } else {
      teamViewEl.hidden = true;
      homeEl.hidden = false;
      window.scrollTo(0, 0);
    }
  }

  backBtn.addEventListener("click", function () {
    if (location.hash) {
      location.hash = "";
    }
  });

  window.addEventListener("hashchange", route);

  /* ---------- 초기화: 접속할 때마다 언어 선택 팝업 표시 ---------- */
  if (!lang) lang = "ko"; // 팝업 뒤 배경 기본 언어
  applyLang();
  langModalEl.hidden = false;
})();

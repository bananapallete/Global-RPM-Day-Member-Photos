/* 2026 Global RPM Day — Profile Gallery */
(function () {
  "use strict";

  const homeEl = document.getElementById("home");
  const teamViewEl = document.getElementById("team-view");
  const cardsEl = document.getElementById("cards");
  const teamTitleEl = document.getElementById("team-title");
  const teamTitleEnEl = document.getElementById("team-title-en");
  const teamCountEl = document.getElementById("team-count");
  const backBtn = document.getElementById("back-btn");
  const backLabelEl = document.getElementById("back-label");
  const siteSubEl = document.getElementById("site-sub");
  const langModalEl = document.getElementById("lang-modal");
  const langToggleBtn = document.getElementById("lang-toggle");

  /* ---------- 다국어 ---------- */
  const I18N = {
    ko: {
      sub: "7월 15일을 뜨겁게 달궜던 구성원들의 재밌는 사진을 만나보세요",
      back: "전체 사업부",
      memberCount: function (n) { return "구성원 " + n + "명"; },
      btnCount: function (n) { return n + "명"; },
      download: "사진 다운로드",
      photoAlt: function (name) { return name + " 사진"; },
      toggleLabel: "English",
    },
    en: {
      sub: "Enjoy the fun photos of the members who lit up July 15",
      back: "All Divisions",
      memberCount: function (n) { return n + " members"; },
      btnCount: function (n) { return String(n); },
      download: "Download Photo",
      photoAlt: function (name) { return "Photo of " + name; },
      toggleLabel: "한국어",
    },
  };

  const NOTE_EN = { "인턴": "Intern", "호주": "Australia", "미주": "Americas", "인도": "India" };

  const LANG_KEY = "rpm-gallery-lang";
  let lang = localStorage.getItem(LANG_KEY);
  if (lang !== "ko" && lang !== "en") lang = null;

  function t() { return I18N[lang || "ko"]; }

  function memberName(m) {
    return lang === "en" ? (m.en || m.name) : m.name;
  }

  function memberNote(m) {
    if (!m.note) return "";
    return lang === "en" ? (NOTE_EN[m.note] || m.note) : m.note;
  }

  const teamById = {};
  DATA.forEach(function (div) {
    div.teams.forEach(function (t) { teamById[t.id] = t; });
  });

  /* ---------- 홈 렌더링 ---------- */
  function renderHome() {
    homeEl.replaceChildren();
    const frag = document.createDocumentFragment();
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

      const displayName = memberName(m);
      const name = document.createElement("p");
      name.className = "card-name";
      // 긴 영문 이름이 카드를 벗어나지 않도록 길이에 따라 글자 크기 축소
      if (displayName.length > 24) name.classList.add("xlong");
      else if (displayName.length > 14) name.classList.add("long");
      name.textContent = displayName;
      const noteText = memberNote(m);
      if (noteText) {
        const note = document.createElement("span");
        note.className = "note";
        note.textContent = noteText;
        name.appendChild(note);
      }

      const teamLabel = document.createElement("p");
      teamLabel.className = "card-team";
      teamLabel.textContent = lang === "en" ? team.en : m.team;

      const dl = document.createElement("a");
      dl.className = "card-dl";
      dl.href = encodePath(m.photo);
      dl.setAttribute("download", displayName + ".png");
      dl.innerHTML = '<span></span>' +
        '<img src="assets/download-icon.svg" alt="" aria-hidden="true" />';
      dl.querySelector("span").textContent = t().download;

      card.append(photo, name, teamLabel, dl);
      frag.appendChild(card);
    });
    cardsEl.appendChild(frag);
  }

  /* ---------- 언어 적용 ---------- */
  function applyLang() {
    document.documentElement.lang = lang === "en" ? "en" : "ko";
    document.body.classList.toggle("lang-en", lang === "en");
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

  /* ---------- 초기화: 첫 방문이면 언어 선택 팝업 ---------- */
  if (lang) {
    applyLang();
  } else {
    lang = "ko"; // 팝업 뒤 배경은 국문으로 렌더
    applyLang();
    lang = null;
    langModalEl.hidden = false;
  }
})();

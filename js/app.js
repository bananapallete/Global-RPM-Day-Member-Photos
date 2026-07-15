/* 2026 Global RPM Day — 구성원 사진 */
(function () {
  "use strict";

  const homeEl = document.getElementById("home");
  const teamViewEl = document.getElementById("team-view");
  const cardsEl = document.getElementById("cards");
  const teamTitleEl = document.getElementById("team-title");
  const teamTitleEnEl = document.getElementById("team-title-en");
  const teamCountEl = document.getElementById("team-count");
  const backBtn = document.getElementById("back-btn");

  const teamById = {};
  DATA.forEach(function (div) {
    div.teams.forEach(function (t) { teamById[t.id] = t; });
  });

  /* ---------- 홈 렌더링 ---------- */
  function renderHome() {
    const frag = document.createDocumentFragment();
    DATA.forEach(function (div) {
      const section = document.createElement("div");
      section.className = "division";

      const head = document.createElement("div");
      head.className = "division-head";
      head.innerHTML =
        '<span class="division-kr"></span><span class="division-en"></span>';
      head.querySelector(".division-kr").textContent = div.kr;
      head.querySelector(".division-en").textContent = div.en;
      section.appendChild(head);

      const grid = document.createElement("div");
      grid.className = "team-grid";
      div.teams.forEach(function (t) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "team-btn";
        const kr = document.createElement("span");
        kr.className = "kr";
        kr.textContent = t.kr;
        const en = document.createElement("span");
        en.className = "en";
        en.textContent = t.en;
        const cnt = document.createElement("span");
        cnt.className = "cnt";
        cnt.textContent = t.members.length + "명";
        btn.append(kr, en, cnt);
        btn.addEventListener("click", function () {
          location.hash = "#/team/" + t.id;
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
    teamTitleEl.textContent = team.kr;
    teamTitleEnEl.textContent = team.en;
    teamCountEl.textContent = "구성원 " + team.members.length + "명";
    cardsEl.replaceChildren();

    const frag = document.createDocumentFragment();
    team.members.forEach(function (m) {
      const card = document.createElement("div");
      card.className = "card";

      const photo = document.createElement("div");
      photo.className = "card-photo";
      const img = document.createElement("img");
      img.src = encodePath(m.thumb);
      img.alt = m.name + " 사진";
      img.loading = "lazy";
      photo.appendChild(img);

      const name = document.createElement("p");
      name.className = "card-name";
      name.textContent = m.name;
      if (m.note) {
        const note = document.createElement("span");
        note.className = "note";
        note.textContent = m.note;
        name.appendChild(note);
      }

      const teamLabel = document.createElement("p");
      teamLabel.className = "card-team";
      teamLabel.textContent = m.team;

      const dl = document.createElement("a");
      dl.className = "card-dl";
      dl.href = encodePath(m.photo);
      dl.setAttribute("download", m.name + ".png");
      dl.innerHTML = '<span>사진 다운로드</span>' +
        '<img src="assets/download-icon.svg" alt="" aria-hidden="true" />';

      card.append(photo, name, teamLabel, dl);
      frag.appendChild(card);
    });
    cardsEl.appendChild(frag);
  }

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

  renderHome();
  route();
})();

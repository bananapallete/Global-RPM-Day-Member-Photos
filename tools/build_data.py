#!/usr/bin/env python3
"""data/members.json → js/data.js 생성 스크립트."""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 섹션명 → 팀 설정 (표시 순서는 DIVISIONS 정의를 따름)
TEAMS = {
    "남부사업 TF":   {"id": "nambu",       "kr": "남부사업 TF",    "en": "Southern Business TF"},
    "기계사업팀":    {"id": "mech",        "kr": "기계사업팀",     "en": "Mechanical Business Team"},
    "구조사업팀":    {"id": "struct",      "kr": "구조사업팀",     "en": "Structural Business Team"},
    "건축사업팀":    {"id": "arch",        "kr": "건축사업팀",     "en": "Architectural Business Team"},
    "지반사업팀":    {"id": "geo",         "kr": "지반사업팀",     "en": "Geotechnical Business Team"},
    "ENR TF":        {"id": "enr",         "kr": "ENR TF",         "en": "ENR TF"},
    "아시아사업팀":  {"id": "asia",        "kr": "아시아사업팀",   "en": "Asia Business Team"},
    "설계개발팀":    {"id": "design-dev",  "kr": "설계개발팀",     "en": "Design Development Team"},
    "엔솔개발팀":    {"id": "ensol-dev",   "kr": "엔솔개발팀",     "en": "EnSol Development Team"},
    "기술기획팀":    {"id": "tech-plan",   "kr": "기술기획팀",     "en": "Technology Planning Team"},
    "MAX TF":        {"id": "max",         "kr": "MAX TF",         "en": "MAX TF"},
    "모티브개발팀":  {"id": "motiv",       "kr": "모티브개발팀",   "en": "Motive Development Team"},
    "웹서비스개발팀": {"id": "web-service", "kr": "웹서비스개발팀", "en": "Web Service Development Team"},
    "온사이트개발팀": {"id": "onsite",      "kr": "온사이트개발팀", "en": "OnSite Development Team"},
    "미주법인":      {"id": "us",          "kr": "미주법인",       "en": "Americas Branch"},
    "일본법인":      {"id": "japan",       "kr": "일본법인",       "en": "Japan Branch"},
    "러시아법인":    {"id": "russia",      "kr": "러시아법인",     "en": "Russia Branch"},
    "인도법인":      {"id": "india",       "kr": "인도법인",       "en": "India Branch"},
    "중국법인":      {"id": "china",       "kr": "중국법인",       "en": "China Branch"},
    "필리핀법인":    {"id": "philippines", "kr": "필리핀법인",     "en": "Philippines Branch"},
    "호주법인":      {"id": "australia",   "kr": "호주법인",       "en": "Australia Branch"},
    "유럽법인":      {"id": "europe",      "kr": "유럽법인",       "en": "Europe Branch"},
}

DIVISIONS = [
    {"kr": "국내사업",      "en": "Domestic Business",
     "teams": ["남부사업 TF", "기계사업팀", "구조사업팀", "건축사업팀", "지반사업팀"]},
    {"kr": "해외사업",      "en": "Global Business",
     "teams": ["ENR TF", "아시아사업팀"]},
    {"kr": "엔솔 제품 개발", "en": "EnSol Product Development",
     "teams": ["설계개발팀", "엔솔개발팀", "기술기획팀"]},
    {"kr": "엔솔 웹 개발",   "en": "EnSol Web Development",
     "teams": ["MAX TF", "모티브개발팀", "웹서비스개발팀", "온사이트개발팀"]},
    {"kr": "해외법인",      "en": "Overseas Subsidiaries",
     "teams": ["미주법인", "일본법인", "러시아법인", "인도법인",
                "중국법인", "필리핀법인", "호주법인", "유럽법인"]},
]

# 팀 id → 영문명 시트(data/names_en.tsv)의 소속명
SHEET_TEAM_BY_ID = {
    "nambu": "Southern BIZ TF",
    "mech": "Mechanical BIZ Team",
    "struct": "Structural BIZ Team",
    "arch": "Architecture BIZ Team",
    "geo": "Geotechnical BIZ Team",
    "enr": "ENR TF",
    "asia": "Asia BIZ Team",
    "design-dev": "Design DEV Team",
    "ensol-dev": "EnSol DEV Team",
    "tech-plan": "Technical Planning Team",
    "max": "MAX TF",
    "motiv": "MOTIIV DEV Team",
    "web-service": "Web Services DEV Team",
    "us": "North America Branch",
    "japan": "Japan Branch",
    "russia": "Russia Branch",
    "india": "India Branch",
    "china": "China Branch",
    "philippines": "Philippine Branch",
    "australia": "Australia Branch",
    "europe": "Europe BIZ Team",
}

# 시트에 없거나 동명이인으로 자동 매칭이 불가능한 경우의 수동 지정
# (※ 시트 미기재 인원의 영문명은 통상 로마자 표기 기준 — 확정 표기가 나오면 교체)
MANUAL_EN = {
    ("onsite", "윤장호"): "Yoon Jangho",   # 지반사업팀 명단(인턴) — 엔솔개발팀 Yun Jangho와 동명이인
    ("europe", "로힛"): "Rohit",           # 시트 미기재
    ("japan", "이종석"): "Lee Jongseok",    # 이하 시트 미기재
    ("japan", "김정민"): "Kim Jungmin",
    ("japan", "장용재"): "Jang Yongjae",
    ("japan", "엄태현"): "Eom Taehyun",
    ("japan", "김준기"): "Kim Junki",
    ("japan", "권오준"): "Kwon Ohjun",
    ("japan", "김혜정"): "Kim Hyejung",
    ("japan", "정진홍"): "Jung Jinhong",
    ("japan", "조민현"): "Cho Minhyun",
    ("china", "리업붕"): "Li Yepeng",
    ("china", "유문아"): "Liu Wenya",
    ("philippines", "테사"): "Tessa",
    ("philippines", "마리"): "Mari",
}


def load_en_rows():
    rows = []
    with open(os.path.join(ROOT, "data", "names_en.tsv"), encoding="utf-8") as f:
        for line in f:
            line = line.rstrip("\n")
            if not line or line.startswith("#"):
                continue
            kr, en, team = line.split("\t")
            rows.append((kr, en, team))
    return rows


def make_en_lookup(rows):
    by_team = {}
    by_name = {}
    for kr, en, team in rows:
        by_team.setdefault((team, kr), en)
        by_name.setdefault(kr, set()).add(en)

    def lookup(team_id, name):
        if (team_id, name) in MANUAL_EN:
            return MANUAL_EN[(team_id, name)]
        sheet_team = SHEET_TEAM_BY_ID.get(team_id)
        if sheet_team and (sheet_team, name) in by_team:
            return by_team[(sheet_team, name)]
        cands = by_name.get(name, set())
        if len(cands) == 1:
            return next(iter(cands))
        # 시트에는 전체 이름("히로세 에이쥬"), 사이트에는 앞부분("히로세")만 있는 경우
        prefix = {en for kr, en in ((k, e) for k, s in by_name.items() for e in s)
                  if kr.startswith(name + " ")}
        if len(prefix) == 1:
            return prefix.pop()
        return None

    return lookup


def main():
    with open(os.path.join(ROOT, "data", "members.json"), encoding="utf-8") as f:
        raw = json.load(f)

    by_section = {s["sectionName"]: s["members"] for s in raw["sections"]}
    en_lookup = make_en_lookup(load_en_rows())

    divisions = []
    total = 0
    missing_en = []
    for div in DIVISIONS:
        teams = []
        for name in div["teams"]:
            cfg = TEAMS[name]
            members = []
            for m in by_section[name]:
                folder = cfg["id"]
                fname = m["name"] + ".png"
                if not os.path.exists(os.path.join(ROOT, "photos", folder, fname)):
                    raise SystemExit(f"missing photo: {folder}/{fname}")
                en_name = en_lookup(cfg["id"], m["name"])
                if not en_name:
                    missing_en.append(f"{cfg['id']}/{m['name']}")
                entry = {
                    "name": m["name"],
                    "en": en_name or "",
                    "team": m["team"],
                    "note": m.get("note", ""),
                    "photo": f"photos/{folder}/{m['name']}.png",
                    "thumb": f"thumbs/{folder}/{m['name']}.webp",
                }
                # 카라티(폴로) 사진이 있으면 함께 노출
                if os.path.exists(os.path.join(
                        ROOT, "photos-polo", folder, m["name"] + ".png")):
                    entry["photoPolo"] = f"photos-polo/{folder}/{m['name']}.png"
                    entry["thumbPolo"] = f"thumbs-polo/{folder}/{m['name']}.webp"
                members.append(entry)
            total += len(members)
            teams.append({"id": cfg["id"], "kr": cfg["kr"], "en": cfg["en"],
                          "members": members})
        divisions.append({"kr": div["kr"], "en": div["en"], "teams": teams})

    out = "// 자동 생성 파일 — tools/build_data.py 로 재생성\n"
    out += "const DATA = " + json.dumps(divisions, ensure_ascii=False, indent=2) + ";\n"
    with open(os.path.join(ROOT, "js", "data.js"), "w", encoding="utf-8") as f:
        f.write(out)
    print(f"js/data.js generated — {total} members")
    if missing_en:
        print(f"[warn] 영문명 미매칭 {len(missing_en)}명: " + ", ".join(missing_en))


if __name__ == "__main__":
    main()

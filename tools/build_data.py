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
    "미주법인":      {"id": "us",          "kr": "미주법인",       "en": "Americas Subsidiary"},
    "일본법인":      {"id": "japan",       "kr": "일본법인",       "en": "Japan Subsidiary"},
    "러시아법인":    {"id": "russia",      "kr": "러시아법인",     "en": "Russia Subsidiary"},
    "인도법인":      {"id": "india",       "kr": "인도법인",       "en": "India Subsidiary"},
    "중국법인":      {"id": "china",       "kr": "중국법인",       "en": "China Subsidiary"},
    "필리핀법인":    {"id": "philippines", "kr": "필리핀법인",     "en": "Philippines Subsidiary"},
    "호주법인":      {"id": "australia",   "kr": "호주법인",       "en": "Australia Subsidiary"},
    "유럽법인":      {"id": "europe",      "kr": "유럽법인",       "en": "Europe Subsidiary"},
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

# 카드 소속 표기 시 치환 (좌석배치도와 동일하게 북미법인 → 미주법인)
TEAM_LABEL_RENAME = {"북미법인": "미주법인"}


def main():
    with open(os.path.join(ROOT, "data", "members.json"), encoding="utf-8") as f:
        raw = json.load(f)

    by_section = {s["sectionName"]: s["members"] for s in raw["sections"]}

    divisions = []
    total = 0
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
                members.append({
                    "name": m["name"],
                    "team": TEAM_LABEL_RENAME.get(m["team"], m["team"]),
                    "note": m.get("note", ""),
                    "photo": f"photos/{folder}/{m['name']}.png",
                    "thumb": f"thumbs/{folder}/{m['name']}.webp",
                })
            total += len(members)
            teams.append({"id": cfg["id"], "kr": cfg["kr"], "en": cfg["en"],
                          "members": members})
        divisions.append({"kr": div["kr"], "en": div["en"], "teams": teams})

    out = "// 자동 생성 파일 — tools/build_data.py 로 재생성\n"
    out += "const DATA = " + json.dumps(divisions, ensure_ascii=False, indent=2) + ";\n"
    with open(os.path.join(ROOT, "js", "data.js"), "w", encoding="utf-8") as f:
        f.write(out)
    print(f"js/data.js generated — {total} members")


if __name__ == "__main__":
    main()

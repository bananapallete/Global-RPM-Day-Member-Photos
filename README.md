# 2026 Global RPM Day · Profile Gallery

2026 Global RPM Day 구성원 AI 사진 공유 웹사이트.
첫 방문 시 국문/영문 선택 팝업이 뜨며, 우측 상단 버튼으로 언제든 언어를 전환할 수 있습니다.
사업부(팀) 버튼을 누르면 구성원 카드가 나타나고, 각 카드에서 AI로 재구성한 사진을 다운로드할 수 있습니다.

## 구성

- `index.html` / `css/style.css` / `js/app.js` — 정적 반응형 웹 (데스크톱·모바일, 국문/영문)
- `js/data.js` — 사업부/팀/구성원 데이터 (자동 생성)
- `photos/<팀>/<이름>.png` — 원본 AI 사진 (다운로드 대상, 936×1664)
- `thumbs/<팀>/<이름>.webp` — 카드 표시용 썸네일 (640px)
- `data/members.json` — Figma 노드 매핑 원본 데이터
- `data/names_en.tsv` — 구성원 영문명 매핑 (Google Sheets 명단 기준)
- `tools/build_data.py` — `data/members.json` + `data/names_en.tsv` → `js/data.js` 생성 스크립트

## 데이터 갱신

```bash
python3 tools/build_data.py
```

## 로컬 실행

```bash
python3 -m http.server 8899
# http://localhost:8899
```

디자인: Figma `2026 Global RPM Day` 다크모드 디자인 가이드(3724:11189) · 카드 디자인(4131:20694) 기반, Pretendard 폰트 사용.

# 카라티(폴로) 사진 작업 이어하기

이전 세션에서 준비 완료된 것:
- `data/polo_nodes.json` / `data/polo_download_list.json` — 280명 전원의 Figma 카라티 사진 노드 매핑 (파일 키 `C1LU5goj8vixiJrsht3nTY`)
- `tools/make_bust_thumbs.py --polo` — photos-polo/ → thumbs-polo/ 얼굴 인식 바스트샷 크롭 (AI 사진과 동일 프레이밍)
- `tools/build_data.py` — photos-polo/에 파일이 있으면 data.js에 photoPolo/thumbPolo 필드 자동 생성
- `js/app.js` / `css/style.css` — 카드 AI↔카라티 토글, 다운로드 선택 메뉴 (이미 구현·배포됨, 파일이 생기면 자동 활성화)

## 남은 절차

1. **다운로드 (280장)** — `data/polo_download_list.json`의 각 항목 `{team, name, node}`에 대해:
   - Figma MCP `download_assets` (fileKey `C1LU5goj8vixiJrsht3nTY`, nodeId = node) 호출
   - 응답의 `export.url`을 `curl -L -o "photos-polo/<team>/<name>.png" <url>` 로 저장 (URL은 단기 만료 — 배치마다 즉시 curl)
   - 전제: 세션 네트워크 정책에서 www.figma.com 허용 필요
2. **검증** — 각 PNG가 유효한 이미지인지(파일 크기 > 100KB, cv2로 열림), 개수 280개 확인
3. **썸네일 생성** — 의존성: `pip install "opencv-python-headless<5" pillow numpy mediapipe` + `apt-get install -y libgles2 libegl1`
   ```bash
   python3 tools/make_bust_thumbs.py --polo
   ```
   (모델 파일 tools/blaze_face_short_range.tflite 포함됨)
4. **데이터 재생성** — `python3 tools/build_data.py` → data.js에 photoPolo 280건 생기는지 확인
5. **브라우저 검증** — 카드 토글(AI↔카라티), 다운로드 메뉴 2옵션, 카라티 썸네일 바스트샷 프레이밍
6. **커밋 → PR → main 머지** (기존 관례: 브랜치에서 PR 만들어 바로 머지하면 GitHub Pages 자동 배포)

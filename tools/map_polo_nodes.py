#!/usr/bin/env python3
"""Figma 섹션 메타데이터(XML)에서 구성원별 카라티 사진 노드를 매핑.

레이아웃 규칙: 구성원 슬롯마다 [원본, 카라티(ChatGPT), 판타지 AI] 순서로
가로 배치. members.json의 AI 노드를 기준으로 같은 행(y ±400)에서
AI 노드 왼쪽 200~2400px 범위의 가장 가까운 이미지가 카라티.

stdin으로 섹션 XML(들)을 받아 data/polo_nodes.json에 누적 저장.
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "polo_nodes.json")

# AI 노드 id → (팀, 이름)
members = {}
data = json.load(open(os.path.join(ROOT, "data", "members.json"), encoding="utf-8"))
for s in data["sections"]:
    for m in s["members"]:
        members[m["node"]] = (s["sectionName"], m["name"])

xml = sys.stdin.read()
rects = re.findall(
    r'<rounded-rectangle id="([\d:]+)" name="([^"]*)" x="(-?\d+)" y="(-?\d+)"'
    r' width="(\d+)" height="(\d+)"', xml)
rects = [(i, n, int(x), int(y), int(w), int(h)) for i, n, x, y, w, h in rects]

mapping = {}
if os.path.exists(OUT):
    mapping = json.load(open(OUT, encoding="utf-8"))

found, missing, ambiguous = 0, [], []
for rid, name, x, y, w, h in rects:
    if rid not in members:
        continue
    team, mname = members[rid]
    # 같은 행, AI 노드 왼쪽 200~2400px 내에서 가장 가까운 이미지
    cands = [(rx, cid, cn) for cid, cn, rx, ry, rw, rh in rects
             if cid != rid and abs(ry - y) < 400 and 200 <= x - rx <= 2400]
    key = f"{team}/{mname}"
    if not cands:
        missing.append(key)
        continue
    cands.sort(reverse=True)
    dist = x - cands[0][0]
    if dist > 1800:
        ambiguous.append(f"{key}(d={dist})")
    mapping[key] = {"polo_node": cands[0][1], "polo_layer": cands[0][2],
                    "dist": dist}
    found += 1

json.dump(mapping, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"+{found}건 매핑 (누적 {len(mapping)}) | 미발견: {missing or '없음'} | "
      f"거리 이상: {ambiguous or '없음'}")

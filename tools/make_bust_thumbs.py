#!/usr/bin/env python3
"""photos/ 원본에서 얼굴 위치를 인식해 카드 비율(275:327) 바스트샷 썸네일 생성.

원본마다 인물 크기(카메라 거리)가 달라 일괄 크롭으로는 구도가 통일되지 않으므로,
얼굴 검출(mediapipe BlazeFace) 결과를 기준으로 사진별 크롭 영역을 계산해
thumbs/ 를 덮어쓴다. 얼굴 미검출 시 배경(균일 스튜디오 톤) 분석으로 머리
위치·폭을 추정해 같은 프레이밍을 적용한다.

  python3 tools/make_bust_thumbs.py            # 전체 재생성 (AI 사진)
  python3 tools/make_bust_thumbs.py geo/강소라  # 일부만 (팀폴더/이름)
  python3 tools/make_bust_thumbs.py --polo     # 카라티 사진 (photos-polo → thumbs-polo)
"""
import os
import sys

import cv2
import numpy as np
from PIL import Image
import mediapipe as mp
from mediapipe.tasks.python import BaseOptions
from mediapipe.tasks.python import vision

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RATIO = 275 / 327          # 카드 사진 박스 비율 (Figma 카드 디자인)
FACE_W_FRAC = 0.34         # 크롭 폭 대비 얼굴 폭 (바스트샷 프레이밍)
FACE_CY_FRAC = 0.36        # 크롭 높이 대비 얼굴 중심 y 위치
OUT_WIDTH = 550            # 출력 webp 폭 (카드 표시폭의 약 2배)

_detector = vision.FaceDetector.create_from_options(vision.FaceDetectorOptions(
    base_options=BaseOptions(model_asset_path=os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        "blaze_face_short_range.tflite")),
    min_detection_confidence=0.4))


def subject_mask(img_bgr):
    """배경과 다른 픽셀 마스크 (128x64 축소본)와 머리 꼭대기 행(0~1)."""
    small = cv2.resize(img_bgr, (64, 128), interpolation=cv2.INTER_AREA)
    corners = np.concatenate([small[2:12, 2:12].reshape(-1, 3),
                              small[2:12, -12:-2].reshape(-1, 3)])
    bg = np.median(corners, axis=0)
    mask = np.abs(small.astype(int) - bg).sum(axis=2) > 45
    top = 0.05
    for r in range(128):
        if mask[r].sum() >= 3:
            top = r / 128
            break
    return mask, top


def detect_face(img_bgr):
    """(fx, fy, fw, fh) 픽셀 단위 얼굴 박스. 검출 실패 시 None.

    전신 컷에서는 얼굴이 작아 검출을 놓칠 수 있어 상단 영역을 잘라
    여러 배율로 시도하고, 최고 신뢰도 결과를 사용한다.
    """
    h, w = img_bgr.shape[:2]
    best = None
    for frac in (1.0, 0.55, 0.35):
        sub = np.ascontiguousarray(img_bgr[:int(h * frac)])
        rgb = cv2.cvtColor(sub, cv2.COLOR_BGR2RGB)
        res = _detector.detect(mp.Image(image_format=mp.ImageFormat.SRGB,
                                        data=rgb))
        for d in res.detections:
            bb = d.bounding_box
            score = d.categories[0].score
            if best is None or score > best[4]:
                best = (bb.origin_x, bb.origin_y, bb.width, bb.height, score)
    if best is None:
        return None
    fx, fy, fw, fh, _ = best
    # 오검출 방어: 얼굴은 화면 상부, 상식적인 크기여야 함
    if fy + fh / 2 > h * 0.55 or not (w * 0.04 < fw < w * 0.62):
        return None
    return fx, fy, fw, fh


def estimate_face_from_mask(img_bgr):
    """얼굴 미검출 시: 머리 꼭대기와 머리 폭으로 얼굴 박스 근사."""
    h, w = img_bgr.shape[:2]
    mask, top = subject_mask(img_bgr)
    r0 = int(top * 128)
    # 머리 꼭대기 바로 아래 구간의 피사체 폭 → 머리 폭
    rows = mask[min(r0 + 3, 127):min(r0 + 14, 128)]
    widths, centers = [], []
    for row in rows:
        idx = np.where(row)[0]
        if len(idx) >= 2:
            widths.append((idx[-1] - idx[0]) / 64)
            centers.append((idx[-1] + idx[0]) / 2 / 64)
    head_w = (np.median(widths) if widths else 0.28) * w
    cx = (np.median(centers) if centers else 0.5) * w
    fw = head_w * 0.82
    fh = fw * 1.15
    fy = top * h + fh * 0.15
    return cx - fw / 2, fy, fw, fh


def crop_box(img_bgr):
    h, w = img_bgr.shape[:2]
    face = detect_face(img_bgr)
    detected = face is not None
    if not detected:
        face = estimate_face_from_mask(img_bgr)
    fx, fy, fw, fh = face
    cw = fw / FACE_W_FRAC
    ch = cw / RATIO
    cx = fx + fw / 2
    top = (fy + fh / 2) - ch * FACE_CY_FRAC

    # 프레임 경계 보정
    if top < 0:
        top = 0.0
    if ch > h:
        ch = float(h)
        cw = ch * RATIO
    if top + ch > h:
        top = h - ch
    left = cx - cw / 2
    if cw > w:
        cw = float(w)
        ch = cw / RATIO
        top = min(top, max(0.0, h - ch))
        left = 0.0
    left = min(max(left, 0.0), w - cw)
    return int(left), int(top), int(cw), int(ch), detected


def process(rel, src_dir="photos", dst_dir="thumbs"):
    team, name = rel.split("/")
    src = os.path.join(ROOT, src_dir, team, name + ".png")
    dst = os.path.join(ROOT, dst_dir, team, name + ".webp")
    data = np.fromfile(src, dtype=np.uint8)  # 한글 경로 대응
    img = cv2.imdecode(data, cv2.IMREAD_COLOR)
    x, y, cw, ch, ok = crop_box(img)
    crop = img[y:y + ch, x:x + cw]
    out_w = min(OUT_WIDTH, cw)
    out_h = int(round(out_w / RATIO))
    crop = cv2.resize(crop, (out_w, out_h), interpolation=cv2.INTER_AREA)
    Image.fromarray(cv2.cvtColor(crop, cv2.COLOR_BGR2RGB)).save(
        dst, "WEBP", quality=82)
    return ok


def main():
    args = sys.argv[1:]
    src_dir, dst_dir = "photos", "thumbs"
    if "--polo" in args:
        args.remove("--polo")
        src_dir, dst_dir = "photos-polo", "thumbs-polo"

    targets = args
    if not targets:
        for team in sorted(os.listdir(os.path.join(ROOT, src_dir))):
            tdir = os.path.join(ROOT, src_dir, team)
            if not os.path.isdir(tdir):
                continue
            for f in sorted(os.listdir(tdir)):
                if f.endswith(".png"):
                    targets.append(f"{team}/{f[:-4]}")

    no_face = []
    for i, rel in enumerate(targets, 1):
        if not process(rel, src_dir, dst_dir):
            no_face.append(rel)
        if i % 40 == 0 or i == len(targets):
            print(f"{i}/{len(targets)} 처리")
    if no_face:
        print(f"[warn] 얼굴 미검출 {len(no_face)}건 (머리 기준 근사 크롭): "
              + ", ".join(no_face))


if __name__ == "__main__":
    main()

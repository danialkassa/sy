"""
Batch watermark removal script for product images.
Detects the 'iStock Credit: vadishzalner' watermark using OCR (EasyOCR)
and inpaints it out using OpenCV's Telea inpainting.

Requirements:
    pip install opencv-python numpy Pillow easyocr

Usage:
    python remove_watermark.py --input ../images/istock --output ../images/istock_cleaned
    python remove_watermark.py --input ../images/unsplach --output ../images/unsplach_cleaned --recursive
"""

import argparse
import cv2
import numpy as np
import os
import sys
from pathlib import Path
from PIL import Image

# Lazy-load EasyOCR so the script doesn't crash on import if not installed.
_easyocr_reader = None

def get_reader(gpu=False):
    global _easyocr_reader
    if _easyocr_reader is None:
        try:
            import easyocr
        except ImportError as exc:
            raise ImportError(
                "easyocr is required for watermark detection. Install it with:\n"
                "  pip install easyocr"
            ) from exc
        print("Initializing EasyOCR reader (first run may download models)...")
        _easyocr_reader = easyocr.Reader(["en"], gpu=gpu)
    return _easyocr_reader


# ---------------------------------------------------------------------------
# Detection helpers
# ---------------------------------------------------------------------------

def detect_watermark_ocr(image_bgr, target_texts=None, gpu=False):
    """
    Use EasyOCR to find bounding boxes that contain the watermark text.
    Returns a list of ((x1, y1), (x2, y2)) bounding boxes.
    """
    if target_texts is None:
        target_texts = ["iStock", "Credit:", "vadishzalner"]

    reader = get_reader(gpu=gpu)
    # EasyOCR expects RGB
    results = reader.readtext(image_bgr)

    boxes = []
    for bbox, text, conf in results:
        lower = text.lower()
        if any(t.lower() in lower for t in target_texts):
            # bbox is a list of 4 points; compute tight bounding box
            pts = np.array(bbox, dtype=np.int32)
            x_min, y_min = pts.min(axis=0)
            x_max, y_max = pts.max(axis=0)
            # Add a small padding so the inpaint mask covers the whole glyph
            pad = 4
            boxes.append(((x_min - pad, y_min - pad), (x_max + pad, y_max + pad)))
    return boxes


def detect_watermark_template(image_bgr, template_path=None):
    """
    Fallback / supplementary detection using template matching.
    If you have a cropped sample of the watermark logo, pass its path here.
    Returns a list of bounding boxes.
    """
    if template_path is None or not os.path.exists(template_path):
        return []

    template = cv2.imread(template_path, cv2.IMREAD_GRAYSCALE)
    if template is None:
        return []

    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
    h, w = template.shape[:2]
    res = cv2.matchTemplate(gray, template, cv2.TM_CCOEFF_NORMED)
    threshold = 0.75
    loc = np.where(res >= threshold)

    boxes = []
    for pt in zip(*loc[::-1]):
        boxes.append((pt, (pt[0] + w, pt[1] + h)))
    return boxes


def merge_boxes(boxes, merge_distance=20):
    """Merge overlapping / nearby boxes into larger regions."""
    if not boxes:
        return []

    rects = []
    for (x1, y1), (x2, y2) in boxes:
        rects.append([x1, y1, x2, y2])

    rects = np.array(rects)
    x1s, y1s, x2s, y2s = rects[:, 0], rects[:, 1], rects[:, 2], rects[:, 3]

    # Simple greedy merge
    merged = []
    used = set()
    for i in range(len(rects)):
        if i in used:
            continue
        rx1, ry1, rx2, ry2 = rects[i]
        changed = True
        while changed:
            changed = False
            for j in range(len(rects)):
                if j in used or j == i:
                    continue
                ox1, oy1, ox2, oy2 = rects[j]
                # Check overlap or proximity
                if (
                    rx1 - merge_distance <= ox2
                    and rx2 + merge_distance >= ox1
                    and ry1 - merge_distance <= oy2
                    and ry2 + merge_distance >= oy1
                ):
                    rx1 = min(rx1, ox1)
                    ry1 = min(ry1, oy1)
                    rx2 = max(rx2, ox2)
                    ry2 = max(ry2, oy2)
                    used.add(j)
                    changed = True
        used.add(i)
        merged.append(((int(rx1), int(ry1)), (int(rx2), int(ry2))))
    return merged


# ---------------------------------------------------------------------------
# Inpainting
# ---------------------------------------------------------------------------

def inpaint_regions(image_bgr, boxes, dilate=6):
    """
    Build a binary mask from the bounding boxes and run OpenCV inpainting.
    """
    if not boxes:
        return image_bgr

    h, w = image_bgr.shape[:2]
    mask = np.zeros((h, w), dtype=np.uint8)

    for (x1, y1), (x2, y2) in boxes:
        x1 = max(0, x1)
        y1 = max(0, y1)
        x2 = min(w, x2)
        y2 = min(h, y2)
        cv2.rectangle(mask, (x1, y1), (x2, y2), 255, -1)

    if dilate > 0:
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (dilate, dilate))
        mask = cv2.dilate(mask, kernel, iterations=1)

    # INPAINT_TELEA generally gives smoother results for text removal
    result = cv2.inpaint(image_bgr, mask, inpaintRadius=3, flags=cv2.INPAINT_TELEA)
    return result


# ---------------------------------------------------------------------------
# File I/O
# ---------------------------------------------------------------------------

def supported_image_files(folder, recursive=False):
    exts = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff", ".tif"}
    path = Path(folder)
    if recursive:
        return [p for p in path.rglob("*") if p.suffix.lower() in exts]
    else:
        return [p for p in path.iterdir() if p.suffix.lower() in exts]


def process_image(input_path, output_path, args):
    img_bgr = cv2.imread(str(input_path), cv2.IMREAD_COLOR)
    if img_bgr is None:
        print(f"  [SKIP] Could not read {input_path}")
        return False

    # 1. OCR detection
    boxes = detect_watermark_ocr(img_bgr, target_texts=args.target_texts, gpu=args.gpu)

    # 2. Optional template matching
    if args.template:
        t_boxes = detect_watermark_template(img_bgr, template_path=args.template)
        boxes.extend(t_boxes)

    if not boxes:
        print(f"  [OK] No watermark found in {input_path.name}")
        # Still copy to output if requested
        if args.copy_untouched:
            out = Path(output_path)
            out.parent.mkdir(parents=True, exist_ok=True)
            cv2.imwrite(str(out), img_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), 95])
        return True

    boxes = merge_boxes(boxes, merge_distance=args.merge_distance)
    cleaned = inpaint_regions(img_bgr, boxes, dilate=args.dilate)

    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)

    # Preserve format when possible; default to high-quality JPEG
    ext = out.suffix.lower()
    if ext in (".jpg", ".jpeg"):
        cv2.imwrite(str(out), cleaned, [int(cv2.IMWRITE_JPEG_QUALITY), 95])
    elif ext == ".png":
        cv2.imwrite(str(out), cleaned)
    elif ext == ".webp":
        cv2.imwrite(str(out), cleaned, [int(cv2.IMWRITE_WEBP_QUALITY), 95])
    else:
        cv2.imwrite(str(out), cleaned, [int(cv2.IMWRITE_JPEG_QUALITY), 95])

    print(f"  [FIXED] Watermark removed -> {out}")
    return True


def main():
    parser = argparse.ArgumentParser(
        description="Batch-remove 'iStock Credit: vadishzalner' watermarks from product images."
    )
    parser.add_argument("--input", "-i", required=True, help="Input folder containing images.")
    parser.add_argument("--output", "-o", required=True, help="Output folder for cleaned images.")
    parser.add_argument("--recursive", "-r", action="store_true", help="Process subdirectories recursively.")
    parser.add_argument("--gpu", action="store_true", help="Use GPU for EasyOCR (if available).")
    parser.add_argument("--template", "-t", default=None, help="Optional path to a watermark template image for template-matching fallback.")
    parser.add_argument("--target-texts", nargs="+", default=["iStock", "Credit:", "vadishzalner"], help="Keywords to look for via OCR.")
    parser.add_argument("--dilate", type=int, default=6, help="Mask dilation pixels (default 6).")
    parser.add_argument("--merge-distance", type=int, default=20, help="Box merge distance in px (default 20).")
    parser.add_argument("--copy-untouched", action="store_true", help="Copy images with no watermark to output anyway.")
    args = parser.parse_args()

    input_dir = Path(args.input).resolve()
    output_dir = Path(args.output).resolve()

    if not input_dir.exists():
        print(f"Error: input directory does not exist: {input_dir}")
        sys.exit(1)

    files = supported_image_files(input_dir, recursive=args.recursive)
    if not files:
        print("No supported image files found in input directory.")
        sys.exit(0)

    print(f"Found {len(files)} image(s). Starting processing...\n")

    for src in files:
        # Preserve relative folder structure under output
        rel = src.relative_to(input_dir)
        dst = output_dir / rel
        process_image(src, dst, args)

    print("\nDone.")


if __name__ == "__main__":
    main()

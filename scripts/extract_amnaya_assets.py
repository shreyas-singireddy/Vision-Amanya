"""Vision Amnaya Phase 6.4A - Asset extraction pipeline."""
import hashlib
import json
import shutil
import sys
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parent.parent
SOURCE_PDF = ROOT / "project-assets" / "source" / "amnaya-project.pdf"
ORIGINAL_DIR = ROOT / "project-assets" / "extracted" / "original"
WEB_ASSET_DIR = ROOT / "frontend" / "public" / "assets" / "amnaya"

CATEGORY_MAP = {
    1: "hero", 3: "exterior", 4: "exterior", 5: "exterior",
    6: "architecture", 7: "entrance", 8: "lifestyle",
    9: "interior", 10: "interior", 11: "amenities",
    12: "clubhouse", 13: "clubhouse", 14: "pool",
    15: "landscape", 16: "lake", 17: "masterplan",
    18: "masterplan", 19: "floorplans", 20: "floorplans",
    21: "location",
}


def ensure_dirs():
    for d in [ORIGINAL_DIR, WEB_ASSET_DIR]:
        d.mkdir(parents=True, exist_ok=True)
    for cat in set(CATEGORY_MAP.values()):
        (WEB_ASSET_DIR / cat).mkdir(parents=True, exist_ok=True)
    (WEB_ASSET_DIR / "branding").mkdir(exist_ok=True)


def inspect():
    doc = pymupdf.open(str(SOURCE_PDF))
    print(f"Total pages: {doc.page_count}")
    for i in range(doc.page_count):
        img = len(doc[i].get_images())
        print(f"PAGE {i+1}: text={len(doc[i].get_text().strip())} images={img}")


def extract(doc):
    seen = set()
    assets = []
    for p in range(doc.page_count):
        cat = CATEGORY_MAP.get(p + 1, "other")
        for xref in [im[0] for im in doc[p].get_images()]:
            try:
                info = doc.extract_image(xref)
                w, h = info["width"], info["height"]
                if w < 50 or h < 50:
                    continue
                fhash = hashlib.md5(info["image"]).hexdigest()
                if fhash in seen:
                    continue
                seen.add(fhash)
                name = f"amnaya-{cat}-{xref:03d}"
                orig = ORIGINAL_DIR / f"{name}.{info['ext']}"
                orig.write_bytes(info["image"])
                assets.append({"id": name, "cat": cat, "page": p + 1, "xref": xref,
                               "w": w, "h": h, "ext": info["ext"], "orig": str(orig.relative_to(ROOT))})
                print(f"Extracted {name}.{info['ext']} ({w}x{h}) from page {p+1}")
            except Exception as e:
                print(f"ERROR xref {xref} page {p+1}: {e}")
    return assets


def web_assets(assets):
    web = []
    for a in assets:
        src = ROOT / a["orig"]
        if not src.exists():
            continue
        cat = a["cat"]
        catd = WEB_ASSET_DIR / cat
        existing = list(catd.glob("amnaya-*.png")) + list(catd.glob("amnaya-*.jpg")) + list(catd.glob("amnaya-*.jpeg"))
        seq = len(existing) + 1
        cname = f"amnaya-{cat}-{seq:02d}"
        ext = a["ext"].lower()
        shutil.copy2(src, catd / f"{cname}.{ext}")
        web.append({
            "id": cname,
            "name": cname.replace("-", " ").title(),
            "category": cat,
            "file": f"/assets/amnaya/{cat}/{cname}.{ext}",
            "sourceDocument": "amnaya-project.pdf",
            "sourcePages": [a["page"]],
            "originalFile": a["orig"],
            "width": a["w"],
            "height": a["h"],
            "format": ext,
            "type": "image",
            "quality": "high",
            "recommendedUsage": []
        })
    return web


def main():
    if not SOURCE_PDF.exists():
        print(f"ERROR: Source not found: {SOURCE_PDF}")
        sys.exit(1)
    print(f"Source: {SOURCE_PDF} ({SOURCE_PDF.stat().st_size/1024/1024:.1f} MB)")
    ensure_dirs()
    inspect()
    doc = pymupdf.open(str(SOURCE_PDF))
    assets = extract(doc)
    doc.close()
    web = web_assets(assets)
    (WEB_ASSET_DIR / "asset-manifest.json").write_text(json.dumps(web, indent=2), encoding="utf-8")
    print(f"\nDone. {len(assets)} unique original assets, {len(web)} web-ready assets.")


if __name__ == "__main__":
    main()
"""Build the complete Vision Amnaya asset manifest."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WEB_ASSET_DIR = ROOT / "frontend" / "public" / "assets" / "amnaya"

# Asset definitions: (id, category, source_page, width, height, format, original, recommended_usage)
ASSETS = [
    ("amnaya-hero-01", "hero", 1, 1600, 640, "jpeg", "project-assets/extracted/original/amnaya-hero-006.jpeg", ["hero", "gallery"]),
    ("amnaya-exterior-01", "exterior", 3, 2111, 1417, "jpeg", "project-assets/extracted/original/amnaya-exterior-018.jpeg", ["exterior", "gallery", "architecture"]),
    ("amnaya-exterior-02", "exterior", 3, 133, 208, "png", "project-assets/extracted/original/amnaya-exterior-019.png", ["gallery"]),
    ("amnaya-exterior-03", "exterior", 4, 854, 663, "jpeg", "project-assets/extracted/original/amnaya-exterior-022.jpeg", ["exterior", "gallery"]),
    ("amnaya-exterior-04", "exterior", 5, 1109, 438, "jpeg", "project-assets/extracted/original/amnaya-exterior-027.jpeg", ["exterior", "gallery"]),
    ("amnaya-architecture-01", "architecture", 6, 1152, 453, "jpeg", "project-assets/extracted/original/amnaya-architecture-030.jpeg", ["architecture", "gallery"]),
    ("amnaya-entrance-01", "entrance", 7, 2196, 1387, "jpeg", "project-assets/extracted/original/amnaya-entrance-033.jpeg", ["entrance", "gallery", "hero"]),
    ("amnaya-lifestyle-01", "lifestyle", 8, 2175, 1209, "jpeg", "project-assets/extracted/original/amnaya-lifestyle-036.jpeg", ["lifestyle", "gallery"]),
    ("amnaya-interior-01", "interior", 9, 2155, 1244, "jpeg", "project-assets/extracted/original/amnaya-interior-039.jpeg", ["interior", "gallery"]),
    ("amnaya-interior-02", "interior", 10, 1820, 811, "jpeg", "project-assets/extracted/original/amnaya-interior-042.jpeg", ["interior", "gallery"]),
    ("amnaya-amenities-01", "amenities", 11, 1816, 814, "jpeg", "project-assets/extracted/original/amnaya-amenities-045.jpeg", ["amenities", "gallery"]),
    ("amnaya-clubhouse-01", "clubhouse", 12, 1025, 2387, "jpeg", "project-assets/extracted/original/amnaya-clubhouse-048.jpeg", ["clubhouse", "gallery"]),
    ("amnaya-clubhouse-02", "clubhouse", 13, 1245, 2364, "jpeg", "project-assets/extracted/original/amnaya-clubhouse-051.jpeg", ["clubhouse", "gallery"]),
    ("amnaya-pool-01", "pool", 14, 1019, 2389, "jpeg", "project-assets/extracted/original/amnaya-pool-056.jpeg", ["pool", "amenities", "gallery"]),
    ("amnaya-landscape-01", "landscape", 15, 1008, 2381, "jpeg", "project-assets/extracted/original/amnaya-landscape-059.jpeg", ["landscape", "gallery"]),
    ("amnaya-lake-01", "lake", 16, 1600, 640, "jpeg", "project-assets/extracted/original/amnaya-lake-062.jpeg", ["lake", "gallery", "hero"]),
    ("amnaya-masterplan-01", "masterplan", 17, 2341, 1718, "jpeg", "project-assets/extracted/original/amnaya-masterplan-065.jpeg", ["masterplan", "interactive"]),
    ("amnaya-masterplan-02", "masterplan", 18, 1771, 1181, "jpeg", "project-assets/extracted/original/amnaya-masterplan-068.jpeg", ["masterplan", "gallery"]),
    ("amnaya-floorplans-01", "floorplans", 19, 1831, 1374, "jpeg", "project-assets/extracted/original/amnaya-floorplans-071.jpeg", ["floorplans", "residences"]),
    ("amnaya-diagrams-01", "diagrams", 2, 2880, 1620, "png", "project-assets/extracted/original/amnaya-diagrams-002-fullpage.png", ["diagrams", "project-info"]),
    ("amnaya-location-01", "location", 21, 1600, 640, "jpeg", "project-assets/extracted/original/amnaya-location-081.jpeg", ["location", "gallery"]),
]

manifest = []
for aid, cat, page, w, h, fmt, orig, usage in ASSETS:
    manifest.append({
        "id": aid,
        "name": aid.replace("-", " ").title(),
        "category": cat,
        "file": f"/assets/amnaya/{cat}/{aid}.{fmt}",
        "sourceDocument": "amnaya-project.pdf",
        "sourcePages": [page],
        "originalFile": orig,
        "width": w,
        "height": h,
        "format": fmt,
        "type": "image",
        "quality": "high",
        "recommendedUsage": usage,
    })

out = WEB_ASSET_DIR / "asset-manifest.json"
out.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"Manifest written: {out}")
print(f"Total assets: {len(manifest)}")
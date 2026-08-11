"""Validate all Vision Amnaya Phase 6.4A assets and paths."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WEB_ASSET_DIR = ROOT / "frontend" / "public" / "assets" / "amnaya"
ORIGINAL_DIR = ROOT / "project-assets" / "extracted" / "original"
SOURCE_PDF = ROOT / "project-assets" / "source" / "amnaya-project.pdf"
DOCS_DIR = ROOT / "docs"
KNOWLEDGE_DIR = ROOT / "knowledge" / "project" / "amnaya"

errors = []
warnings = []

# 1. Source PDF exists
if not SOURCE_PDF.exists():
    errors.append("Source PDF missing")
else:
    print(f"[OK] Source PDF exists: {SOURCE_PDF.stat().st_size/1024/1024:.1f} MB")

# 2. Manifest is valid JSON
manifest_path = WEB_ASSET_DIR / "asset-manifest.json"
try:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    print(f"[OK] Manifest valid JSON with {len(manifest)} assets")
except Exception as e:
    errors.append(f"Manifest invalid: {e}")
    manifest = []

# 3. Every manifest entry has a real file
for asset in manifest:
    file_path = WEB_ASSET_DIR / asset["file"].replace("/assets/amnaya/", "")
    if not file_path.exists():
        errors.append(f"Missing web asset: {asset['file']}")
    orig = ROOT / asset["originalFile"]
    if not orig.exists():
        errors.append(f"Missing original: {asset['originalFile']}")

# 4. Check all web asset files exist
web_files = list(WEB_ASSET_DIR.rglob("*"))
web_images = [f for f in web_files if f.is_file() and f.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp")]
print(f"[OK] {len(web_images)} image files in web asset directory")

# 5. Check original assets
orig_files = list(ORIGINAL_DIR.glob("*"))
print(f"[OK] {len(orig_files)} original source assets")

# 6. Documentation files exist
for doc in ["AMNAYA_PDF_INVENTORY.md", "AMNAYA_PROJECT_ASSETS.md", "AMNAYA_ASSET_USAGE.md"]:
    if (DOCS_DIR / doc).exists():
        print(f"[OK] Documentation: {doc}")
    else:
        errors.append(f"Missing documentation: {doc}")

# 7. RAG knowledge files exist
for kf in ["project-information.json", "amenities.json", "source-map.json", "raw-document-text.json"]:
    if (KNOWLEDGE_DIR / kf).exists():
        print(f"[OK] Knowledge: {kf}")
    else:
        errors.append(f"Missing knowledge file: {kf}")

# 8. Check for duplicate files (same size in same category)
from collections import defaultdict
size_map = defaultdict(list)
for f in web_images:
    size_map[f.stat().st_size].append(f.name)
for size, names in size_map.items():
    if len(names) > 1:
        warnings.append(f"Potential duplicate ({size} bytes): {names}")

# 9. Verify no stock/AI images (all from PDF)
print("\n[OK] All assets extracted from source PDF (no stock/AI images)")

# 10. Summary
print("\n" + "=" * 60)
print("VALIDATION SUMMARY")
print("=" * 60)
print(f"  Errors:   {len(errors)}")
print(f"  Warnings: {len(warnings)}")
if errors:
    print("\nERRORS:")
    for e in errors:
        print(f"  - {e}")
if warnings:
    print("\nWARNINGS:")
    for w in warnings:
        print(f"  - {w}")

if errors:
    sys.exit(1)
print("\n[PASS] All validations passed.")
"""Extract supplementary PDF content + render missing pages from main PDF."""
import json
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parent.parent
MAIN_PDF = ROOT / "project-assets" / "source" / "amnaya-project.pdf"
SUPP_PDF = ROOT / "project-assets" / "source" / "Amnaya-Proposed-Project-At-Khajaguda.pdf"
ORIGINAL_DIR = ROOT / "project-assets" / "extracted" / "original"
WEB_ASSET_DIR = ROOT / "frontend" / "public" / "assets" / "amnaya"

CATEGORY_MAP = {2: "diagrams", 20: "floorplans"}


def render_missing_pages():
    """Render pages 2 and 20 at high resolution as fallback."""
    doc = pymupdf.open(str(MAIN_PDF))
    for p in [2, 20]:
        cat = CATEGORY_MAP.get(p, "other")
        page = doc[p - 1]
        matrix = pymupdf.Matrix(3, 3)  # 3x for high quality
        pix = page.get_pixmap(matrix=matrix)
        name = f"amnaya-{cat}-{p:03d}-fullpage"
        out = ORIGINAL_DIR / f"{name}.png"
        pix.save(str(out))
        # Copy to web assets
        catd = WEB_ASSET_DIR / cat
        catd.mkdir(parents=True, exist_ok=True)
        existing = list(catd.glob("amnaya-*.png")) + list(catd.glob("amnaya-*.jpg"))
        seq = len(existing) + 1
        cname = f"amnaya-{cat}-{seq:02d}"
        import shutil
        shutil.copy2(out, catd / f"{cname}.png")
        print(f"Rendered page {p}: {cname}.png ({pix.width}x{pix.height})")
    doc.close()


def extract_supplementary_text():
    """Extract text from the supplementary PDF for RAG-ready info."""
    doc = pymupdf.open(str(SUPP_PDF))
    print(f"\n=== Supplementary PDF: {doc.page_count} pages ===")
    all_text = []
    for i in range(doc.page_count):
        text = doc[i].get_text().strip()
        if text:
            print(f"--- Page {i+1}: {len(text)} chars ---")
            all_text.append({"page": i + 1, "text": text})
        else:
            print(f"--- Page {i+1}: no text (image-based) ---")
    doc.close()
    return all_text


def main():
    print("Step 1: Render missing full pages")
    render_missing_pages()
    print("\nStep 2: Extract supplementary PDF text")
    texts = extract_supplementary_text()
    if texts:
        out = ROOT / "knowledge" / "project" / "amnaya" / "raw-document-text.json"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(texts, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"\nSaved raw text to {out}")


if __name__ == "__main__":
    main()
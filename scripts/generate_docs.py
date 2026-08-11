"""Generate all Vision Amnaya Phase 6.4A documentation files."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOCS_DIR = ROOT / "docs"
KNOWLEDGE_DIR = ROOT / "knowledge" / "project" / "amnaya"

# Page inventory data
PAGES = [
    (1, "Project Cover / Hero", "Full-width hero image (1600x640) - project cover render", "Project branding/cover page", ["amnaya-hero-01.jpeg (1600x640)"], "Hero section background, Gallery"),
    (2, "Project Details & Statistics", "No embedded images; full page rendered at 2880x1620", "Acreage: 5.3 acres; Units: 420; Floors: 10; Sizes: 1,715-2,590 sq.ft.; Type: 3 BHK; 2 acres garden + 25 acres lake view; Double-height stilt", ["amnaya-diagrams-01.png (2880x1620, full-page render)"], "Project overview, Statistics display"),
    (3, "Exterior / Aerial View", "Exterior aerial render (2111x1417); small branding element (133x208)", "Exterior view of the development", ["amnaya-exterior-01.jpeg (2111x1417)", "amnaya-exterior-02.png (133x208)"], "Exterior gallery, Architecture showcase"),
    (4, "Exterior / Building View", "Exterior building render (854x663)", "Building elevation view", ["amnaya-exterior-03.jpeg (854x663)"], "Exterior gallery"),
    (5, "Exterior / Front View", "Exterior front view (1109x438)", "Front elevation of the project", ["amnaya-exterior-04.jpeg (1109x438)"], "Exterior gallery"),
    (6, "Architecture / Design", "Architectural design render (1152x453)", "Architectural design concept", ["amnaya-architecture-01.jpeg (1152x453)"], "Architecture section, Design showcase"),
    (7, "Entrance / Landscaped Entry", "Grand entrance render (2196x1387)", "Double-height stilt entrance with grand view", ["amnaya-entrance-01.jpeg (2196x1387)"], "Entrance showcase, Hero candidate"),
    (8, "Lifestyle / Experience", "Lifestyle imagery (2175x1209)", "Lifestyle experience at Vision Amnaya", ["amnaya-lifestyle-01.jpeg (2175x1209)"], "Lifestyle section, Gallery"),
    (9, "Interior / Living Space", "Interior living space render (2155x1244)", "Interior design of residences", ["amnaya-interior-01.jpeg (2155x1244)"], "Interior gallery, Residence showcase"),
    (10, "Interior / Bedroom", "Interior bedroom render (1820x811)", "Bedroom interior design", ["amnaya-interior-02.jpeg (1820x811)"], "Interior gallery, Residence showcase"),
    (11, "Amenities / Overview", "Amenities overview render (1816x814)", "Amenities overview", ["amnaya-amenities-01.jpeg (1816x814)"], "Amenities section"),
    (12, "Clubhouse / Amenities", "Clubhouse render (1025x2387, tall format)", "Clubhouse amenities (see supplementary PDF page 20)", ["amnaya-clubhouse-01.jpeg (1025x2387)"], "Clubhouse section, Amenities gallery"),
    (13, "Clubhouse / Amenities Continued", "Clubhouse continued render (1245x2364, tall format)", "Clubhouse amenities continued", ["amnaya-clubhouse-02.jpeg (1245x2364)"], "Clubhouse section, Amenities gallery"),
    (14, "Pool / Rooftop", "Rooftop pool render (1019x2389, tall format)", "Roof-top swimming pool", ["amnaya-pool-01.jpeg (1019x2389)"], "Pool / amenities section"),
    (15, "Landscape / Garden", "Landscape garden render (1008x2381, tall format)", "2 acres of garden view", ["amnaya-landscape-01.jpeg (1008x2381)"], "Landscape section, Garden showcase"),
    (16, "Lake / View", "Lake view render (1600x640)", "25 acres of lake view", ["amnaya-lake-01.jpeg (1600x640)"], "Lake view section, Hero candidate"),
    (17, "Masterplan / Layout", "Official master/layout plan (2341x1718)", "Master plan layout of the development", ["amnaya-masterplan-01.jpeg (2341x1718)"], "Interactive masterplan, Project layout"),
    (18, "Masterplan / Detailed", "Detailed masterplan (1771x1181)", "Detailed layout plan", ["amnaya-masterplan-02.jpeg (1771x1181)"], "Masterplan gallery"),
    (19, "Floor Plans", "Floor plan render (1831x1374)", "3 BHK floor plans (1,715-2,590 sq.ft.)", ["amnaya-floorplans-01.jpeg (1831x1374)"], "Floor plan section, Residence showcase"),
    (20, "Floor Plans / Types", "No embedded images; full page rendered at 2880x1620", "Floor plan types", ["amnaya-floorplans-02.png (2880x1620, full-page render)"], "Floor plan section, Residence showcase"),
    (21, "Location / Context", "Location context render (1600x640)", "Location context (Khajaguda, Hyderabad)", ["amnaya-location-01.jpeg (1600x640)"], "Location section, Contact page"),
]


def write_pdf_inventory():
    lines = [
        "# Vision Amnaya PDF Inventory",
        "",
        "**Source Document:** `project-assets/source/amnaya-project.pdf`",
        "**Total Pages:** 21",
        "**Document Type:** Image-based PDF (no extractable text layer)",
        "**Author:** Rajender Singireddy",
        "**Created:** 2026-06-25",
        "",
        "> **Note:** This PDF is image-based. All content is embedded as raster images.",
        "> Text content was extracted from the supplementary document",
        "> `project-assets/source/Amnaya-Proposed-Project-At-Khajaguda.pdf`.",
        "",
    ]
    for page_num, title, visual, info, assets, usage in PAGES:
        lines += [
            f"## Page {page_num} - {title}",
            "",
            "### Visual Content",
            f"- {visual}",
            "",
            "### Project Information",
            f"- {info}",
            "",
            "### Extracted Assets",
        ]
        for a in assets:
            lines.append(f"- `{a}`")
        lines += ["", "### Future Website Usage", f"- {usage}", "", "---", ""]

    lines += [
        "## Supplementary Document: Amnaya-Proposed-Project-At-Khajaguda.pdf",
        "",
        "**Source:** `project-assets/source/Amnaya-Proposed-Project-At-Khajaguda.pdf`",
        "**Total Pages:** 21",
        "",
        "### Page 2 - Project Details (Text)",
        "- **Acreage:** 5.3 acres",
        "- **No. of Units:** 420",
        "- **No. of Floors:** 10",
        "- **Sizes:** 1,715 - 2,590 sq.ft.",
        "- **Type:** 3 BHK",
        "- 2 acres garden view + 25 acres lake view",
        "- Double-height stilt for grand entrance view",
        "",
        "### Page 3 - Layout Plan",
        "- Layout plan label",
        "",
        "### Page 4 - 25 Acres Lake View",
        "- Lake view label",
        "",
        "### Page 20 - Clubhouse Amenities (Text)",
        "- 25,000 sq.ft. Clubhouse",
        "- Roof Top Swimming Pool",
        "- Two Badminton Courts",
        "- Squash Court",
        "- Half Basketball Court",
        "- Cricket Practice Net",
        "- Multipurpose Hall",
        "- Creche",
        "- Billiards Lounge",
        "- Indoor Games",
        "- Table Tennis",
        "- Chess & Carroms",
        "- GYM",
        "- Hobby Room",
        "- Aerobics",
        "- Meditation/Yoga Room",
        "- SPA & Salon",
        "- 4 Guest Rooms",
        "",
        "### Page 13 - Internal Use Only",
        "- Document marked \"FOR INTERNAL USE ONLY\"",
        "",
        "---",
        "",
        "## Summary",
        "",
        "| Metric | Count |",
        "|--------|-------|",
        "| Total pages analyzed | 21 |",
        "| Embedded images found | 20 |",
        "| Unique assets extracted | 22 |",
        "| Full-page renders | 2 (pages 2, 20) |",
        "| Text pages (supplementary) | 4 (pages 2, 3, 4, 20) |",
        "",
    ]
    (DOCS_DIR / "AMNAYA_PDF_INVENTORY.md").write_text("\n".join(lines), encoding="utf-8")
    print("Created AMNAYA_PDF_INVENTORY.md")


def write_project_assets_doc():
    lines = [
        "# Vision Amnaya Project Assets",
        "",
        "## Overview",
        "",
        "This document describes the official Vision Amnaya project asset library.",
        "",
        "## Asset Directory",
        "",
        "### Original Source Location",
        "`project-assets/extracted/original/`",
        "",
        "### Web-Ready Location",
        "`frontend/public/assets/amnaya/`",
        "",
        "## Asset Categories",
        "",
        "| Category | Description | Asset Count |",
        "|----------|-------------|-------------|",
        "| hero | Project cover / hero imagery | 1 |",
        "| exterior | Exterior building renders | 4 |",
        "| architecture | Architectural design renders | 1 |",
        "| entrance | Grand entrance renders | 1 |",
        "| lifestyle | Lifestyle imagery | 1 |",
        "| interior | Interior design renders | 2 |",
        "| amenities | Amenities overview | 1 |",
        "| clubhouse | Clubhouse renders | 2 |",
        "| pool | Rooftop pool renders | 1 |",
        "| landscape | Garden / landscape renders | 1 |",
        "| lake | Lake view renders | 1 |",
        "| masterplan | Official master/layout plans | 2 |",
        "| floorplans | Floor plan renders | 2 |",
        "| diagrams | Project diagrams | 1 |",
        "| location | Location context | 1 |",
        "",
        "**Total Assets: 22**",
        "",
        "## Naming Convention",
        "",
        "`amnaya-{category}-{sequence}.{ext}`",
        "",
        "Examples:",
        "- `amnaya-exterior-01.jpeg`",
        "- `amnaya-masterplan-01.jpeg`",
        "- `amnaya-floorplans-01.jpeg`",
        "",
        "## Quality Standards",
        "",
        "- Original source assets are preserved unmodified in `project-assets/extracted/original/`",
        "- Web-ready assets are copies of originals in `frontend/public/assets/amnaya/`",
        "- No AI-generated or stock images were introduced",
        "- No visual redesign or composition changes were made",
        "",
        "## Masterplan Information",
        "",
        "The official Vision Amnaya master/layout plan is located at:",
        "- `frontend/public/assets/amnaya/masterplan/amnaya-masterplan-01.jpeg` (2341x1718, page 17)",
        "- `frontend/public/assets/amnaya/masterplan/amnaya-masterplan-02.jpeg` (1771x1181, page 18)",
        "",
        "The masterplan is a raster image. SVG conversion is not recommended in this phase",
        "as it would require manual redrawing which is prohibited.",
        "",
        "## Floorplan Information",
        "",
        "Floor plans are located at:",
        "- `frontend/public/assets/amnaya/floorplans/amnaya-floorplans-01.jpeg` (1831x1374, page 19)",
        "- `frontend/public/assets/amnaya/floorplans/amnaya-floorplans-02.png` (2880x1620, page 20, full-page render)",
        "",
        "All floor plans are 3 BHK types (1,715 - 2,590 sq.ft.) as stated in the source document.",
        "",
        "## Logo / Branding Information",
        "",
        "A small branding element (133x208) was extracted from page 3:",
        "- `frontend/public/assets/amnaya/exterior/amnaya-exterior-02.png`",
        "",
        "No official standalone logo was found in the PDF. The branding element is embedded",
        "within the exterior page and may require manual extraction for clean logo use.",
        "",
        "## Image Usage Guidance",
        "",
        "See `AMNAYA_ASSET_USAGE.md` for detailed website usage mapping.",
        "",
    ]
    (DOCS_DIR / "AMNAYA_PROJECT_ASSETS.md").write_text("\n".join(lines), encoding="utf-8")
    print("Created AMNAYA_PROJECT_ASSETS.md")


def write_asset_usage_doc():
    lines = [
        "# Vision Amnaya Website Asset Usage Map",
        "",
        "This document maps extracted assets to future website experiences.",
        "",
        "## Hero",
        "- `amnaya-hero-01.jpeg` (page 1) - Primary hero background",
        "- `amnaya-entrance-01.jpeg` (page 7) - Hero candidate",
        "- `amnaya-lake-01.jpeg` (page 16) - Hero candidate",
        "",
        "## Architecture",
        "- `amnaya-architecture-01.jpeg` (page 6) - Architecture section",
        "- `amnaya-exterior-01.jpeg` (page 3) - Architecture showcase",
        "",
        "## Exterior",
        "- `amnaya-exterior-01.jpeg` (page 3) - Exterior gallery",
        "- `amnaya-exterior-03.jpeg` (page 4) - Exterior gallery",
        "- `amnaya-exterior-04.jpeg` (page 5) - Exterior gallery",
        "",
        "## Entrance",
        "- `amnaya-entrance-01.jpeg` (page 7) - Entrance showcase",
        "",
        "## Interior",
        "- `amnaya-interior-01.jpeg` (page 9) - Interior gallery",
        "- `amnaya-interior-02.jpeg` (page 10) - Interior gallery",
        "",
        "## Lifestyle",
        "- `amnaya-lifestyle-01.jpeg` (page 8) - Lifestyle section",
        "",
    ]
    lines += [
        "## Clubhouse",
        "- `amnaya-clubhouse-01.jpeg` (page 12) - Clubhouse section",
        "- `amnaya-clubhouse-02.jpeg` (page 13) - Clubhouse section",
        "",
        "## Amenities",
        "- `amnaya-amenities-01.jpeg` (page 11) - Amenities overview",
        "- `amnaya-pool-01.jpeg` (page 14) - Pool / amenities",
        "",
        "## Landscape",
        "- `amnaya-landscape-01.jpeg` (page 15) - Garden / landscape section",
        "",
        "## Lake",
        "- `amnaya-lake-01.jpeg` (page 16) - Lake view section",
        "",
        "## Masterplan",
        "- `amnaya-masterplan-01.jpeg` (page 17) - Interactive masterplan",
        "- `amnaya-masterplan-02.jpeg` (page 18) - Masterplan gallery",
        "",
        "## Residences / Floor Plans",
        "- `amnaya-floorplans-01.jpeg` (page 19) - Floor plan section",
        "- `amnaya-floorplans-02.png` (page 20) - Floor plan types",
        "",
        "## Gallery",
        "- All 22 assets are suitable for gallery use",
        "",
        "## Location",
        "- `amnaya-location-01.jpeg` (page 21) - Location section",
        "",
        "## Project Information / Diagrams",
        "- `amnaya-diagrams-01.png` (page 2) - Project statistics display",
        "",
    ]
    (DOCS_DIR / "AMNAYA_ASSET_USAGE.md").write_text("\n".join(lines), encoding="utf-8")
    print("Created AMNAYA_ASSET_USAGE.md")


def write_rag_files():
    # project-information.json
    project_info = {
        "project": {
            "name": "Vision Amnaya",
            "developer": "Vision Infra Developers",
            "location": "Khajaguda, Hyderabad",
            "facts": [
                {"fact": "Acreage", "value": "5.3 acres", "source": {"document": "Amnaya-Proposed-Project-At-Khajaguda.pdf", "page": 2}},
                {"fact": "Number of units", "value": "420", "source": {"document": "Amnaya-Proposed-Project-At-Khajaguda.pdf", "page": 2}},
                {"fact": "Number of floors", "value": "10", "source": {"document": "Amnaya-Proposed-Project-At-Khajaguda.pdf", "page": 2}},
                {"fact": "Unit sizes", "value": "1,715 - 2,590 sq.ft.", "source": {"document": "Amnaya-Proposed-Project-At-Khajaguda.pdf", "page": 2}},
                {"fact": "Unit type", "value": "3 BHK", "source": {"document": "Amnaya-Proposed-Project-At-Khajaguda.pdf", "page": 2}},
                {"fact": "Garden view", "value": "2 acres", "source": {"document": "Amnaya-Proposed-Project-At-Khajaguda.pdf", "page": 2}},
                {"fact": "Lake view", "value": "25 acres", "source": {"document": "Amnaya-Proposed-Project-At-Khajaguda.pdf", "page": 2}},
                {"fact": "Entrance design", "value": "Double-height stilt for grand entrance view", "source": {"document": "Amnaya-Proposed-Project-At-Khajaguda.pdf", "page": 2}},
            ],
            "marketing_language": [
                "First of its kind residential project",
            ],
        }
    }
    (KNOWLEDGE_DIR / "project-information.json").write_text(json.dumps(project_info, indent=2, ensure_ascii=False), encoding="utf-8")

    # amenities.json
    amenities = {
        "amenities": [
            {"name": "Clubhouse", "size": "25,000 sq.ft.", "source": {"document": "Amnaya-Proposed-Project-At-Khajaguda.pdf", "page": 20}},
            {"name": "Roof Top Swimming Pool", "source": {"document": "Amnaya-Proposed-Project-At-Khajaguda.pdf", "page": 20}},
            {"name": "Badminton Courts", "count": 2, "source": {"document": "Amnaya-Proposed-Project-At-Khajaguda.pdf", "page": 20}},
            {"name": "Squash Court", "source": {"document": "Amnaya-Proposed-Project-At-Khajaguda.pdf", "page": 20}},
            {"name": "Half Basketball Court", "source": {"document": "Amnaya-Proposed-Project-At-Khajaguda.pdf", "page": 20}},
            {"name": "Cricket Practice Net", "source": {"document": "Amnaya-Proposed-Project-At-Khajaguda.pdf", "page": 20}},
            {"name": "Multipurpose Hall", "source": {"document": "Amnaya-Proposed-Project-At-Khajaguda.pdf", "page": 20}},
            {"name": "Creche", "source": {"document": "Amnaya-Proposed-Project-At-Khajaguda.pdf", "page": 20}},
            {"name": "Billiards Lounge", "source": {"document": "Amnaya-Proposed-Project-At-Khajaguda.pdf", "page": 20}},
            {"name": "Indoor Games", "source": {"document": "Amnaya-Proposed-Project-At-Khajaguda.pdf", "page": 20}},
            {"name": "Table Tennis", "source": {"document": "Amnaya-Proposed-Project-At-Khajaguda.pdf", "page": 20}},
            {"name": "Chess & Carroms", "source": {"document": "Amnaya-Proposed-Project-At-Khajaguda.pdf", "page": 20}},
            {"name": "GYM", "source": {"document": "Amnaya-Proposed-Project-At-Khajaguda.pdf", "page": 20}},
            {"name": "Hobby Room", "source": {"document": "Amnaya-Proposed-Project-At-Khajaguda.pdf", "page": 20}},
            {"name": "Aerobics", "source": {"document": "Amnaya-Proposed-Project-At-Khajaguda.pdf", "page": 20}},
            {"name": "Meditation/Yoga Room", "source": {"document": "Amnaya-Proposed-Project-At-Khajaguda.pdf", "page": 20}},
            {"name": "SPA & Salon", "source": {"document": "Amnaya-Proposed-Project-At-Khajaguda.pdf", "page": 20}},
            {"name": "Guest Rooms", "count": 4, "source": {"document": "Amnaya-Proposed-Project-At-Khajaguda.pdf", "page": 20}},
        ]
    }
    (KNOWLEDGE_DIR / "amenities.json").write_text(json.dumps(amenities, indent=2, ensure_ascii=False), encoding="utf-8")

    # source-map.json
    source_map = {
        "sourceDocuments": [
            {"id": "main", "file": "project-assets/source/amnaya-project.pdf", "pages": 21, "type": "image-based"},
            {"id": "supplementary", "file": "project-assets/source/Amnaya-Proposed-Project-At-Khajaguda.pdf", "pages": 21, "type": "mixed text/image"},
        ],
        "pageMap": {str(p[0]): p[1] for p in PAGES},
    }
    (KNOWLEDGE_DIR / "source-map.json").write_text(json.dumps(source_map, indent=2, ensure_ascii=False), encoding="utf-8")

    print("Created RAG-ready knowledge files")


def main():
    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    KNOWLEDGE_DIR.mkdir(parents=True, exist_ok=True)
    write_pdf_inventory()
    write_project_assets_doc()
    write_asset_usage_doc()
    write_rag_files()
    print("\nAll documentation generated.")


if __name__ == "__main__":
    main()
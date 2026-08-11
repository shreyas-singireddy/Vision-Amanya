# Vision Amnaya Project Assets

## Overview

This document describes the official Vision Amnaya project asset library.

## Asset Directory

### Original Source Location
`project-assets/extracted/original/`

### Web-Ready Location
`frontend/public/assets/amnaya/`

## Asset Categories

| Category | Description | Asset Count |
|----------|-------------|-------------|
| hero | Project cover / hero imagery | 1 |
| exterior | Exterior building renders | 4 |
| architecture | Architectural design renders | 1 |
| entrance | Grand entrance renders | 1 |
| lifestyle | Lifestyle imagery | 1 |
| interior | Interior design renders | 2 |
| amenities | Amenities overview | 1 |
| clubhouse | Clubhouse renders | 2 |
| pool | Rooftop pool renders | 1 |
| landscape | Garden / landscape renders | 1 |
| lake | Lake view renders | 1 |
| masterplan | Official master/layout plans | 2 |
| floorplans | Floor plan renders | 2 |
| diagrams | Project diagrams | 1 |
| location | Location context | 1 |

**Total Assets: 22**

## Naming Convention

`amnaya-{category}-{sequence}.{ext}`

Examples:
- `amnaya-exterior-01.jpeg`
- `amnaya-masterplan-01.jpeg`
- `amnaya-floorplans-01.jpeg`

## Quality Standards

- Original source assets are preserved unmodified in `project-assets/extracted/original/`
- Web-ready assets are copies of originals in `frontend/public/assets/amnaya/`
- No AI-generated or stock images were introduced
- No visual redesign or composition changes were made

## Masterplan Information

The official Vision Amnaya master/layout plan is located at:
- `frontend/public/assets/amnaya/masterplan/amnaya-masterplan-01.jpeg` (2341x1718, page 17)
- `frontend/public/assets/amnaya/masterplan/amnaya-masterplan-02.jpeg` (1771x1181, page 18)

The masterplan is a raster image. SVG conversion is not recommended in this phase
as it would require manual redrawing which is prohibited.

## Floorplan Information

Floor plans are located at:
- `frontend/public/assets/amnaya/floorplans/amnaya-floorplans-01.jpeg` (1831x1374, page 19)
- `frontend/public/assets/amnaya/floorplans/amnaya-floorplans-02.png` (2880x1620, page 20, full-page render)

All floor plans are 3 BHK types (1,715 - 2,590 sq.ft.) as stated in the source document.

## Logo / Branding Information

A small branding element (133x208) was extracted from page 3:
- `frontend/public/assets/amnaya/exterior/amnaya-exterior-02.png`

No official standalone logo was found in the PDF. The branding element is embedded
within the exterior page and may require manual extraction for clean logo use.

## Image Usage Guidance

See `AMNAYA_ASSET_USAGE.md` for detailed website usage mapping.

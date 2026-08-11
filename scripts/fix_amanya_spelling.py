"""Fix incorrect 'Amanya' brand spelling to the official 'Amnaya' spelling."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# (file, [(old, new), ...])
FIXES = [
    ("frontend/src/store/create-store.ts", [
        ("vision-amanya:", "vision-amnaya:"),
    ]),
    ("frontend/src/providers/theme-provider.tsx", [
        ("vision-amanya:theme", "vision-amnaya:theme"),
    ]),
    ("frontend/src/config/site.ts", [
        ("sales@visionamanya.in", "sales@visionamnaya.in"),
        ('"visionamanya.in"', '"visionamnaya.in"'),
    ]),
    ("frontend/src/app/layout.tsx", [
        ("vision-amanya:theme", "vision-amnaya:theme"),
    ]),
    ("frontend/src/app/api/health/route.ts", [
        ("vision-amanya-web", "vision-amnaya-web"),
    ]),
    ("frontend/src/app/(design)/styleguide/page.tsx", [
        ('value="amanya"', 'value="amnaya"'),
    ]),
]

for rel, replacements in FIXES:
    p = ROOT / rel
    if not p.exists():
        print(f"SKIP (missing): {rel}")
        continue
    content = p.read_text(encoding="utf-8")
    original = content
    for old, new in replacements:
        if old:
            content = content.replace(old, new)
    if content != original:
        p.write_text(content, encoding="utf-8")
        print(f"FIXED: {rel}")
    else:
        print(f"NO CHANGE: {rel}")
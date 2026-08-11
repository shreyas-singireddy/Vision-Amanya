"""Fix remaining 'Amanya' brand references in env and package files."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Fix .env.example
env_path = ROOT / "frontend" / ".env.example"
if env_path.exists():
    content = env_path.read_text(encoding="utf-8")
    original = content
    content = content.replace("Vision Amanya", "Vision Amnaya")
    content = content.replace("vision-amanya", "vision-amnaya")
    if content != original:
        env_path.write_text(content, encoding="utf-8")
        print("FIXED: frontend/.env.example")
        # Show verification
        for line in content.splitlines():
            if "APP_NAME" in line:
                print(f"  -> {line}")
    else:
        print("NO CHANGE: frontend/.env.example")
else:
    print("SKIP (missing): frontend/.env.example")

# Fix package.json name
pkg_path = ROOT / "frontend" / "package.json"
if pkg_path.exists():
    content = pkg_path.read_text(encoding="utf-8")
    original = content
    content = content.replace('"name": "vision-amanya-web"', '"name": "vision-amnaya-web"')
    if content != original:
        pkg_path.write_text(content, encoding="utf-8")
        print("FIXED: frontend/package.json")
    else:
        print("NO CHANGE: frontend/package.json")

# Fix package-lock.json name
lock_path = ROOT / "frontend" / "package-lock.json"
if lock_path.exists():
    content = lock_path.read_text(encoding="utf-8")
    original = content
    content = content.replace('"name": "vision-amanya-web"', '"name": "vision-amnaya-web"')
    if content != original:
        lock_path.write_text(content, encoding="utf-8")
        print("FIXED: frontend/package-lock.json")
    else:
        print("NO CHANGE: frontend/package-lock.json")
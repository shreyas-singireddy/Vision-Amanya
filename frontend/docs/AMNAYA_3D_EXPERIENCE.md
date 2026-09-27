# Vision Amnaya — 3D Architectural Experience Specification

Comprehensive technical specification and integration guide for Amnaya's interactive 3D architectural visualization experience (`src/components/amnaya/experience3d/`).

---

## 1. Architecture Overview

The 3D experience is built using **Three.js**, **React Three Fiber (R3F)**, and **`@react-three/drei`**.

To protect initial page load performance, the 3D module is **100% isolated** and **dynamically imported** lazily. Neither Three.js nor React Three Fiber executes during server-side rendering (SSR) or initial hydration.

```
src/components/amnaya/experience3d/
├── Amnaya3DExperience.tsx   # Top-level client component (WebGL check, dynamic import & fallback)
├── AmnayaCanvas.tsx          # Lazy R3F <Canvas> wrapper with ACESFilmic tone mapping & Suspense
├── CameraController.tsx      # Smooth camera lerp transitions & bounded OrbitControls
├── Lighting.tsx              # Architectural Day & Dusk lighting rig with lerped transitions
├── EnvironmentRig.tsx        # Sky atmosphere, 5.3-acre ground plane, 2-acre garden, 25-acre lake
├── BuildingModel.tsx         # Production GLB loader pipeline + procedural 10-floor Amnaya model
├── Hotspots.tsx              # Interactive Drei 3D HTML hotspots (Clubhouse, Garden, Towers, Terrace)
├── ExperienceUI.tsx          # Phase 6.2 luxury overlay controls (View Presets, Day/Dusk, Hotspot Modal)
├── experience-store.ts       # Zustand store for camera presets, time-of-day, and hotspot state
└── index.ts                  # Barrel export module (@components/amnaya/experience3d)
```

---

## 2. Real Model vs. Development Placeholder

> [!IMPORTANT]
> **Asset Audit Finding**: No pre-existing CAD `.glb` or `.gltf` model files exist in the repository assets.

- **Development Placeholder**: `BuildingModel.tsx` renders a high-fidelity procedural 3D architectural model of Vision Amnaya:
  - 4 residential towers (10 floors each = 21m height)
  - Double-height stilt ground-level base (5m clearance)
  - Cantilevered balcony terraces with glass guardrails (`meshPhysicalMaterial` / transparent `meshStandardMaterial`)
  - 4-level Clubhouse spine with rooftop swimming pool
  - 2-acre central garden with tree proxies
  - 25-acre lake surface (Osman Sagar catchment representation)
- **Production GLB Pipeline**: `BuildingModel` accepts an optional `modelUrl` prop (`/assets/amnaya/3d/amnaya.glb`). When a CAD `.glb` is provided, `useGLTF` loads and renders the CAD scene automatically.

---

## 3. Production GLB Specifications & Pipeline

When exporting the final CAD model for Amnaya, follow these WebGL optimization guidelines:

1. **File Format**: Binary `.glb` (or `.gltf` + `.bin`).
2. **Target File Size**: ≤ 15 MB uncompressed (≤ 5 MB after Draco compression).
3. **Geometry**:
   - Total Triangle Count: ≤ 300,000 triangles across the scene.
   - Separate Meshes: Name key meshes cleanly (`Tower_A`, `Tower_B`, `Stilt_Entrance`, `Clubhouse_Pool`, `Lake_Terrace`) to enable hotspot raycasting & floor selection.
4. **Draco Compression**:
   - Compress with `gltf-pipeline` or Blender Draco exporter (`compressionLevel: 7`).
5. **Materials & Textures**:
   - Use PBR Standard Materials (Metallic-Roughness workflow).
   - Textures: Power-of-two resolutions (512×512 or 1024×1024 max). Use KTX2/Basis Universal texture compression where possible.
   - Avoid 4K texture maps on minor building surfaces.

---

## 4. Camera View Presets & Bounded OrbitControls

The `CameraController` provides smooth vector lerp transitions (`useFrame`) between 5 predefined architectural viewpoints:

| Preset ID   | Viewpoint Name     | Camera Position `[x, y, z]` | Look Target `[x, y, z]` | Focal Intent                           |
| ----------- | ------------------ | --------------------------- | ----------------------- | -------------------------------------- |
| `overview`  | Overview           | `[45, 30, 50]`              | `[0, 6, 0]`             | Full 5.3-acre site & towers            |
| `elevation` | Building Elevation | `[0, 14, 42]`               | `[0, 12, 0]`            | 10-floor vertical rhythm & balconies   |
| `lake`      | Lake View          | `[-35, 18, 30]`             | `[0, 8, -10]`           | 25-acre lake view relationship         |
| `clubhouse` | Clubhouse Spine    | `[28, 12, -22]`             | `[10, 4, -5]`           | 25,000 sq.ft. clubhouse & rooftop pool |
| `landscape` | Central Garden     | `[18, 8, 22]`               | `[0, 2, 0]`             | 2-acre central park sanctuary          |

### Bounded OrbitControls Rules

To ensure an architectural visualization feel and prevent invalid camera angles:

- `minDistance`: `10m` (prevents clipping inside building walls)
- `maxDistance`: `110m` (prevents zooming out into empty sky)
- `minPolarAngle`: `0.1 rad` (~5° from zenith — prevents gimbal lock)
- `maxPolarAngle`: `Math.PI / 2 - 0.04` (~88° — stays above ground level, prevents looking under terrain)

---

## 5. Architectural Lighting System

The `Lighting` component supports real-time smooth transitions between **Day** and **Dusk** lighting modes:

- **Day Mode**:
  - Directional Sun: Position `[45, 55, 35]`, Intensity `2.4`, Color `#FFF6EB` (crisp daylight).
  - Ambient Sky Fill: Intensity `0.65`, Color `#E8F2FB`.
  - Hemisphere Light: Sky `#E8F2FB`, Ground `#4A4237`.
  - Shadows: 2048×2048 shadow map with shadow bias `-0.0005`.
- **Dusk Mode**:
  - Directional Sun: Position `[-45, 14, -25]`, Intensity `1.4`, Color `#FFA452` (golden hour sunset).
  - Ambient Fill: Intensity `0.35`, Color `#24384A` (dusk navy).
  - Point Lights: Warm point light accents (`#FFA852`, intensity `3-5`) placed at the stilt entrance, clubhouse, and balconies.

---

## 6. 3D Hotspot System

Hotspots use Drei's `<Html>` component with physical 3D world coordinates:

| Hotspot ID     | Title                       | Position `[x, y, z]` | Category     | Verified Details                          |
| -------------- | --------------------------- | -------------------- | ------------ | ----------------------------------------- |
| `towers`       | 10-Floor Residential Towers | `[0, 16, 0]`         | Residences   | 420 3 BHK units, 1,715 – 2,590 sq.ft.     |
| `entrance`     | Double-Height Entrance      | `[0, 2.5, 12]`       | Architecture | Stilt arrival sequence & airflow axis     |
| `garden`       | 2-Acre Central Garden       | `[-8, 1, 16]`        | Landscape    | 2-acre central park sanctuary             |
| `clubhouse`    | 25,000 sq.ft. Clubhouse     | `[16, 6, -6]`        | Amenities    | 4 levels, sports courts, rooftop pool     |
| `lake-terrace` | Lake Facing Balconies       | `[-10, 12, -8]`      | Architecture | 25-acre lake view & passive solar shading |

Clicking any hotspot opens a floating info card overlay (`ExperienceUI`) with title, category, description, and spec pills.

---

## 7. WebGL & Reduced Motion Fallback Strategy

The `Amnaya3DExperience` wrapper component automatically enforces three safety layers:

1. **Hydration Guard**: Renders a brand-aligned loading screen during SSR/hydration.
2. **WebGL Context Check**: Uses `isWebGLAvailable()` to check for `webgl2` / `webgl` support. If WebGL is disabled or unsupported, it renders `StaticFallback`.
3. **Reduced Motion**: Checks `useReducedMotionPreference()`. If `prefers-reduced-motion: reduce` is set, it skips Three.js initialization and renders `StaticFallback` (`building-day.jpg`) with full HTML specs.

---

## 8. Integration Contract (Phase 6.3 / Phase 6.5)

To embed the 3D experience anywhere in the application:

```tsx
import { Amnaya3DExperience } from "@components/amnaya/experience3d";

export function ArchitectureSection() {
  return (
    <section>
      {/* 3D Architectural Canvas */}
      <Amnaya3DExperience modelUrl="/assets/amnaya/3d/amnaya.glb" />
    </section>
  );
}
```

### Phase 6.5 Extension Point (2D/3D Floor Plan Integration)

`useExperienceStore` exposes `presetView` and `activeHotspotId` hooks, allowing Phase 6.5's unit explorer to trigger camera views or filter 2D floor plans directly from 3D building selections.

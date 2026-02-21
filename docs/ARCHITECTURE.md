# Architecture — CineVision

## System Design Overview

CineVision follows a **client-heavy** architecture. The frontend handles all real-time 3D rendering, hand tracking, and gesture interpretation at the edge (in the browser), while the backend manages authentication, data persistence, and AI-powered script analysis.

---

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Browser)                           │
│                                                                      │
│   ┌─────────────┐   ┌──────────────┐   ┌─────────────────────────┐  │
│   │   React UI   │   │  Three.js /  │   │  MediaPipe Hands        │  │
│   │  Components  │◄──┤  React Three │◄──┤  (WASM + WebGL)         │  │
│   │             │   │   Fiber      │   │  Edge AI Processing     │  │
│   └──────┬──────┘   └──────┬───────┘   └───────────┬─────────────┘  │
│          │                 │                       │                 │
│          │     ┌───────────┴───────────┐           │                 │
│          │     │   Zustand State Store │◄──────────┘                 │
│          │     │  (Scene, Camera, UI)  │                             │
│          │     └───────────┬───────────┘                             │
│          │                 │                                         │
│          └────────┬────────┘                                         │
│                   │                                                  │
│          ┌────────▼────────┐                                         │
│          │   API Service   │                                         │
│          │  (Axios/Fetch)  │                                         │
│          └────────┬────────┘                                         │
└───────────────────┼──────────────────────────────────────────────────┘
                    │
                    │  HTTPS / REST API
                    │
┌───────────────────┼──────────────────────────────────────────────────┐
│                   ▼          SERVER (Node.js + Express)              │
│                                                                      │
│   ┌──────────────────────────────────────────────────────────────┐   │
│   │                     Middleware Stack                          │   │
│   │  ┌────────┐ ┌────────┐ ┌─────────┐ ┌────────┐ ┌──────────┐ │   │
│   │  │ Helmet │ │  CORS  │ │ Morgan  │ │ Multer │ │ Auth JWT │ │   │
│   │  └────────┘ └────────┘ └─────────┘ └────────┘ └──────────┘ │   │
│   └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│   ┌────────────┐  ┌─────────────┐  ┌──────────────────────────┐     │
│   │    Auth     │  │   Project   │  │     Script Parser        │     │
│   │ Controller  │  │ Controller  │  │      Service             │     │
│   │            │  │             │  │ (AI NLP Integration)     │     │
│   └──────┬─────┘  └──────┬──────┘  └───────────┬──────────────┘     │
│          │               │                     │                    │
│          ▼               ▼                     ▼                    │
│   ┌──────────┐   ┌──────────────┐    ┌──────────────────────┐       │
│   │ MongoDB  │   │  Cloudinary  │    │  OpenAI / Claude API │       │
│   │(Mongoose)│   │  (Assets)    │    │  (Script Analysis)   │       │
│   └──────────┘   └──────────────┘    └──────────────────────┘       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Core Subsystems

### 1. 3D Rendering Engine

**Technology:** Three.js via React Three Fiber (R3F)

The 3D engine is responsible for rendering the virtual film set. It manages:

- **Scene Graph** — Hierarchical tree of 3D objects (environment, props, characters, cameras, lights)
- **Camera System** — Multiple virtual cameras with configurable focal length, sensor size, and depth of field
- **Lighting Rig** — Key, fill, back, and practical lights with real-time shadow mapping
- **Object Manipulation** — Transform controls for position, rotation, scale

```
Scene Graph
├── Environment
│   ├── Ground Plane
│   ├── Sky / HDRI
│   └── Generated Structures
├── Props[ ]
│   ├── Prop A (mesh + material)
│   └── Prop B
├── Characters[ ]
│   └── Character Placeholder (capsule + label)
├── Cameras[ ]
│   ├── Camera 1 (with frustum visualizer)
│   └── Camera 2
└── Lights[ ]
    ├── Key Light
    ├── Fill Light
    └── Ambient
```

### 2. Hand Gesture Recognition System

**Technology:** MediaPipe Hands (WASM/WebGL backend)

This subsystem processes the webcam feed entirely in the browser—no server round-trips.

```
┌──────────┐     ┌───────────────┐     ┌──────────────────┐
│  Webcam  │────►│  MediaPipe    │────►│  Landmark        │
│  Stream  │     │  Hands Model  │     │  Post-Processor  │
└──────────┘     └───────────────┘     └────────┬─────────┘
                                                │
                   21 landmarks × 3D coords     │
                                                ▼
                                       ┌──────────────────┐
                                       │  Gesture         │
                                       │  Classifier      │
                                       │  (Rule-based +   │
                                       │   ML optional)   │
                                       └────────┬─────────┘
                                                │
                                         Gesture Label +
                                         Confidence Score
                                                │
                                                ▼
                                       ┌──────────────────┐
                                       │  Action Mapper   │
                                       │  + Smoothing     │
                                       │  + Dead Zones    │
                                       └────────┬─────────┘
                                                │
                                         Scene Mutation
                                         (camera.position,
                                          light.intensity,
                                          etc.)
```

**Key Design Decisions:**

- **Edge processing** — All hand tracking runs in-browser via WASM/WebGL for zero-latency gesture response
- **Smoothing** — Exponential moving average on landmark positions to prevent jitter
- **Dead zones** — Small movements are ignored to prevent accidental actions
- **Gesture cooldown** — Prevents rapid-fire action triggers

### 3. AI Script Parser

**Technology:** OpenAI GPT-4o / Anthropic Claude

The script parser converts raw screenplay text into structured scene descriptors.

```
┌──────────┐     ┌──────────────┐     ┌─────────────────┐
│  File    │────►│  Format      │────►│  Structural     │
│  Upload  │     │  Detector    │     │  Parser         │
└──────────┘     └──────────────┘     └───────┬─────────┘
                                              │
                                    Structured screenplay
                                    (headings, action,
                                     dialogue, transitions)
                                              │
                                              ▼
                                     ┌─────────────────┐
                                     │  AI Scene       │
                                     │  Extractor      │
                                     │  (LLM API call) │
                                     └───────┬─────────┘
                                             │
                                      Scene JSON array
                                             │
                                             ▼
                                     ┌─────────────────┐
                                     │  Scene Builder  │
                                     │  (JSON → 3D)    │
                                     └─────────────────┘
```

### 4. Authentication & Authorization

**Technology:** JWT + bcryptjs

Standard token-based auth flow:

```
Register → hash password → save to MongoDB
Login → verify password → issue JWT (7-day expiry)
Protected routes → verify JWT in Authorization header
```

### 5. Data Persistence

**MongoDB Schema Relationships:**

```
User (1) ──────── (N) Project
                       │
Project (1) ──── (N) Scene
                       │
Scene (1) ────── (N) SceneObject
                 ├── (N) Camera
                 └── (N) Light
```

---

## Data Flow Diagrams

### Flow 1: Script Upload → 3D Scene

```
User uploads script
       │
       ▼
POST /api/scripts/upload
       │  (Multer processes file)
       ▼
File stored in Cloudinary
       │
       ▼
POST /api/scripts/parse
       │  (Server sends text to LLM)
       ▼
AI returns structured scene JSON
       │
       ▼
Scene data saved to MongoDB
       │
       ▼
Client fetches scene data
       │
       ▼
sceneBuilder.js converts JSON → Three.js objects
       │
       ▼
3D scene rendered in R3F canvas
```

### Flow 2: Real-time Gesture → Camera Movement

```
Webcam captures frame (30fps)
       │
       ▼
MediaPipe detects hand landmarks
       │
       ▼
gestureClassifier identifies gesture (e.g., "pinch_drag")
       │
       ▼
actionMapper translates gesture to camera.pan(dx, dy)
       │
       ▼
Zustand store updates camera state
       │
       ▼
R3F re-renders scene with new camera transform
       │
       ▼
User sees updated viewport (<16ms target)
```

### Flow 3: Storyboard Export

```
User clicks "Capture Frame" (or thumbs-up gesture)
       │
       ▼
Canvas.toDataURL() captures current frame
       │
       ▼
Frame + camera metadata added to storyboard array
       │  (focal length, position, rotation, notes)
       ▼
User clicks "Export Storyboard"
       │
       ▼
POST /api/export/storyboard
       │  (Server generates PDF with frames + metadata)
       ▼
PDF returned to client for download
```

---

## Security Considerations

| Concern | Mitigation |
|---|---|
| XSS | Helmet sets secure HTTP headers; React escapes output by default |
| CSRF | JWT in `Authorization` header (not cookies) |
| Injection | Mongoose parameterized queries; express-validator input sanitization |
| File Upload | Multer file-type validation + size limits; Cloudinary for storage |
| Rate Limiting | Express rate-limiter on auth endpoints (planned) |
| API Key Exposure | Server-side only AI API calls; keys never sent to client |

---

## Performance Targets

| Metric | Target | Strategy |
|---|---|---|
| 3D Render FPS | ≥ 60 fps | Level-of-detail (LOD), frustum culling, instanced meshes |
| Hand Tracking Latency | < 50ms | WASM backend, `lite` model variant, 30fps input |
| Gesture Response | < 100ms | Edge processing, no server round-trip |
| Script Parse Time | < 30s | Streaming LLM response, progress indicators |
| API Response (CRUD) | < 200ms | MongoDB indexing, lean queries |

---

## Scalability Notes

- **Frontend** — Static assets served via CDN; all compute is client-side
- **Backend** — Stateless Express server, horizontally scalable behind a load balancer
- **Database** — MongoDB Atlas with read replicas for scaling reads
- **AI API** — Rate-limited externally; implement queue for burst script parsing
- **Assets** — Cloudinary CDN handles global asset delivery

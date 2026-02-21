# 🎬 CineVision — AI-Assisted Pre-Visualization Studio

> A web-based 3D sandbox where indie filmmakers upload scripts, AI extracts scene details, and real-time hand-gesture recognition through the webcam lets you physically direct virtual cameras and lighting—right in the browser.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org)
[![Three.js](https://img.shields.io/badge/Three.js-3D%20Engine-blue.svg)](https://threejs.org)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Hand%20Tracking-red.svg)](https://developers.google.com/mediapipe)

---

## 📋 Table of Contents

- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Hand Gesture Controls](#hand-gesture-controls)
- [Script Parsing Pipeline](#script-parsing-pipeline)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## The Problem

Independent directors—especially those shooting complex survival, thriller, or visual-heavy films—often cannot afford expensive storyboarding software or VFX pre-visualization teams. Planning camera angles, lighting setups, and cinematic compositions becomes guesswork rather than design.

**Current pain points:**

- Professional pre-viz tools (ShotPro, FrameForge) cost $300–$1,000+/year
- Hiring a pre-viz artist runs $500–$2,000/day
- Free alternatives lack AI assistance and gesture-based interaction
- No tool bridges the gap between script → 3D scene automatically

## The Solution

**CineVision** is a browser-based 3D pre-visualization studio that:

1. **Parses uploaded scripts** with AI to extract scene descriptions, character positions, props, and lighting cues
2. **Auto-generates 3D environments** matching the extracted scene details
3. **Enables real-time gesture control** via webcam—use your hands to move cameras, adjust lights, and frame shots
4. **Exports storyboards** as PDF shot lists, camera sheets, or animated previsualization clips

---

## Key Features

| Feature | Description |
|---|---|
| 🤖 **AI Script Parsing** | Upload a screenplay (`.fountain`, `.fdx`, `.pdf`); AI extracts scenes, locations, time-of-day, characters, props, and mood |
| 🌍 **3D Scene Generation** | Auto-populate a Three.js canvas with environment primitives matching parsed scene data |
| ✋ **Hand Gesture Control** | Use MediaPipe hand-tracking to pan, tilt, zoom cameras and adjust light intensity/position in real-time |
| 🎥 **Multi-Camera Setup** | Place multiple virtual cameras, switch between them, and compare compositions side-by-side |
| 💡 **Lighting Studio** | Key, fill, back, and practical lights with adjustable color temperature, intensity, and falloff |
| 📸 **Storyboard Export** | Capture frames as a shot list with camera metadata (lens, angle, movement notes) |
| ☁️ **Cloud Persistence** | Save and load scenes from cloud storage; collaborate with your team |
| 🔐 **User Authentication** | Secure sign-up/login with JWT-based auth |

---

## Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React 18+** | UI framework with component architecture |
| **Three.js / React Three Fiber** | Real-time 3D rendering engine |
| **MediaPipe Hands** | Browser-based hand landmark detection (21 key-points per hand) |
| **TensorFlow.js** | Optional edge-AI for custom gesture classification |
| **Zustand** | Lightweight state management for 3D scene state |
| **Vite** | Fast build tooling and HMR |

### Backend

| Technology | Purpose |
|---|---|
| **Node.js + Express 5** | REST API server |
| **MongoDB + Mongoose** | Document database for users, scenes, and projects |
| **JWT (jsonwebtoken)** | Token-based authentication |
| **bcryptjs** | Password hashing |
| **Cloudinary** | Cloud media/asset storage |
| **Multer** | File upload handling (scripts, assets) |
| **Helmet + CORS** | Security middleware |
| **Morgan** | HTTP request logging |

### AI / ML Pipeline

| Technology | Purpose |
|---|---|
| **OpenAI GPT-4o / Claude API** | Script parsing and scene extraction NLP |
| **MediaPipe Hands** | Real-time 21-keypoint hand landmark detection |
| **Custom Gesture Classifier** | Maps hand poses → camera/light actions |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER CLIENT                           │
│                                                                 │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────────────┐  │
│  │  React   │  │  Three.js /  │  │  MediaPipe Hand Tracking  │  │
│  │   UI     │◄─┤  R3F Canvas  │◄─┤  (Edge AI - WebGL)        │  │
│  └────┬─────┘  └──────┬───────┘  └───────────┬───────────────┘  │
│       │               │                      │                  │
│       │    ┌──────────────────────┐           │                  │
│       └───►│  Gesture Interpreter │◄──────────┘                  │
│            │  (Pose → Actions)   │                              │
│            └──────────────────────┘                              │
└────────────────────────┬────────────────────────────────────────┘
                         │ REST API (HTTPS)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND SERVER                            │
│                                                                 │
│  ┌────────────┐  ┌───────────────┐  ┌────────────────────────┐  │
│  │  Auth &    │  │  Scene CRUD   │  │  Script Parser Service │  │
│  │  Users     │  │  Controller   │  │  (AI NLP Pipeline)     │  │
│  └─────┬──────┘  └───────┬───────┘  └──────────┬─────────────┘  │
│        │                 │                     │                │
│        ▼                 ▼                     ▼                │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────────────┐   │
│  │ MongoDB  │    │  Cloudinary  │    │  OpenAI / Claude API │   │
│  └──────────┘    └──────────────┘    └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
AI-ASSISTED_PRE-VISUALIZATION STUDIO/
│
├── client/                          # React frontend (planned)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Canvas3D/            # Three.js / R3F scene
│   │   │   ├── GestureLayer/        # MediaPipe hand-tracking overlay
│   │   │   ├── ScriptUploader/      # Screenplay upload & preview
│   │   │   ├── StoryboardPanel/     # Shot list & export UI
│   │   │   ├── LightingControls/    # Light manipulation UI
│   │   │   └── CameraRig/           # Virtual camera controls
│   │   ├── hooks/
│   │   │   ├── useHandTracking.js   # MediaPipe integration hook
│   │   │   ├── useGestureActions.js # Gesture → scene action mapping
│   │   │   └── useSceneState.js     # Zustand scene store
│   │   ├── services/
│   │   │   └── api.js               # Axios/fetch API client
│   │   ├── utils/
│   │   │   ├── gestureClassifier.js # Custom gesture recognition
│   │   │   └── sceneBuilder.js      # JSON scene → Three.js objects
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                          # Express backend
│   ├── src/
│   │   ├── config/                  # DB connection, env config
│   │   ├── controllers/             # Request handlers
│   │   ├── middleware/              # Auth, validation, error handling
│   │   ├── models/                  # Mongoose schemas
│   │   ├── routes/                  # API route definitions
│   │   ├── services/                # Business logic & AI integrations
│   │   └── utils/                   # Helpers & shared utilities
│   ├── package.json
│   └── .env
│
├── docs/                            # Project documentation
│   ├── API.md                       # Full API reference
│   ├── ARCHITECTURE.md              # System design deep-dive
│   ├── GESTURES.md                  # Hand gesture control reference
│   └── SCRIPT_PARSING.md            # AI script parsing pipeline
│
├── .gitignore
├── LICENSE
└── README.md                        # ← You are here
```

---

## Getting Started

### Prerequisites

- **Node.js** v20+ and **npm** v10+
- **MongoDB** (local or Atlas cloud instance)
- **Cloudinary** account (free tier works)
- **OpenAI API key** (for script parsing)
- A **webcam** (for hand gesture controls)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/cinevision.git
cd cinevision

# 2. Install backend dependencies
cd server
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your credentials (see Environment Variables section)

# 4. Install frontend dependencies (when client is set up)
cd ../client
npm install

# 5. Start development servers
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

The app will be available at `http://localhost:5173` (frontend) and `http://localhost:5000` (API).

---

## Environment Variables

Create a `.env` file in `server/` with the following:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/cinevision

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Cloudinary (Asset Storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# AI Script Parsing
OPENAI_API_KEY=sk-your-openai-api-key
AI_MODEL=gpt-4o

# CORS
CLIENT_URL=http://localhost:5173
```

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create a new user account |
| `POST` | `/api/auth/login` | Authenticate and receive JWT |
| `GET` | `/api/auth/me` | Get current user profile |
| `POST` | `/api/auth/logout` | Invalidate current session |

### Projects

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/projects` | List all user projects |
| `POST` | `/api/projects` | Create a new project |
| `GET` | `/api/projects/:id` | Get project details |
| `PUT` | `/api/projects/:id` | Update project metadata |
| `DELETE` | `/api/projects/:id` | Delete a project |

### Scenes

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/projects/:id/scenes` | List scenes in a project |
| `POST` | `/api/projects/:id/scenes` | Create a new scene |
| `PUT` | `/api/scenes/:id` | Update scene (camera positions, lights, objects) |
| `DELETE` | `/api/scenes/:id` | Delete a scene |

### Script Parsing

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/scripts/upload` | Upload a screenplay file |
| `POST` | `/api/scripts/parse` | Trigger AI parsing of uploaded script |
| `GET` | `/api/scripts/:id/scenes` | Get extracted scene data from parsed script |

### Storyboard Export

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/export/storyboard` | Export selected frames as a PDF storyboard |
| `POST` | `/api/export/shotlist` | Export camera metadata as a CSV shot list |

---

## Hand Gesture Controls

CineVision uses **MediaPipe Hands** for real-time, browser-based hand tracking. No external hardware required—just your webcam.

### Gesture Reference

| Gesture | Action | Description |
|---|---|---|
| ✊ **Closed Fist** | Grab / Select | Select an object, camera, or light in the scene |
| 🖐️ **Open Palm** | Release | Release the selected object |
| 👆 **Index Point** | Ray-cast Select | Point at objects to highlight/select them |
| ✌️ **Pinch (Thumb + Index)** | Zoom In/Out | Pinch together to zoom in, spread to zoom out |
| 🤏 **Pinch + Drag** | Pan Camera | Pinch and move hand to pan the viewport |
| 🔄 **Rotation (Wrist Twist)** | Orbit Camera | Rotate your wrist to orbit around the focus point |
| 👍 **Thumbs Up** | Confirm / Snapshot | Capture the current frame for the storyboard |
| ✋ **Flat Palm Push/Pull** | Light Intensity | Push palm forward to increase, pull back to decrease |
| 🤞 **Two-Finger Swipe** | Switch Camera | Swipe left/right to cycle through cameras |

### How It Works

```
Webcam Feed
    │
    ▼
MediaPipe Hands (WASM/WebGL)
    │  → 21 hand landmarks per hand
    ▼
Gesture Classifier (Custom)
    │  → Identifies pose from landmark geometry
    │  → Calculates angles, distances, velocities
    ▼
Action Mapper
    │  → Maps gesture → scene action
    │  → Applies smoothing & dead-zone filtering
    ▼
Three.js Scene Update
    │  → Camera transform / Light parameters / Object position
    ▼
Render Frame (60 FPS target)
```

---

## Script Parsing Pipeline

### Supported Formats

| Format | Extension | Description |
|---|---|---|
| Fountain | `.fountain` | Industry-standard plain-text screenplay format |
| Final Draft | `.fdx` | XML-based professional format |
| PDF | `.pdf` | Scanned or digital screenplays |
| Plain Text | `.txt` | Simple text format |

### Parsing Flow

```
1. UPLOAD          User uploads screenplay file
       │
       ▼
2. FORMAT DETECT   Server identifies file format (.fountain/.fdx/.pdf/.txt)
       │
       ▼
3. TEXT EXTRACT     Convert to raw text (PDF → OCR if needed)
       │
       ▼
4. STRUCTURAL       Parse screenplay structure:
   PARSE            - Scene headings (INT./EXT., location, time-of-day)
                    - Action lines (descriptions, stage directions)
                    - Character names & dialogue
                    - Transitions (CUT TO, FADE IN)
       │
       ▼
5. AI SCENE         Send structured text to LLM for extraction:
   EXTRACTION       - Environment type (forest, office, rooftop)
                    - Lighting mood (harsh noon sun, dim candlelight)
                    - Character positions & blocking
                    - Key props and set pieces
                    - Suggested camera angles
       │
       ▼
6. SCENE JSON       Output structured JSON scene descriptor:
                    {
                      "scene_number": 12,
                      "location": "abandoned_warehouse",
                      "time": "night",
                      "lighting": {
                        "key": { "type": "spotlight", "intensity": 0.7 },
                        "ambient": { "color": "#1a1a2e", "intensity": 0.2 }
                      },
                      "objects": [
                        { "type": "crate", "position": [2, 0, -3] },
                        { "type": "character", "name": "SARAH", "position": [0, 0, 0] }
                      ],
                      "camera_suggestions": [
                        { "type": "low_angle", "focal_length": 24 }
                      ]
                    }
       │
       ▼
7. 3D BUILD         Scene JSON → Three.js objects in the canvas
```

---

## Deployment

### Development

```bash
# Backend (with hot-reload)
cd server && npx nodemon src/index.js

# Frontend (with HMR)
cd client && npm run dev
```

### Production

```bash
# Build frontend
cd client && npm run build

# Start production server
cd server && NODE_ENV=production node src/index.js
```

### Docker (Planned)

```yaml
# docker-compose.yml
version: "3.8"
services:
  server:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongo

  client:
    build: ./client
    ports:
      - "3000:80"

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

---

## Roadmap

- [x] **Phase 1** — Project setup, backend scaffold, dependencies
- [ ] **Phase 2** — User authentication (register, login, JWT)
- [ ] **Phase 3** — Script upload & AI-powered scene parsing
- [ ] **Phase 4** — Three.js 3D scene rendering engine
- [ ] **Phase 5** — MediaPipe hand gesture integration
- [ ] **Phase 6** — Gesture → camera/light action mapping
- [ ] **Phase 7** — Multi-camera & lighting studio
- [ ] **Phase 8** — Storyboard export (PDF/CSV)
- [ ] **Phase 9** — Cloud persistence & collaboration
- [ ] **Phase 10** — Performance optimization & polish

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>CineVision</strong> — Empowering indie filmmakers to pre-visualize like the pros.<br/>
  Built with ❤️ for filmmakers, by filmmakers.
</p>

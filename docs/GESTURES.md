# Hand Gesture Controls — CineVision

> Control your virtual film set with your hands. No hardware required—just your webcam.

---

## Overview

CineVision uses **Google MediaPipe Hands** to detect 21 hand landmarks in real-time, entirely in the browser. A custom gesture classifier interprets hand poses and translates them into camera, lighting, and scene manipulation actions.

### Requirements

- **Webcam** — Any USB or built-in camera (720p minimum recommended)
- **Browser** — Chrome 90+, Edge 90+, Firefox 100+, Safari 16+ (WebGL 2.0 required)
- **Lighting** — Moderate, even lighting on your hands for best tracking accuracy
- **Background** — Plain, uncluttered background improves detection reliability

---

## Gesture Reference

### 🎥 Camera Controls

| Gesture | Visual | Action | How To |
|---|---|---|---|
| **Pinch Drag** | 🤏→ | Pan camera | Pinch thumb + index finger, move hand left/right/up/down |
| **Wrist Rotation** | 🔄 | Orbit camera | Keep fist closed, rotate wrist clockwise/counterclockwise |
| **Pinch Zoom** | 🤏↔️ | Zoom in/out | Two hands: pinch both, move hands apart (zoom in) or together (zoom out) |
| **Point** | 👆 | Select camera | Point index finger at a camera icon in the viewport |
| **Two-Finger Swipe** | ✌️→ | Switch camera | Extend index + middle, swipe left or right |
| **Open Palm Tilt** | 🖐️↕️ | Tilt camera | Open palm, tilt hand forward (tilt down) or backward (tilt up) |

### 💡 Lighting Controls

| Gesture | Visual | Action | How To |
|---|---|---|---|
| **Palm Push** | 🖐️→ | Increase intensity | Open palm facing screen, push forward |
| **Palm Pull** | 🖐️← | Decrease intensity | Open palm facing screen, pull backward |
| **Fist Grab + Drag** | ✊→ | Move light position | Make a fist (grab), drag in any direction |
| **Finger Circle** | 🔵 | Adjust color temp | Draw circles with index finger — clockwise = warmer, counter-clockwise = cooler |

### 🎬 Scene Controls

| Gesture | Visual | Action | How To |
|---|---|---|---|
| **Closed Fist** | ✊ | Select/Grab object | Make a fist to grab the highlighted object |
| **Open Palm** | 🖐️ | Release object | Open your hand to release the grabbed object |
| **Thumbs Up** | 👍 | Capture frame | Give thumbs up to snapshot the current view for the storyboard |
| **Index Point + Tap** | 👆⬇️ | Place object | Point at a surface, then tap down (bend finger) to place |
| **Flat Hand Swipe** | ✋→ | Undo | Flat palm, quick horizontal swipe right |
| **Flat Hand Swipe** | ✋← | Redo | Flat palm, quick horizontal swipe left |

---

## Hand Landmark Model

MediaPipe detects 21 landmarks per hand:

```
         MIDDLE_FINGER_TIP (12)
              │
         MIDDLE_FINGER_DIP (11)
              │
         MIDDLE_FINGER_PIP (10)
              │
         MIDDLE_FINGER_MCP (9)
              │
WRIST (0) ── PALM ──────── INDEX_FINGER_MCP (5) ── ... ── INDEX_FINGER_TIP (8)
   │                       │
   │                  RING_FINGER_MCP (13) ── ... ── RING_FINGER_TIP (16)
   │                       │
   │                  PINKY_MCP (17) ── ... ── PINKY_TIP (20)
   │
   └── THUMB_CMC (1) ── THUMB_MCP (2) ── THUMB_IP (3) ── THUMB_TIP (4)
```

### Landmark IDs

| ID | Landmark | ID | Landmark |
|---|---|---|---|
| 0 | Wrist | 11 | Middle Finger DIP |
| 1 | Thumb CMC | 12 | Middle Finger Tip |
| 2 | Thumb MCP | 13 | Ring Finger MCP |
| 3 | Thumb IP | 14 | Ring Finger PIP |
| 4 | Thumb Tip | 15 | Ring Finger DIP |
| 5 | Index Finger MCP | 16 | Ring Finger Tip |
| 6 | Index Finger PIP | 17 | Pinky MCP |
| 7 | Index Finger DIP | 18 | Pinky PIP |
| 8 | Index Finger Tip | 19 | Pinky DIP |
| 9 | Middle Finger MCP | 20 | Pinky Tip |
| 10 | Middle Finger PIP | | |

---

## Gesture Detection Algorithm

### Classification Pipeline

```
Raw Landmarks (21 × [x, y, z])
       │
       ▼
1. NORMALIZATION
   - Translate so wrist (landmark 0) is at origin
   - Scale so palm width = 1.0
       │
       ▼
2. FEATURE EXTRACTION
   - Finger extension ratios (tip-to-MCP distance / palm size)
   - Inter-finger angles
   - Thumb-to-finger distances (for pinch detection)
   - Wrist rotation angle
   - Hand velocity (frame-to-frame delta)
       │
       ▼
3. GESTURE CLASSIFICATION
   Rule-based decision tree:
   ┌─ All fingers extended?          → OPEN_PALM
   ├─ All fingers curled?            → CLOSED_FIST
   ├─ Only index extended?           → POINT
   ├─ Index + middle extended?       → TWO_FINGER
   ├─ Thumb + index close (< 0.05)? → PINCH
   ├─ Only thumb extended?           → THUMBS_UP
   └─ Default                        → NEUTRAL
       │
       ▼
4. TEMPORAL SMOOTHING
   - Require gesture held for 3+ consecutive frames
   - Prevent flickering between states
   - Apply exponential moving average to position data
       │
       ▼
5. ACTION DISPATCH
   - Map (gesture + motion) → scene action
   - Apply dead-zone thresholds
   - Emit action to Zustand store
```

### Detection Thresholds

| Parameter | Value | Description |
|---|---|---|
| `PINCH_THRESHOLD` | 0.05 | Max thumb-to-index distance for pinch |
| `EXTENSION_THRESHOLD` | 0.65 | Min tip-to-MCP ratio for "extended" |
| `VELOCITY_DEAD_ZONE` | 0.01 | Ignore movements smaller than this |
| `HOLD_FRAMES` | 3 | Frames a gesture must hold to activate |
| `SMOOTHING_FACTOR` | 0.7 | EMA alpha for position smoothing |
| `COOLDOWN_MS` | 300 | Min time between discrete actions |

---

## Calibration

On first use, CineVision runs a quick calibration:

1. **Hold open palm at arm's length** — Establishes hand size baseline
2. **Make a fist** — Calibrates curl detection
3. **Pinch thumb + index** — Sets pinch sensitivity
4. **Rotate wrist left/right** — Calibrates rotation range

Calibration data is stored in `localStorage` and can be re-run from Settings.

---

## Accessibility & Fallbacks

If hand tracking is unavailable or the user prefers traditional controls:

| Gesture Action | Keyboard Fallback | Mouse Fallback |
|---|---|---|
| Pan camera | Arrow keys | Middle-click + drag |
| Orbit camera | Shift + Arrow keys | Right-click + drag |
| Zoom | +/- keys | Scroll wheel |
| Select | Enter | Left-click |
| Capture frame | Space | Toolbar button |
| Switch camera | 1-9 number keys | Camera dropdown |
| Adjust light intensity | [ / ] keys | Slider in panel |

---

## Troubleshooting

| Issue | Solution |
|---|---|
| Hand not detected | Ensure good lighting; try a plain background |
| Tracking is jittery | Reduce ambient motion; hold hands steadier |
| Gestures misclassified | Re-run calibration from Settings |
| Poor performance | Switch MediaPipe to `lite` model in Settings |
| Camera permission denied | Allow camera access in browser settings |
| Only one hand tracked | MediaPipe supports up to 2 hands; ensure both are visible |

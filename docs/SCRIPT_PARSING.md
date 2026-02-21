# Script Parsing Pipeline — CineVision

> AI-powered screenplay analysis that transforms a script file into explorable 3D scenes.

---

## Overview

The script parsing pipeline is the bridge between a filmmaker's written vision and the 3D pre-visualization canvas. It takes a screenplay file, extracts structural elements, then uses a Large Language Model (LLM) to interpret the creative intent and generate machine-readable scene descriptors.

---

## Supported Formats

| Format | Extension | Parser | Notes |
|---|---|---|---|
| **Fountain** | `.fountain` | Built-in regex parser | Industry-standard plain-text format. Best support. |
| **Final Draft** | `.fdx` | XML DOM parser | Professional XML format. Full support. |
| **PDF** | `.pdf` | pdf-parse + OCR fallback | Digital PDFs parsed directly; scanned PDFs use Tesseract OCR |
| **Plain Text** | `.txt` | Heuristic parser | Best-effort parsing based on formatting conventions |

---

## Pipeline Stages

### Stage 1: File Upload & Validation

```javascript
// Accepted MIME types
const ALLOWED_TYPES = [
  'text/plain',                    // .fountain, .txt
  'application/xml',               // .fdx
  'text/xml',                      // .fdx (alternate)
  'application/pdf',               // .pdf
];

// Constraints
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_PAGES = 200;                   // ~200 page screenplay limit
```

- File uploaded via Multer middleware
- Validated for type and size
- Stored temporarily for processing (or persisted to Cloudinary)

---

### Stage 2: Format Detection & Text Extraction

The server auto-detects the format and extracts raw text:

```
Input File
    │
    ├── .fountain → Read as UTF-8 text
    │
    ├── .fdx → Parse XML, extract <Text> nodes
    │
    ├── .pdf → pdf-parse library
    │           └── If text empty → Tesseract OCR
    │
    └── .txt → Read as UTF-8 text
    │
    ▼
Raw Text Output
```

---

### Stage 3: Structural Parsing

The structural parser identifies screenplay elements using format-specific rules:

#### Fountain Format Rules

| Element | Detection Rule | Example |
|---|---|---|
| **Scene Heading** | Line starts with `INT.` or `EXT.` (or forced with `.`) | `EXT. FOREST CLEARING - DAWN` |
| **Action** | Any paragraph not matching other elements | `Sarah stumbles through the underbrush...` |
| **Character** | All-uppercase line followed by dialogue | `SARAH` |
| **Dialogue** | Lines following a character cue | `We need to find shelter.` |
| **Parenthetical** | Lines in parentheses after character | `(whispering)` |
| **Transition** | All-uppercase line ending with `TO:` | `CUT TO:` |
| **Section** | Lines starting with `#` | `# ACT TWO` |
| **Note** | Text within `[[double brackets]]` | `[[Note: rain SFX here]]` |

#### Structural Output Format

```json
{
  "title": "Survival",
  "author": "Jane Director",
  "elements": [
    {
      "type": "scene_heading",
      "text": "EXT. DENSE FOREST - DAWN",
      "sceneNumber": 1
    },
    {
      "type": "action",
      "text": "Dense fog clings to ancient trees. Shafts of pale light break through the canopy. SARAH (30s, mud-streaked, exhausted) stumbles into a clearing.",
      "sceneNumber": 1
    },
    {
      "type": "character",
      "name": "SARAH",
      "sceneNumber": 1
    },
    {
      "type": "dialogue",
      "text": "No... no, this can't be the same place.",
      "sceneNumber": 1
    }
  ]
}
```

---

### Stage 4: AI Scene Extraction

The structured elements are sent to an LLM (OpenAI GPT-4o or Claude) with a specialized system prompt.

#### System Prompt

```
You are a professional film pre-visualization assistant. Given structured 
screenplay elements for a single scene, extract the following information 
and return it as valid JSON:

1. ENVIRONMENT
   - Type (forest, office, rooftop, street, etc.)
   - Sub-environment details (clearing, dense, urban)
   - Ground type (dirt, concrete, grass, water)
   - Weather conditions (fog, rain, clear, snow)

2. LIGHTING
   - Time of day from scene heading
   - Key light (type, direction, intensity 0-1, color hex)
   - Fill light (if implied)
   - Ambient light (color, intensity)
   - Practical lights (campfire, streetlamp, flashlight etc.)
   - Overall mood (warm, cold, harsh, soft)

3. CHARACTERS
   - Name
   - Approximate position in the scene (relative coordinates)
   - Physical description (if mentioned)
   - Current action/pose

4. PROPS & SET PIECES
   - Object type (tree, crate, vehicle, table, etc.)
   - Position (relative coordinates)
   - Scale (small, medium, large)
   - Notable properties (broken, burning, wet, etc.)

5. CAMERA SUGGESTIONS
   - Shot type (wide, medium, close-up, extreme close-up)
   - Angle (eye-level, low-angle, high-angle, bird's-eye, dutch)
   - Movement (static, pan, tilt, tracking, dolly, crane)
   - Focal length suggestion (in mm)
   - Notes on what to emphasize

Return ONLY valid JSON. No markdown, no commentary.
```

#### LLM Request

```json
{
  "model": "gpt-4o",
  "temperature": 0.3,
  "max_tokens": 2000,
  "messages": [
    { "role": "system", "content": "<system_prompt_above>" },
    {
      "role": "user",
      "content": "Scene 1:\nHeading: EXT. DENSE FOREST - DAWN\nAction: Dense fog clings to ancient trees. Shafts of pale light break through the canopy. SARAH (30s, mud-streaked, exhausted) stumbles into a clearing.\nCharacter: SARAH\nDialogue: 'No... no, this can't be the same place.'"
    }
  ]
}
```

---

### Stage 5: Scene JSON Output

The LLM returns a structured scene descriptor:

```json
{
  "sceneNumber": 1,
  "heading": "EXT. DENSE FOREST - DAWN",
  "environment": {
    "type": "forest",
    "subType": "dense_with_clearing",
    "ground": "dirt_leaves",
    "weather": "foggy",
    "skyType": "overcast_dawn"
  },
  "lighting": {
    "timeOfDay": "dawn",
    "key": {
      "type": "directional",
      "direction": [0.3, 0.8, 0.5],
      "intensity": 0.6,
      "color": "#ffd4a0",
      "castShadow": true
    },
    "fill": {
      "type": "hemisphere",
      "skyColor": "#87ceeb",
      "groundColor": "#2d4a2d",
      "intensity": 0.3
    },
    "ambient": {
      "color": "#1a2035",
      "intensity": 0.15
    },
    "practicals": [],
    "mood": "eerie, tense, cold"
  },
  "characters": [
    {
      "name": "SARAH",
      "position": [0, 0, 0],
      "description": "30s, mud-streaked, exhausted",
      "action": "stumbling_forward",
      "facing": [0, 0, -1]
    }
  ],
  "props": [
    {
      "type": "tree_ancient",
      "position": [-3, 0, -5],
      "scale": [1, 2, 1],
      "properties": ["large", "moss-covered"]
    },
    {
      "type": "tree_ancient",
      "position": [4, 0, -4],
      "scale": [1, 1.8, 1],
      "properties": ["large"]
    },
    {
      "type": "fog_volume",
      "position": [0, 0.5, 0],
      "scale": [20, 2, 20],
      "properties": ["dense", "low-lying"]
    },
    {
      "type": "fallen_log",
      "position": [2, 0, -2],
      "scale": [1.5, 0.3, 0.3],
      "properties": ["mossy"]
    }
  ],
  "cameraSuggestions": [
    {
      "shotType": "wide",
      "angle": "eye_level",
      "movement": "slow_push_in",
      "focalLength": 24,
      "position": [0, 1.6, 8],
      "target": [0, 1, 0],
      "notes": "Establish the eerie forest, slowly reveal Sarah"
    },
    {
      "shotType": "medium_close_up",
      "angle": "slightly_low",
      "movement": "static",
      "focalLength": 50,
      "position": [1, 1.2, 1.5],
      "target": [0, 1.5, 0],
      "notes": "Sarah's face — capture exhaustion and fear"
    }
  ]
}
```

---

### Stage 6: JSON → 3D Scene

The client-side `sceneBuilder.js` converts the JSON descriptor into Three.js objects:

```
Scene JSON
    │
    ├── environment.type → Load environment preset
    │   ├── Ground plane (geometry + material from ground type)
    │   ├── Sky (HDRI or procedural from skyType)
    │   └── Weather effects (fog density, particle systems)
    │
    ├── lighting → Create Three.js lights
    │   ├── DirectionalLight (key)
    │   ├── HemisphereLight (fill)
    │   ├── AmbientLight (ambient)
    │   └── PointLight / SpotLight (practicals)
    │
    ├── characters[ ] → Place character placeholders
    │   └── Capsule geometry + label sprite
    │
    ├── props[ ] → Place prop meshes
    │   ├── Match to asset library (primitives or loaded GLTFs)
    │   └── Apply position, rotation, scale
    │
    └── cameraSuggestions[ ] → Create camera objects
        ├── PerspectiveCamera (focalLength → FOV)
        ├── Camera helper (frustum visualizer)
        └── Set position + lookAt target
```

---

## Environment Presets

The following environment presets are available for auto-population:

| Preset | Description | Includes |
|---|---|---|
| `forest` | Dense trees, ground foliage | Trees, bushes, ground plane, fog |
| `forest_clearing` | Open area within forest | Fewer trees, grass ground, sky visible |
| `urban_street` | City street | Buildings, sidewalk, street lamps |
| `office_interior` | Indoor office | Walls, desk, chairs, ceiling lights |
| `warehouse` | Large open industrial space | Concrete floor, pillars, high ceiling |
| `rooftop` | Building rooftop | Ledge, ventilation units, skyline |
| `desert` | Arid landscape | Sand ground, rocks, clear sky |
| `beach` | Coastal scene | Sand, water plane, driftwood |
| `parking_lot` | Open lot | Asphalt, lamp posts, lane markings |
| `living_room` | Home interior | Couch, table, windows, walls |

---

## Error Handling

| Error | Cause | Resolution |
|---|---|---|
| `UNSUPPORTED_FORMAT` | File extension not recognized | Convert to `.fountain` or `.txt` |
| `FILE_TOO_LARGE` | File exceeds 10 MB | Reduce file size |
| `PARSE_FAILED` | Could not extract text from file | Try a different format (e.g., `.fountain`) |
| `AI_EXTRACTION_FAILED` | LLM returned invalid JSON | Automatic retry with stricter prompt (up to 3 retries) |
| `AI_RATE_LIMITED` | Too many API calls | Queue the request; retry after cooldown |
| `OCR_FAILED` | PDF scan quality too low | Use a clearer scan or type the text manually |

---

## Configuration

Script parsing behavior can be configured via environment variables:

```env
# AI Provider
AI_PROVIDER=openai          # "openai" or "anthropic"
AI_MODEL=gpt-4o             # Model identifier
AI_TEMPERATURE=0.3          # Lower = more deterministic
AI_MAX_TOKENS=2000          # Per-scene token limit

# Parsing
MAX_SCRIPT_PAGES=200        # Maximum screenplay length
OCR_ENABLED=true            # Enable OCR for scanned PDFs
RETRY_COUNT=3               # AI extraction retry attempts
```

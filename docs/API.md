# API Reference — CineVision

> Base URL: `http://localhost:5000/api`  
> All protected endpoints require: `Authorization: Bearer <JWT_TOKEN>`  
> Content-Type: `application/json` (unless uploading files)

---

## Table of Contents

- [Authentication](#authentication)
- [Projects](#projects)
- [Scenes](#scenes)
- [Scripts](#scripts)
- [Export](#export)
- [Error Handling](#error-handling)

---

## Authentication

### Register

```
POST /api/auth/register
```

**Request Body:**

```json
{
  "name": "Jane Director",
  "email": "jane@example.com",
  "password": "securePassword123!"
}
```

**Validation Rules:**
- `name` — Required, 2–50 characters
- `email` — Required, valid email format, unique
- `password` — Required, min 8 characters, must contain uppercase, lowercase, and number

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
      "name": "Jane Director",
      "email": "jane@example.com",
      "createdAt": "2026-02-21T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Login

```
POST /api/auth/login
```

**Request Body:**

```json
{
  "email": "jane@example.com",
  "password": "securePassword123!"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
      "name": "Jane Director",
      "email": "jane@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Get Current User

```
GET /api/auth/me
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
    "name": "Jane Director",
    "email": "jane@example.com",
    "createdAt": "2026-02-21T00:00:00.000Z"
  }
}
```

---

## Projects

### List Projects

```
GET /api/projects
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `sort` | string | `-updatedAt` | Sort field (prefix `-` for descending) |

**Response (200 OK):**

```json
{
  "success": true,
  "count": 2,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2
  },
  "data": [
    {
      "_id": "proj_001",
      "title": "Survival Thriller — Forest",
      "description": "A survival thriller set in dense Pacific Northwest forest",
      "thumbnail": "https://res.cloudinary.com/.../thumbnail.jpg",
      "sceneCount": 5,
      "createdAt": "2026-02-20T00:00:00.000Z",
      "updatedAt": "2026-02-21T01:30:00.000Z"
    }
  ]
}
```

---

### Create Project

```
POST /api/projects
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**

```json
{
  "title": "Survival Thriller — Forest",
  "description": "A survival thriller set in dense Pacific Northwest forest",
  "genre": "thriller"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "_id": "proj_001",
    "title": "Survival Thriller — Forest",
    "description": "A survival thriller set in dense Pacific Northwest forest",
    "genre": "thriller",
    "owner": "65a1b2c3d4e5f6a7b8c9d0e1",
    "scenes": [],
    "createdAt": "2026-02-21T00:00:00.000Z"
  }
}
```

---

### Get Project

```
GET /api/projects/:id
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "proj_001",
    "title": "Survival Thriller — Forest",
    "description": "...",
    "genre": "thriller",
    "owner": "65a1b2c3d4e5f6a7b8c9d0e1",
    "scenes": ["scene_001", "scene_002"],
    "script": "script_001",
    "createdAt": "2026-02-21T00:00:00.000Z",
    "updatedAt": "2026-02-21T01:30:00.000Z"
  }
}
```

---

### Update Project

```
PUT /api/projects/:id
Authorization: Bearer <JWT_TOKEN>
```

**Request Body (partial updates allowed):**

```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

**Response (200 OK):** Updated project object.

---

### Delete Project

```
DELETE /api/projects/:id
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

## Scenes

### List Scenes in Project

```
GET /api/projects/:projectId/scenes
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "scene_001",
      "sceneNumber": 1,
      "heading": "EXT. FOREST CLEARING - DAWN",
      "environment": "forest_clearing",
      "timeOfDay": "dawn",
      "objects": [...],
      "cameras": [...],
      "lights": [...]
    }
  ]
}
```

---

### Create Scene

```
POST /api/projects/:projectId/scenes
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**

```json
{
  "sceneNumber": 1,
  "heading": "EXT. FOREST CLEARING - DAWN",
  "environment": "forest_clearing",
  "timeOfDay": "dawn",
  "objects": [
    {
      "type": "tree",
      "position": [5, 0, -3],
      "rotation": [0, 0.5, 0],
      "scale": [1, 1.5, 1]
    }
  ],
  "cameras": [
    {
      "name": "Camera A",
      "position": [0, 1.6, 5],
      "target": [0, 1, 0],
      "focalLength": 35,
      "sensorSize": 36
    }
  ],
  "lights": [
    {
      "type": "directional",
      "name": "Key Light",
      "position": [10, 15, 5],
      "intensity": 1.2,
      "color": "#fff5e6",
      "castShadow": true
    }
  ]
}
```

**Response (201 Created):** Full scene object.

---

### Update Scene

```
PUT /api/scenes/:id
Authorization: Bearer <JWT_TOKEN>
```

Accepts partial updates. Use this to save camera positions, add/remove objects, or adjust lighting.

---

### Delete Scene

```
DELETE /api/scenes/:id
Authorization: Bearer <JWT_TOKEN>
```

---

## Scripts

### Upload Script

```
POST /api/scripts/upload
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data
```

**Form Data:**

| Field | Type | Description |
|---|---|---|
| `script` | File | Screenplay file (`.fountain`, `.fdx`, `.pdf`, `.txt`) |
| `projectId` | String | ID of the project to attach the script to |

**File Constraints:**
- Max size: 10 MB
- Allowed types: `.fountain`, `.fdx`, `.pdf`, `.txt`

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "_id": "script_001",
    "filename": "survival_thriller.fountain",
    "format": "fountain",
    "url": "https://res.cloudinary.com/.../survival_thriller.fountain",
    "project": "proj_001",
    "status": "uploaded",
    "createdAt": "2026-02-21T00:00:00.000Z"
  }
}
```

---

### Parse Script (AI)

```
POST /api/scripts/parse
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**

```json
{
  "scriptId": "script_001"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "scriptId": "script_001",
    "status": "parsed",
    "scenesExtracted": 12,
    "scenes": [
      {
        "sceneNumber": 1,
        "heading": "EXT. DENSE FOREST - DAWN",
        "location": "dense_forest",
        "timeOfDay": "dawn",
        "mood": "tense, eerie",
        "lighting": {
          "key": { "type": "directional", "intensity": 0.6, "color": "#ffd4a0" },
          "ambient": { "intensity": 0.15, "color": "#1a2035" }
        },
        "characters": [
          { "name": "SARAH", "position": [0, 0, 0], "action": "stumbling forward" }
        ],
        "props": [
          { "type": "fallen_tree", "position": [3, 0, -2] },
          { "type": "campfire_remains", "position": [-1, 0, 1] }
        ],
        "cameraSuggestions": [
          { "type": "tracking_shot", "focalLength": 28, "description": "Follow Sarah through the trees" }
        ]
      }
    ]
  }
}
```

---

### Get Parsed Scenes

```
GET /api/scripts/:id/scenes
Authorization: Bearer <JWT_TOKEN>
```

Returns the extracted scene data for a previously parsed script.

---

## Export

### Export Storyboard (PDF)

```
POST /api/export/storyboard
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**

```json
{
  "projectId": "proj_001",
  "frames": [
    {
      "sceneNumber": 1,
      "shotNumber": 1,
      "imageData": "data:image/png;base64,...",
      "camera": {
        "position": [0, 1.6, 5],
        "focalLength": 35,
        "type": "wide"
      },
      "notes": "Establishing shot — Sarah enters the clearing"
    }
  ],
  "options": {
    "layout": "2x3",
    "includeMetadata": true,
    "paperSize": "A4"
  }
}
```

**Response (200 OK):**

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="storyboard_proj_001.pdf"
```

---

### Export Shot List (CSV)

```
POST /api/export/shotlist
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**

```
Content-Type: text/csv
Content-Disposition: attachment; filename="shotlist_proj_001.csv"
```

**CSV Format:**

```csv
Scene,Shot,Camera,Focal Length,Position X,Position Y,Position Z,Type,Notes
1,1,Camera A,35,0,1.6,5,wide,"Establishing shot"
1,2,Camera B,85,2,1.2,3,close-up,"Sarah's reaction"
```

---

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### Error Codes

| HTTP Status | Code | Description |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Invalid input data |
| 401 | `UNAUTHORIZED` | Missing or invalid JWT |
| 403 | `FORBIDDEN` | User lacks permission for this resource |
| 404 | `NOT_FOUND` | Resource does not exist |
| 409 | `CONFLICT` | Resource already exists (e.g., duplicate email) |
| 413 | `FILE_TOO_LARGE` | Uploaded file exceeds size limit |
| 415 | `UNSUPPORTED_FORMAT` | Unsupported file type |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |
| 503 | `AI_SERVICE_UNAVAILABLE` | AI API is unavailable |

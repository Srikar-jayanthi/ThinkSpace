# ThinkSpace API Reference & Protocol Specification

## 1. Overview

ThinkSpace exposes two primary communication interfaces:
1. **REST API**: Standard HTTP endpoints for user authentication, practice scenario discovery, session management, performance analytics, and ML evaluations.
2. **WebSocket Gateway**: Real-time Socket.IO bidirectional event protocol governing live practice rounds, streaming AI feedback, and audio transmission.

Interactive Swagger/OpenAPI documentation is available at **`/api-docs`**.

---

## 2. Authentication & Authorization

All protected endpoints require either:
- An HTTP-only cookie containing a valid JWT: `token=<jwt_value>`
- An Authorization header: `Authorization: Bearer <jwt_token>`

### Endpoints

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | No | Register a new student/user account (triggers verification OTP) |
| `POST` | `/api/auth/login` | No | Authenticate credentials and receive session cookie |
| `POST` | `/api/auth/verify-email` | No | Verify 6-digit email OTP |
| `POST` | `/api/auth/resend-otp` | No | Request fresh verification code |
| `POST` | `/api/auth/forgot-password` | No | Request password recovery email |
| `POST` | `/api/auth/reset-password` | No | Submit new password with reset token |
| `GET` | `/api/auth/me` | Yes | Retrieve authenticated user profile and subscription status |
| `POST` | `/api/auth/logout` | Yes | Invalidate session cookie |

---

## 3. Practice Scenarios & Topics

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/topics` | No | Retrieve list of curated practice scenarios (grouped by category) |
| `POST` | `/api/topics/propose` | Yes | Propose a custom scenario for practice |

#### Example Response: `GET /api/topics`
```json
{
  "topics": [
    {
      "_id": "660c1d2e...",
      "title": "AI and automation will reshape the future of creative work",
      "category": "technology",
      "difficulty": "hard",
      "isActive": true
    },
    {
      "_id": "660c1d3f...",
      "title": "Universal basic income can effectively cushion technological displacement",
      "category": "society",
      "difficulty": "hard",
      "isActive": true
    }
  ],
  "byCategory": {
    "technology": 6,
    "society": 5,
    "politics": 3,
    "education": 3,
    "environment": 6
  }
}
```

---

## 4. Practice Sessions & Debates

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/debates` | Yes | Initialize a new practice session |
| `GET` | `/api/debates/:id` | Yes | Retrieve session state, arguments, scores, and coach feedback |
| `GET` | `/api/debates/user/history` | Yes | List paginated practice history for current user |
| `POST` | `/api/debates/:id/end` | Yes | Conclude practice session and generate performance metrics |

#### Example Payload: `POST /api/debates`
```json
{
  "topicId": "660c1d2e...",
  "format": "freeform",
  "userSide": "for",
  "difficulty": "intermediate",
  "persona": "socratic",
  "language": "en"
}
```

---

## 5. Performance Center & Analytics

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/profile` | Yes | Retrieve user competencies, level, streak, and achievements |
| `PUT` | `/api/profile` | Yes | Update profile bio, avatar, and preferred learning goals |
| `GET` | `/api/profile/leaderboard` | No | Retrieve global ranking and competitive standing |
| `GET` | `/api/ai/status` | No | Retrieve health status of all connected AI providers |

#### Example Response: `GET /api/ai/status`
```json
{
  "status": "operational",
  "totalProviders": 5,
  "availableProviders": 2,
  "providers": [
    { "name": "Sarvam AI", "key": "sarvam", "available": false },
    { "name": "Groq", "key": "groq", "available": false },
    { "name": "OpenAI", "key": "openai", "available": false },
    { "name": "Ollama (Local)", "key": "ollama", "available": false },
    { "name": "ThinkSpace Coach", "key": "coach", "available": true }
  ],
  "failoverChain": {
    "english": ["groq", "openai", "ollama", "coach"],
    "indian": ["sarvam", "groq", "openai", "ollama", "coach"]
  }
}
```

---

## 6. Real-Time WebSocket Protocol (Socket.IO)

Clients connect to the WebSocket server using:
```javascript
const socket = io('http://localhost:5000', {
  auth: { token: 'JWT_TOKEN' }
});
```

### Client $\longrightarrow$ Server Events

- `join_debate`: Connects client to practice room.
  ```json
  { "debateId": "660c...", "preferredLang": "en" }
  ```
- `transcript_direct`: Submits typed user argument.
  ```json
  { "debateId": "660c...", "text": "Automation will create higher-order creative jobs..." }
  ```
- `audio_chunk` / `audio_end`: Streams binary audio chunks for server-side Whisper transcription.

### Server $\longrightarrow$ Client Events

- `session_ready`: Dispatched when room context is prepared.
- `ai_response_chunk`: Real-time streaming token from the AI sparring coach.
- `argument_analysis`: Real-time argument evaluation:
  ```json
  {
    "scores": { "logic": 84, "evidence": 76, "clarity": 90 },
    "fallacies": [],
    "feedback": "Strong premise. Consider substantiating the claim with empirical job displacement data."
  }
  ```
- `session_concluded`: Emitted when all rounds are completed, triggering the final performance report.

---

## 7. Machine Learning Microservice Endpoints (Port 8000)

The ML service provides specialized NLP evaluations:

### `POST /fallacy/detect`
Detects logical fallacies in text using syntactic rules and SpaCy entity/dependency patterns.
```json
// Request
{
  "argument": "You only support renewable energy because you are an environmental extremist.",
  "context": []
}

// Response
{
  "detected": true,
  "fallacy_type": "ad_hominem",
  "confidence": 92.5,
  "explanation": "Attacking the speaker's motives rather than addressing the argument."
}
```

### `POST /scorer/score`
Computes logic, evidence, and clarity scores using NLTK VADER sentiment and lexical features.
```json
// Request
{
  "argument": "Studies published by MIT demonstrate a 25% efficiency gain in decentralized power grids.",
  "topic": "Renewable Energy Transition"
}

// Response
{
  "logic_score": 88.0,
  "evidence_score": 94.0,
  "clarity_score": 90.0,
  "sentiment": { "pos": 0.32, "neu": 0.68, "neg": 0.0, "compound": 0.58 }
}
```

### `POST /memory/store` & `GET /memory/weaknesses/{user_id}`
Tracks persistent rhetorical fallacies and cognitive biases across sessions using FAISS vector indexing.

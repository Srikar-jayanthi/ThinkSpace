# ThinkSpace — System Architecture & Technical Specifications

## 1. System Overview

**ThinkSpace** is an interactive, microservices-based communication and critical thinking platform engineered around the core pedagogical cycle:
$$\text{PRACTICE} \longrightarrow \text{ANALYSIS} \longrightarrow \text{FEEDBACK} \longrightarrow \text{IMPROVEMENT}$$

The system comprises three primary decoupled layers:
1. **Frontend Presentation Layer**: React 18 single-page application built with Vite, featuring real-time WebSocket communication, audio visualization, Recharts analytics, and responsive design systems.
2. **Backend Application Layer**: Node.js and Express 5 REST & Socket.IO server managing sessions, auth, ELO progression, AI orchestration, and database operations.
3. **Machine Learning Microservice**: Python FastAPI service providing multi-layer logical fallacy detection, argument scoring, vector memory, and speech transcription.

```mermaid
graph TB
    subgraph "Frontend Client (React 18 / Vite)"
        FE["React SPA<br/>Router v6 + Recharts"]
        PC["Performance Center<br/>(/performance)"]
        PP["Practice Plan<br/>(/plan)"]
        AR["Practice Arena<br/>(/arena)"]
    end

    subgraph "Backend Engine (Node.js 22 / Express 5)"
        API["Express REST API"]
        WS["Socket.IO WebSocket Gateway"]
        ORC["AI Orchestrator<br/>(Cascading Failover)"]
        
        subgraph "AI Provider Strategy Layer"
            SAR["Sarvam AI<br/>(Indic Languages)"]
            GRQ["Groq<br/>(Llama 3.3 70B)"]
            OAI["OpenAI<br/>(GPT-4o)"]
            OLL["Ollama<br/>(Local LLM)"]
            COACH["ThinkSpace Coach<br/>(Built-in Socratic Engine)"]
        end
        
        subgraph "Core Backend Services"
            PE["Practice Engine"]
            SC["Scoring Service"]
            FD["Fallacy Service"]
            SM["Session Manager"]
            EL["ELO / Ranking Engine"]
            SEC["Security & Bot Guard"]
        end
    end

    subgraph "Machine Learning Microservice (FastAPI)"
        FA["FastAPI REST Server"]
        
        subgraph "NLP Technology Stack"
            SP["SpaCy en_core_web_sm<br/>(Dependency Parsing & POS)"]
            NL["NLTK VADER<br/>(Sentiment & Polarity)"]
            TF["scikit-learn TF-IDF<br/>(Argument Vector Embeddings)"]
            FSS["FAISS Vector Index<br/>(Weakness Memory)"]
        end
        
        subgraph "ML Endpoints"
            FLD["/fallacy/detect"]
            SCS["/scorer/score"]
            MEM["/memory/*"]
            STT["/transcription/*"]
        end
    end

    subgraph "Resilient Data Layer"
        MG["MongoDB (Atlas / Embedded In-Memory Server)"]
        RD["Redis (Upstash / In-Memory Key-Value Store)"]
    end

    FE <-->|REST API + HTTP| API
    FE <-->|Real-time Socket.IO| WS
    API --> ORC
    ORC --> SAR & GRQ & OAI & OLL & COACH
    WS --> PE & SC & FD & SM
    SC --> FA
    FD --> FA
    API --> MG
    SM --> RD
    FA --> SP & NL & TF & FSS
```

---

## 2. Pedagogical Practice Flow

The real-time communication practice session executes through a deterministic, phase-based state machine:

```mermaid
sequenceDiagram
    autonumber
    actor User as Student / User
    participant FE as Frontend Arena
    participant WS as Backend WebSocket
    participant ORC as AI Orchestrator
    participant ML as ML Microservice
    participant DB as MongoDB

    User->>FE: Select Scenario & Coach Style
    FE->>WS: join_practice_session(sessionId)
    WS->>FE: session_ready(topic, rules, limits)

    loop Interactive Argument Rounds
        User->>FE: Speak / Type Argument
        FE->>WS: user_argument(text, roundIndex)
        
        par Parallel Analysis & Generation
            WS->>ML: POST /fallacy/detect + /scorer/score
            ML-->>WS: scores(logic, evidence, clarity) + fallacies
        and Streaming AI Sparring
            WS->>ORC: streamResponse(session, text)
            ORC-->>WS: text chunk stream
            WS-->>FE: ai_response_chunk(token)
        end

        WS->>FE: round_complete(scores, fallacies, coachingTip)
    end

    User->>FE: Complete Session
    WS->>DB: Persist Session Metrics & ELO Delta
    FE->>User: Display Interactive Performance Report
```

---

## 3. AI Orchestration & Failover Architecture

ThinkSpace utilizes the **Strategy Pattern** to ensure provider agnosticism. All providers implement the abstract `BaseProvider` contract:

```mermaid
classDiagram
    class BaseProvider {
        <<abstract>>
        +getName() string
        +isAvailable() boolean
        +supportsLanguage(langCode) boolean
        +generate(session, userArgument) string
        +stream(session, userArgument) AsyncGenerator
        #_loadKeys(envPrefix, maxKeys) string[]
        #_getNextAvailableKeyIndex(keys) number
        #_markKeyLimited(keyIndex) void
    }

    class SarvamProvider {
        -apiUrl: string
        +supportsLanguage(langCode) boolean
        +generate() string
    }

    class GroqProvider {
        -model: "llama-3.3-70b-versatile"
        +generate() string
    }

    class OpenAIProvider {
        -model: "gpt-4o"
        +generate() string
    }

    class OllamaProvider {
        -apiUrl: string
        +stream() AsyncGenerator
    }

    class CoachProvider {
        +isAvailable() true
        +generate() string
        +stream() AsyncGenerator
    }

    BaseProvider <|-- SarvamProvider
    BaseProvider <|-- GroqProvider
    BaseProvider <|-- OpenAIProvider
    BaseProvider <|-- OllamaProvider
    BaseProvider <|-- CoachProvider
```

### Failover Cascade Matrix
- **Indian Languages (te, hi, ta, kn, ml, mr, bn, gu, pa, ur)**:
  `Sarvam AI` $\longrightarrow$ `Groq` $\longrightarrow$ `OpenAI` $\longrightarrow$ `Ollama` $\longrightarrow$ **`ThinkSpace Coach`**
- **English & International Languages**:
  `Groq` $\longrightarrow$ `OpenAI` $\longrightarrow$ `Ollama` $\longrightarrow$ **`ThinkSpace Coach`**

> **Zero-Failure Guarantee**: Because `CoachProvider` executes locally within the Node.js runtime and requires zero external credentials or daemon processes, practice sessions will never crash due to network partitions, quota limits, or missing API keys.

---

## 4. Machine Learning & NLP Evaluation Pipeline

The ML microservice evaluates arguments across multiple NLP dimensions:

```mermaid
flowchart TD
    Raw["Raw User Argument Text"] --> Pre["NLP Preprocessing (SpaCy)"]
    
    Pre --> Tokens["Tokenization & Lemmatization"]
    Pre --> POS["Part-of-Speech Tagging"]
    Pre --> Dep["Syntactic Dependency Trees"]
    
    Tokens & POS & Dep --> FallacyEngine["Fallacy Detection Engine"]
    FallacyEngine --> RuleMatch["Rule-Based Syntactic Patterns"]
    FallacyEngine --> SemanticMatch["Cosine Similarity against Fallacy Exemplars"]
    
    Tokens --> Sentiment["NLTK VADER Tone & Sentiment Scoring"]
    Tokens --> Scorer["Argument Quality Scorer"]
    Scorer --> LogicScore["Logic & Premise Score (0-100)"]
    Scorer --> EvidenceScore["Evidence & Grounding Score (0-100)"]
    Scorer --> ClarityScore["Clarity & Readability Score (0-100)"]
    
    FallacyEngine & Scorer --> VectorMemory["FAISS Vector Memory"]
    VectorMemory --> Weakness["Student Weakness Tracker & Adaptive Drills"]
```

1. **Syntactic & Dependency Analysis (SpaCy)**: Checks sentence complexity, clause subordination, and grammatical relationships.
2. **Multi-Class Fallacy Classifier**:
   - *Ad Hominem*: Identifies attacks on character rather than the proposition.
   - *Strawman*: Compares distortion against context embeddings.
   - *Slippery Slope*: Detects runaway causal chain assertions without intervening evidence.
   - *False Dilemma*: Detects forced binary options ("either X or destruction").
3. **Sentiment & Confidence Modeling (NLTK VADER)**: Ensures argumentative discourse maintains academic composure and objective tone.
4. **Vector Memory (FAISS + TF-IDF)**: Embeds arguments per user ID to track persistent blind spots over multiple practice days.

---

## 5. High-Availability & Resilience Architecture

To guarantee zero setup friction for academic reviewers, evaluation committees, and students:

### 1. In-Memory MongoDB Auto-Provisioning
- Upon startup, `backend/config/database.js` attempts connection to `process.env.MONGODB_URI`.
- If no external database is detected, it automatically initializes an in-process `MongoMemoryServer`.
- Pre-seeds 23 curated discussion scenarios spanning 5 academic and civic domains.

### 2. In-Memory Redis Session Fallback
- If Redis is absent or network connectivity drops, `backend/config/redis.js` switches to an in-memory key-value cache.
- Implements TTL expiration, sorted sets (`zadd`, `zrevrange`, `zrevrank`), and hash maps for live leaderboard rankings and session tracking.

### 3. Comprehensive Security Perimeter
- **Helmet.js**: Sets essential HTTP security headers.
- **Bot Guard & Honeypot**: Blocks automated scrapers and bad-faith bots.
- **Strict Rate Limiting**: Protects against brute-force attacks on auth and practice endpoints.
- **Stateless JWT with Bcrypt**: Cryptographically secure token authentication with rotating secrets.

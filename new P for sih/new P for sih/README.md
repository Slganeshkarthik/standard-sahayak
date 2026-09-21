# Standards Sahayak — AI-Powered Indian Standards (IS) Recommender for Public Procurement

An intelligent, full-featured compliance and recommendation engine that maps free-text tender requirements and product specifications to applicable Bureau of Indian Standards (BIS) codes.

---

## 🌟 Key Capabilities

1. **RAG Backend over Real BIS Dataset (`data/`)**:
   - Indexed **13,335+ published Indian Standards** from `File_Published_Standards_List_2026-09-17_235446.xlsx`.
   - Indexed **5,768+ amendment records** from `standard_amedments.xlsx`.
   - Multi-stage retrieval: Lexical keyword search (BM25 style) + Semantic Re-ranking via Google Gemini Embeddings (`text-embedding-004`).
   - RAG structured entity extraction, risk detection, and reasoning explanations via Gemini 2.0 Flash (`gemini-2.0-flash`).

2. **Interactive & Dynamic Frontend**:
   - **NIC SSO / MFA Login Screen** simulation with role-based switching (Procurement Officer, Lead, Admin, Viewer).
   - **Tender Specification Workspace** supporting English and Hindi (Devanagari) input with real-time translation display.
   - **9-Stage Animated Pipeline**: Visual progression through Language Detection, Translation, Entity Extraction, Vector Retrieval, Fusion, Re-ranking, Graph Expansion, Certification Lookup, and RAG Explanation.
   - **Dynamic Entity & Attribute Extraction**: Instant display of products, materials, use-cases, ICS codes, and procurement risks.
   - **Live Search & Filter**: Real-time keyword highlight, category filters (Primary, Safety, Installation, Test Method, Withdrawn, QCO Mandatory), and sorting (Confidence, Status, Category).
   - **Interactive Relationship Graph**: SVG-based network graph visualizing core standards, normative links, test methods, and clickable relationship nodes.
   - **Side-by-Side Comparison**: Compare up to 4 standards side-by-side.
   - **Export Engine**: One-click export to CSV, PDF (print-ready stylesheet), and XLSX.
   - **Audit Trail & Toast Notifications**: Real-time compliance alerts and immutable audit log.
   - **Dark / Light Theme**: Full palette switching with persistent local storage.

---

## 🚀 Quick Start

### 1. Start the Flask Backend (with RAG & Gemini API)

```bash
# Optional: Set your Gemini API key in your environment
set GEMINI_API_KEY=your_gemini_api_key_here

# Run the Flask server
python app.py
```

The server will automatically index the 13,335+ standards from `data/` and start on `http://localhost:5000`.

### 2. Launch the Web Application

Open your browser and navigate to:
```
http://localhost:5000
```
*(You can also set/update your Gemini API Key directly inside the web UI using the in-app key modal!)*

---

## 📂 Project Structure

```
.
├── app.py              # Flask RAG backend (Gemini API, embedding re-ranker, dataset indexer)
├── index.html          # Semantic HTML5 frontend interface
├── styles.css          # Premium design system (dark/light mode, glassmorphism, responsive)
├── script.js           # Dynamic application logic, API client, graph, and UI interactions
├── README.md           # Documentation
└── data/               # Official BIS standards compendiums and datasets
    ├── File_Published_Standards_List_2026-09-17_235446.xlsx
    ├── standard_amedments.xlsx
    └── ... (compendium PDFs and booklets)
```

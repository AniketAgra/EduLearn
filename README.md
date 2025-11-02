# 📚 EduLearn - AI-Powered Learning Platform

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-brightgreen.svg)](https://www.mongodb.com/)

**Transform your PDFs into interactive learning experiences with AI-powered study assistance.**

---

## 🎯 What is EduLearn?

EduLearn is a comprehensive MERN-stack learning platform that revolutionizes how students interact with educational content. Upload PDFs, get AI-generated summaries, chat with AI about your documents, generate quizzes automatically, and track your learning progress—all in one intuitive interface.

### ✨ Key Features

- **📄 Smart PDF Management** - Upload, organize, and view PDFs with a beautiful reader
- **🤖 Dual AI Assistants**
  - **AI PDF Buddy** - Quick, contextual Q&A about specific PDFs
  - **AI Study Buddy** - Personalized tutoring with RAG-powered memory across all your materials
- **🧩 Auto Quiz Generation** - Create MCQs, SAQs, and LAQs from any PDF with customizable difficulty
- **📊 Analytics Dashboard** - Comprehensive learning insights with charts, heatmaps, and performance trends
- **📝 Smart Notes** - Text and audio note-taking linked to specific PDF pages
- **🎯 Performance Tracking** - Identify weak topics and get AI-driven study recommendations
- **🎨 Beautiful UI** - Modern, responsive design with light/dark themes
- **⚡ Real-Time Chat** - WebSocket-powered instant AI responses with streaming

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- MongoDB 6+ ([Installation](https://www.mongodb.com/docs/manual/installation/))
- Git ([Download](https://git-scm.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BeyondChats
   ```

2. **Setup Backend**
   ```bash
   cd Backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd Frontend
   npm install
   npm run dev
   ```

4. **Access the app**
   - Deployed: https://beyondchats-cbtm.onrender.com
   - Local (development): Frontend: http://localhost:5174, Backend: http://localhost:4000

### Required Environment Variables

**Backend `.env`:**
```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/
ORIGIN=https://beyondchats-cbtm.onrender.com
LLM_PROVIDER=gemini
OPENAI_API_KEY=
YOUTUBE_API_KEY=
JWT_ACCESS_TOKEN_SECRET=your_access_token_secret
JWT_REFRESH_TOKEN_SECRET=your_refresh_token_secret
GEMINI_API_KEY=
ENABLE_DEBUG_ROUTES=true

# Supabase Storage (new)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_BUCKET=

# Upload limits 50MB
MAX_UPLOAD_BYTES=52428800

# Pinecone Vector Database (AI Study Buddy RAG)
PINECONE_API_KEY=
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX_NAME=edulearn-vectors
```

**Get API Keys:**
- Gemini: [Google AI Studio](https://makersuite.google.com/app/apikey)
- OpenAI: [OpenAI Platform](https://platform.openai.com/api-keys)
- Supabase: [Supabase Dashboard](https://supabase.com)
- Pinecone: [Pinecone Console](https://www.pinecone.io/)

---

## 📖 Documentation

Comprehensive documentation is available in the `/documentation` folder:

### 📚 Getting Started
- [**Introduction**](../../documentation/overview/01_Introduction.md) - What is EduLearn, features, use cases
- [**System Architecture**](../../documentation/overview/02_System_Architecture.md) - Technical design, data flow
- [**Developer Guide**](../../documentation/overview/03_Developer_Guide.md) - Setup, development workflow
- [**Deployment Guide**](../../documentation/overview/04_Deployment_Guide.md) - Production deployment

### 📄 Features
- [**Dashboard**](../BeyondChats/Documentation/pages/page_dashboard.md) - Analytics and performance tracking
- [**PDF Viewer**](../BeyondChats/documentation/pages/page_pdf_viewer.md) - Document interaction and AI chat
- More in `/documentation/pages/`

### 🌐 Technical Reference
- [**API Endpoints**](../BeyondChats/documentation/api/api_endpoints.md) - Complete REST API reference
- [**Tech Stack**](../BeyondChats/documentation/technical/tech_stack.md) - Technologies and tools used
- [**Services**](../BeyondChats/documentation/services/) - External integrations

---

## 🏗️ Project Structure

```
BeyondChats/
├── Backend/
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── schemas/         # MongoDB models
│   │   ├── middlewares/     # Express middlewares
│   │   ├── sockets/         # Socket.IO handlers
│   │   └── config/          # Configuration files
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── Frontend/
│   ├── src/
│   │   ├── pages/           # Route components
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React Context
│   │   ├── hooks/           # Custom hooks
│   │   └── utils/           # Utilities
│   ├── package.json
│   └── vite.config.js
│
└── documentation/           # Comprehensive documentation
    ├── overview/            # Guides and architecture
    ├── pages/               # Feature docs
    ├── api/                 # API reference
    ├── services/            # Service integrations
    └── technical/           # Tech details
```

---

## 🛠️ Tech Stack

### Frontend
- React 18.3 + Vite 5.4
- React Router, Context API
- Socket.IO Client
- Recharts (data visualization)
- react-pdf
- CSS Modules

### Backend
- Node.js + Express 4.19
- MongoDB + Mongoose 8.5
- Socket.IO 4.8
- JWT authentication
- Multer (file uploads)

### AI & ML
- Google Gemini (primary LLM)
- OpenAI GPT (fallback LLM)
- Pinecone (vector database)
- OpenAI Embeddings

### Storage
- Supabase Storage (PDF files)
- MongoDB Atlas (database)


[**Full Tech Stack →**](../BeyondChats/documentation/technical/tech_stack.md)

---

## 🎯 Features in Detail

### 🤖 AI PDF Buddy
- Context-aware Q&A limited to current PDF
- Quick action buttons (Summarize, Explain, Study Guide)
- Real-time streaming responses
- Concise answers (300-500 words)

### 🧠 AI Study Buddy
- RAG-powered search across all PDFs
- Performance-aware (adapts to weak topics)
- Cross-document learning
- Personalized tutoring

### 📊 Analytics Dashboard
- Performance trend charts
- Topic mastery heatmap
- Study time tracking
- PDF engagement insights
- AI-driven recommendations

### 🧩 Quiz System
- Auto-generated MCQs, SAQs, LAQs
- Multiple difficulty levels
- Topic-specific quizzes
- Instant AI grading
- Reattempt tracking

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd Frontend
vercel --prod
```

### Backend (Render.com)
1. Connect GitHub repository
2. Set Root Directory: `Backend`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Add environment variables

[**Detailed Deployment Guide →**](../BeyondChats/documentation/overview/04_Deployment_Guide.md)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Google Gemini](https://ai.google.dev/)
- [Pinecone](https://www.pinecone.io/)
- [Supabase](https://supabase.com/)
- [MongoDB](https://www.mongodb.com/)

---

**Made with ❤️ for students everywhere**

**Version:** 1.0.0  
**Last Updated:** October 2025


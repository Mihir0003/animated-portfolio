# Projects - Mihir Amodwala

## 1. MicroStore - E-Commerce Microservices
- **Project Name**: MicroStore
- **Description**: An enterprise-grade, scalable e-commerce system that segregates product management and order processing into independent services. Features a futuristic HTML5 shopping cart dashboard that manages state securely on the client side before dispatching transactions.
- **Technology Stack**: Java Spring Boot, Microservices Architecture, Spring Data JPA, REST Communication (RestTemplate), H2/MySQL database, HTML5, CSS3, JavaScript.
- **Responsibilities**:
  - Engineered the separation of inventory (Product Service) from sales processing (Order Service) using independent Spring Boot JVM instances.
  - Implemented synchronous communication between services using RestTemplates to automatically verify inventory during checkout.
  - Designed an immersive storefront dashboard featuring Indian Rupee (INR) formatting, async mock payment gateways, and custom CSS animations.
- **Outcome**: Successfully demonstrated service decoupling in a distributed system, enabling services to run on separate ports and communicate over REST, mitigating cascade failures.

## 2. TaskFlow - Agile Kanban Board
- **Project Name**: TaskFlow Kanban
- **Description**: A full-stack, real-time Agile task management Kanban board. Features persistent columns (To Do, In Progress, Done) with smooth drag-and-drop mechanics and instant database synchronization.
- **Technology Stack**: Java Spring Boot, Spring Data JPA, H2 Database, JavaScript (Vanilla), Tailwind/Glassmorphism CSS, HTML5 Drag and Drop API, Docker, Hugging Face Spaces.
- **Responsibilities**:
  - Developed backend REST endpoints to CRUD tasks and update task statuses using Spring Data JPA.
  - Built an interactive frontend using Vanilla JavaScript and HTML5 Drag-and-Drop API to handle drag events and trigger API requests.
  - Configured Docker containerization (multi-stage Dockerfile) and deployed the project to Hugging Face Spaces.
- **Outcome**: A fully functional, persistent Kanban application. Live deployment running at: [https://erc003-taskflow.hf.space](https://erc003-taskflow.hf.space).

## 3. EchoChat - Real-Time Communication Platform
- **Project Name**: EchoChat Private HQ
- **Description**: A professional-grade real-time chat matrix supporting multiple rooms. Offers secure, isolated communication through temporary rooms that are generated automatically.
- **Technology Stack**: Python, FastAPI, WebSockets, HTML5, Vanilla JavaScript, CSS Glassmorphism, Docker, Hugging Face Spaces.
- **Responsibilities**:
  - Implemented real-time WebSocket connection handlers in FastAPI.
  - Designed an auto-generated secure URL session mechanic allowing users to share room links for instant isolated group chats.
  - Engineered the client-side UI with a Discord-inspired layout, incorporating live debounced typing indicators, private whispers, and markdown message rendering.
- **Outcome**: Deployed a scalable, real-time chatting backend via Docker. Live deployment running at: [https://erc003-echochat.hf.space](https://erc003-echochat.hf.space).

## 4. AI Portfolio Assistant - Intelligent Chatbot
- **Project Name**: AI Portfolio Assistant (RAG Chatbot)
- **Description**: An intelligent, context-aware AI assistant integrated directly into the portfolio website. Uses a high-performance Retrieval-Augmented Generation (RAG) pipeline to query vector databases in the cloud and deliver factual, citation-backed answers about Mihir's experience, projects, skills, and resume.
- **Technology Stack**: Next.js, React, Tailwind CSS, Qdrant Cloud (Vector Database), Google Gemini API (gemini-2.5-flash & gemini-embedding-2), TypeScript, RAG Pipeline.
- **Responsibilities**:
  - Engineered the Retrieval-Augmented Generation (RAG) backend that vectorizes incoming questions and queries the Qdrant Cloud database.
  - Replaced local Ollama model dependencies with Google Gemini Cloud APIs (Gemini 2.5 Flash and Gemini Embedding 2), bringing latency down from 30+ seconds to under 1.5 seconds.
  - Implemented client-side floating chatbot component featuring suggested questions, auto-scrolling, status indicators, and markdown formatting support.
  - Configured robust fallback logic allowing the system to run on local Ollama models (`qwen2.5` & `nomic-embed-text`) during offline development.
- **Outcome**: Fully integrated cloud-powered AI chatbot deployed live at: [https://animated-portfolio-kohl.vercel.app/](https://animated-portfolio-kohl.vercel.app/).


## 5. PEMS - Personal Productivity Companion
- **Project Name**: Plant Equipment Maintenance System (PEMS) / Personal Companion
- **Description**: A comprehensive employee tracking and daily reporting system designed for high personal productivity. Includes modules for JWT authentication, live work timers, automated daily reports via AI, and iPhone PWA support.
- **Technology Stack**: Next.js 15, React, Tailwind CSS, Java Spring Boot 3, Supabase (PostgreSQL), JWT, Vercel, Railway.
- **Responsibilities**:
  - Developed a scalable REST API using Spring Boot with secure JWT-based stateless authentication and BCrypt password hashing.
  - Engineered the database schema in Supabase with over 14 tables, including attendance tracking, granular sessions, and leave balances.
  - Designed an immersive Next.js frontend featuring an iOS-compatible Progressive Web App (PWA) manifest, dark/light mode toggle, and live timers.
  - Deployed the frontend to Vercel and the backend to Railway.
- **Outcome**: Successfully shipped Phase 1 of a production-ready personal companion application, streamlining daily work reporting and tracking.

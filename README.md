<div align="center">

# 🚀 Mihir's Animated Portfolio & AI Assistant

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

**An immersive, animated personal portfolio integrated with a custom AI Assistant (RAG Chatbot).**

[Explore the Live Site](https://animated-portfolio.vercel.app) · [Report Bug](https://github.com/Mihir0003/animated-portfolio/issues)
</div>

---

## 🌟 Overview
Welcome to my animated portfolio! This repository houses a modern, responsive web portfolio built with Next.js and Tailwind CSS. The standout feature is a fully integrated **AI RAG (Retrieval-Augmented Generation) Chatbot** that allows visitors to "chat" directly with my digital persona to learn about my skills, experience, and projects.

## ✨ Features
- **Modern UI/UX**: Sleek design with smooth animations powered by Framer Motion and Tailwind CSS.
- **AI Portfolio Assistant**: A persistent, floating chat window that answers questions accurately using the Google Gemini 2.5 Flash API.
- **Vector Search (RAG)**: Uses local vector embeddings calculated via Gemini Embedding 2 for zero-latency semantic search over my knowledge base.
- **100% Serverless**: Designed for Vercel deployment without needing external database dependencies for basic retrieval.

---

## 📁 Architecture & Knowledge Base

The chatbot uses a robust RAG architecture:
1. **Knowledge (`knowledge/*.md`)**: Contains markdown files about my experience, skills, certifications, and projects.
2. **Ingestion (`npm run ingest`)**: A script that automatically chunks the markdown files and generates vector embeddings.
3. **Retrieval**: The Next.js API route measures Cosine Similarity between user queries and stored vectors to extract the exact context needed.

---

## 🚀 Live Projects Dashboard

| Project | Status | Link |
|---------|--------|------|
| **AI Portfolio Assistant** | 🟢 Live | [animated-portfolio.vercel.app](https://animated-portfolio.vercel.app) |
| **TaskFlow Kanban** | 🟢 Live | [erc003-taskflow.hf.space](https://erc003-taskflow.hf.space) |
| **EchoChat Private HQ** | 🟢 Live | [erc003-echochat.hf.space](https://erc003-echochat.hf.space) |
| **MicroStore Backend** | 🟡 Local | Run locally in `microstore` |

*(See the `Project_Links.md` file in this repository for quick access.)*

---

## 🛠️ Local Development

To run this project locally on your machine:

1. **Clone the repository**
   ```bash
   git clone https://github.com/Mihir0003/animated-portfolio.git
   cd animated-portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file and add your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the Vector Ingestion Script** (to build the AI's brain)
   ```bash
   npm run ingest
   ```

5. **Start the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view it in the browser!

---

<div align="center">
  <i>Built with passion by Mihir Amodwala.</i>
</div>

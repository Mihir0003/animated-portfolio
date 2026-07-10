<div align="center">

# 🚀 Mihir's Animated Cyberpunk Portfolio

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)](https://git-scm.com/)

**An immersive, animated personal portfolio integrated with a custom AI Assistant (RAG Chatbot) and an interactive 3D Cyber-Mech Mascot.**

👉 **[Explore the Live Site](https://animated-portfolio-kohl.vercel.app)** 👈  
*(Note: Ensure you visit the `-kohl` URL for the live production environment)*

</div>

---

## 🌟 Overview
Welcome to my animated portfolio! This repository houses a modern, highly responsive web portfolio built with Next.js, Tailwind CSS, and Framer Motion. It is designed to demonstrate full-stack engineering capabilities, deep integration of artificial intelligence, and advanced frontend physics.

## ✨ Standout Features

### 🤖 1. Interactive Cyber-Mech Mascot
- **Velocity Tracking:** A custom-built SVG humanoid mech suit that mathematically calculates your mouse speed and dynamically follows your cursor across the screen.
- **Physics Engine:** Powered by Framer Motion springs, the mascot smoothly transitions between walking cycles, hovering idles, and snapping pivots.
- **Premium Aesthetics:** Features 3D metallic armor gradients, glowing neon `<filter>` effects, and fully articulated joints.

### 💬 2. AI RAG Chatbot (Gemini)
- **Knowledge Retrieval:** Visitors can "chat" directly with my digital persona to learn about my skills, experience, and projects.
- **Vector Search (RAG):** Uses local vector embeddings calculated via Gemini Embedding 2 for zero-latency semantic search over my personal knowledge base.

### ⚡ 3. 100% Serverless Architecture
- Designed exclusively for Vercel deployment without needing heavy external databases for basic retrieval, ensuring blazing fast load times.

---

## 📁 Architecture & Knowledge Base

The chatbot uses a robust RAG architecture:
1. **Knowledge (`knowledge/*.md`)**: Contains markdown files about my experience, skills, certifications, and projects.
2. **Ingestion (`npm run ingest`)**: A script that automatically chunks the markdown files and generates vector embeddings.
3. **Retrieval**: The Next.js API route measures Cosine Similarity between user queries and stored vectors to extract the exact context needed.

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

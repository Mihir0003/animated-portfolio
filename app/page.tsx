"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, Mail, Linkedin, Github, Phone, MapPin, ExternalLink, Calendar, Award, GraduationCap, ChevronRight } from "lucide-react";
import ChatBot from "@/components/chatbot/ChatBot";

// Typewriter Hook for Hero Section
const useTypewriter = (text: string, speed = 80, delay = 1200) => {
  const [displayText, setDisplayText] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let index = 0;
    let timer: NodeJS.Timeout;
    
    const startTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayText((prev) => prev + text.charAt(index));
          index++;
        } else {
          clearInterval(interval);
          // Blink cursor briefly then hide it
          timer = setTimeout(() => {
            setShowCursor(false);
          }, 2000);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);

    return () => {
      clearTimeout(startTimeout);
      clearTimeout(timer);
    };
  }, [text, speed, delay]);

  return { displayText, showCursor };
};

export default function Home() {
  const { displayText, showCursor } = useTypewriter("Mihir Amodwala", 80, 1200);

  // Smooth scroll helper
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="text-text-primary min-h-screen relative font-space">
      {/* Background Cyberpunk Mesh Overlay */}
      <div className="absolute inset-0 bg-grid-pattern bg-[length:56px_56px] opacity-[0.28] pointer-events-none z-[-2]" />
      
      {/* Floating Navigation */}
      <motion.nav 
        initial={{ y: -50, opacity: 0, x: "-50%" }}
        animate={{ y: 0, opacity: 1, x: "-50%" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-5 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[1100px] bg-[#071222]/75 border border-glass-border rounded-full py-3.5 px-6 md:px-8 flex items-center justify-between shadow-2xl backdrop-blur-md z-[100] overflow-hidden glass-nav-sweep"
      >
        <div className="logo font-orbitron font-bold text-sm tracking-[0.12em] text-white select-none">
          Mihir Amodwala.
        </div>
        
        <ul className="hidden md:flex items-center gap-8 list-none">
          {["hero", "experience", "projects", "contact"].map((section) => (
            <li key={section}>
              <a
                href={`#${section}`}
                onClick={(e) => handleScroll(e, section)}
                className="text-xs uppercase tracking-[0.11em] font-bold text-text-secondary/95 hover:text-white transition-colors relative group py-1"
              >
                {section === "hero" ? "Home" : section === "experience" ? "Experience" : section}
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-accent-1 to-accent-2 scale-x-0 origin-right group-hover:scale-x-100 group-hover:origin-left transition-transform duration-300" />
              </a>
            </li>
          ))}
        </ul>

        <div>
          <a
            href="#contact"
            onClick={(e) => handleScroll(e, "contact")}
            className="text-xs px-5 py-2 rounded-full border border-accent-1/30 bg-accent-1/5 text-accent-1 font-orbitron font-semibold uppercase tracking-wider hover:bg-accent-1 hover:text-bg-deep hover:shadow-[0_0_15px_rgba(77,228,255,0.3)] transition-all duration-300 active:scale-95"
          >
            Hire Me
          </a>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <header id="hero" className="min-h-screen max-w-[1120px] mx-auto px-6 flex flex-col justify-center pt-24 pb-16">
        <div className="max-w-[800px] flex flex-col items-start gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="inline-flex items-center gap-2 border border-accent-1/40 bg-accent-1/10 text-accent-1 px-4 py-2 rounded-full text-xs uppercase tracking-wider font-bold"
          >
            <Bot size={14} className="animate-pulse" />
            Information Technology Student (B.Tech 2026)
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-orbitron font-extrabold text-4xl sm:text-6xl md:text-7xl leading-[1.08] tracking-wide"
          >
            Hi, I'm{" "}
            <span 
              className="gradient-text transition-all"
              style={{
                borderRight: showCursor ? "2px solid var(--accent-1)" : "2px solid transparent"
              }}
            >
              {displayText}
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-text-secondary text-base sm:text-xl max-w-[700px] leading-relaxed"
          >
            I am a full-stack developer with a strong foundation in enterprise systems, certified in Advance Java, and highly skilled in Spring Boot, Python FastAPI, WebSockets, relational database design (MSSQL, MySQL), and modern web engineering. Welcome to my creative portfolio.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4"
          >
            <a
              href="#experience"
              onClick={(e) => handleScroll(e, "experience")}
              className="flex justify-center items-center gap-2 h-13 px-8 rounded-xl font-orbitron font-bold text-sm tracking-wider uppercase bg-gradient-to-r from-accent-1 to-accent-3 text-bg-deep shadow-[0_10px_24px_rgba(52,245,179,0.25)] hover:shadow-[0_14px_30px_rgba(52,245,179,0.35)] hover:-translate-y-0.5 transition-all duration-300"
            >
              Explore My Journey <ChevronRight size={16} />
            </a>
            <a
              href="#contact"
              onClick={(e) => handleScroll(e, "contact")}
              className="flex justify-center items-center h-13 px-8 rounded-xl font-orbitron font-bold text-sm tracking-wider uppercase border border-white/20 bg-bg-mid/30 hover:border-accent-1/60 hover:bg-bg-mid/50 text-white hover:-translate-y-0.5 transition-all duration-300"
            >
              Contact Me
            </a>
          </motion.div>
        </div>
      </header>

      {/* Experience & Education Section */}
      <section id="experience" className="py-24 max-w-[1120px] mx-auto px-6">
        <div className="text-center flex flex-col items-center gap-3 mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="font-orbitron font-bold text-3xl sm:text-5xl"
          >
            Experience & <span className="gradient-text">Education</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-text-secondary text-sm sm:text-base max-w-[500px]"
          >
            A timeline of my academic path and professional growth
          </motion.p>
        </div>

        {/* Timeline */}
        <div className="relative max-w-[860px] mx-auto">
          {/* Central Line */}
          <div className="absolute top-0 bottom-0 left-6 sm:left-8 w-[2px] bg-gradient-to-b from-transparent via-accent-1 to-accent-2" />

          {/* Timeline Items */}
          <div className="space-y-12">
            
            {/* Jio bp Internship */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative pl-14 sm:pl-20"
            >
              {/* Dot */}
              <div className="absolute top-7 left-3.5 sm:left-5 w-5 h-5 rounded-full bg-bg-deep border-3 border-accent-1 shadow-[0_0_14px_rgba(77,228,255,0.6)] z-10 hover:scale-115 transition-transform" />
              
              {/* Card */}
              <div className="bg-bg-surface/50 border border-glass-border rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md hover:border-accent-1/50 hover:shadow-[0_0_30px_rgba(77,228,255,0.15)] transition-all duration-300">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 text-xs text-accent-1 font-bold tracking-wider uppercase bg-accent-1/10 px-3 py-1 rounded-full border border-accent-1/20">
                    <Calendar size={12} /> Jan 2026 – June 2026
                  </span>
                  <span className="text-xs text-text-secondary/70">Jio-bp (Reliance BP Mobility Limited)</span>
                </div>
                <h3 className="font-orbitron font-bold text-xl md:text-2xl text-white">Digital Team Intern</h3>
                <h4 className="text-accent-2 font-semibold text-sm md:text-base mt-1 mb-4 flex items-center gap-2">
                  <Award size={16} /> Project: AFS NOC Platform Technical Upgradation
                </h4>
                <p className="text-text-secondary text-sm md:text-base leading-relaxed mb-4">
                  Contributed to the modern, full-stack technical upgrade of the Aviation Fuel Station Network Operations Center platform, designed and engineered a metadata-driven dynamic form engine from scratch.
                </p>
                <ul className="list-disc pl-5 text-sm text-text-secondary/80 space-y-2 mb-6">
                  <li><strong>Advanced Spring Boot:</strong> Built robust layered architectures (Controller, Service, Repository, DTO design patterns) adhering to clean code standards.</li>
                  <li><strong>Dynamic Forms & APIs:</strong> Engineered a system mapping parent/child dynamic UI layouts to normalized SQL tables, building secure endpoints for Flutter mobile integrations.</li>
                  <li><strong>SQL Server Administration:</strong> Set up transaction-based form tracking and optimized complex relational schemas using SSMS query development.</li>
                  <li><strong>Optimizations:</strong> Restructured backend repository methods via Spring Data JPA, reducing API latency and improving query efficiency.</li>
                </ul>
                <div className="flex flex-wrap gap-2">
                  {["Java Spring Boot", "MySQL", "Microsoft SQL Server", "REST APIs", "System Design"].map((tag) => (
                    <span key={tag} className="text-xs px-3 py-1 rounded-full border border-white/10 bg-[#0a1627]/80 text-text-secondary hover:border-accent-1/40 hover:text-white transition-colors duration-200">{tag}</span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* B.Tech */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative pl-14 sm:pl-20"
            >
              {/* Dot */}
              <div className="absolute top-7 left-3.5 sm:left-5 w-5 h-5 rounded-full bg-bg-deep border-3 border-accent-2 shadow-[0_0_14px_rgba(255,143,63,0.55)] z-10 hover:scale-115 transition-transform" />
              
              {/* Card */}
              <div className="bg-bg-surface/50 border border-glass-border rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md hover:border-accent-2/50 hover:shadow-[0_0_30px_rgba(255,143,63,0.15)] transition-all duration-300">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 text-xs text-accent-2 font-bold tracking-wider uppercase bg-accent-2/10 px-3 py-1 rounded-full border border-accent-2/20">
                    <GraduationCap size={12} /> 2023 – 2026
                  </span>
                  <span className="text-xs text-text-secondary/70">Vadodara, Gujarat, India</span>
                </div>
                <h3 className="font-orbitron font-bold text-xl md:text-2xl text-white">B.Tech. Lateral – Information Technology</h3>
                <h4 className="text-accent-3 font-semibold text-sm md:text-base mt-1 mb-4">
                  Parul University (PIET)
                </h4>
                <p className="text-text-secondary text-sm md:text-base leading-relaxed mb-5">
                  Pursuing advanced studies in Information Technology with a core focus on enterprise programming, database normalization, cloud architectures, and data analysis. Currently holding an academic grade CGPA of <strong>7.87 / 10</strong>.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Advance Java Certification", "Python", "Data Visualization", "Enterprise Architectures"].map((tag) => (
                    <span key={tag} className="text-xs px-3 py-1 rounded-full border border-white/10 bg-[#0a1627]/80 text-text-secondary hover:border-accent-2/40 hover:text-white transition-colors duration-200">{tag}</span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Diploma */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative pl-14 sm:pl-20"
            >
              {/* Dot */}
              <div className="absolute top-7 left-3.5 sm:left-5 w-5 h-5 rounded-full bg-bg-deep border-3 border-accent-1 shadow-[0_0_14px_rgba(77,228,255,0.6)] z-10 hover:scale-115 transition-transform" />
              
              {/* Card */}
              <div className="bg-bg-surface/50 border border-glass-border rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md hover:border-accent-1/50 hover:shadow-[0_0_30px_rgba(77,228,255,0.15)] transition-all duration-300">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 text-xs text-accent-1 font-bold tracking-wider uppercase bg-accent-1/10 px-3 py-1 rounded-full border border-accent-1/20">
                    <GraduationCap size={12} /> Completed in 2023
                  </span>
                  <span className="text-xs text-text-secondary/70">Ahmedabad, Gujarat, India</span>
                </div>
                <h3 className="font-orbitron font-bold text-xl md:text-2xl text-white">Diploma – Information Technology</h3>
                <h4 className="text-accent-2 font-semibold text-sm md:text-base mt-1 mb-4">
                  Aditya SilverOak University
                </h4>
                <p className="text-text-secondary text-sm md:text-base leading-relaxed mb-5">
                  Acquired foundational knowledge in computer programming, relational database engines, algorithm structures, and modern web markup languages. Graduated with a CGPA of <strong>7.97 / 10</strong>.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Web Design", "C++", "Database Concepts", "Data Structures"].map((tag) => (
                    <span key={tag} className="text-xs px-3 py-1 rounded-full border border-white/10 bg-[#0a1627]/80 text-text-secondary hover:border-accent-1/40 hover:text-white transition-colors duration-200">{tag}</span>
                  ))}
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section id="projects" className="py-24 max-w-[1120px] mx-auto px-6">
        <div className="text-center flex flex-col items-center gap-3 mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="font-orbitron font-bold text-3xl sm:text-5xl"
          >
            Featured <span className="gradient-text">Projects</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-text-secondary text-sm sm:text-base max-w-[500px]"
          >
            Showcasing backend services, distributed systems, and real-time platforms
          </motion.p>
        </div>

        <div className="flex flex-col gap-12 items-center">
          
          {/* Project 1 - MicroStore */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-[850px] bg-bg-surface/50 border border-glass-border rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md hover:border-accent-1/50 hover:shadow-[0_0_40px_rgba(77,228,255,0.18)] transition-all duration-300"
          >
            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
              <div>
                <h3 className="font-orbitron font-bold text-2xl text-accent-1">MicroStore - E-Commerce Microservices</h3>
                <h4 className="text-white font-medium text-sm mt-1">Distributed Cloud Architecture</h4>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 border border-accent-1/30 bg-accent-1/5 text-accent-1 rounded">
                Backend Intensive
              </span>
            </div>
            
            <p className="text-text-secondary text-sm md:text-base leading-relaxed mb-5">
              An enterprise-grade, scalable E-Commerce system featuring a decoupled <strong>Product Service</strong> and independent <strong>Order Service</strong>. Showcases a custom, futuristic shopping dashboard that manages state securely before executing multi-item purchase transactions across JVM nodes.
            </p>
            
            <ul className="list-disc pl-5 text-sm text-text-secondary/80 space-y-2 mb-6">
              <li><strong>Service Decoupling:</strong> Complete segregation of product inventory from order processing using independent Spring Boot JVMs and separate databases.</li>
              <li><strong>Network RestTemplates:</strong> Synchronous RestTemplate communication automatically processes multi-item purchases directly against isolated databases.</li>
              <li><strong>Cyberpunk Shop UI:</strong> Features an immersive dark aesthetic with INR currency formatting, global cart tracking, async mock payment gateways, and custom keyframe delivery animations.</li>
            </ul>

            <div className="flex flex-wrap gap-2 mb-8">
              {["Java Spring Boot", "Microservices", "REST Communication", "Distributed Databases"].map((tag) => (
                <span key={tag} className="text-xs px-3 py-1 rounded-full border border-white/10 bg-[#0a1627]/80 text-text-secondary">{tag}</span>
              ))}
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary/60 italic font-sans">
                GitHub Repository: Coming Soon
              </span>
            </div>
          </motion.div>

          {/* Project 2 - TaskFlow */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-[850px] bg-bg-surface/50 border border-glass-border rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md hover:border-accent-2/50 hover:shadow-[0_0_40px_rgba(255,143,63,0.18)] transition-all duration-300"
          >
            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
              <div>
                <h3 className="font-orbitron font-bold text-2xl text-accent-2">TaskFlow - Agile Kanban Board</h3>
                <h4 className="text-white font-medium text-sm mt-1">Full-Stack Cloud Application</h4>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 border border-accent-2/30 bg-accent-2/5 text-accent-2 rounded">
                Live Deployment
              </span>
            </div>

            <p className="text-text-secondary text-sm md:text-base leading-relaxed mb-5">
              A full-stack, real-time Agile task management system. Features a robust Java Spring Boot REST API for cleanly handling task states via JPA, and a beautifully designed glassmorphism Vanilla JS frontend utilizing the HTML5 Drag-and-Drop API for seamless state updates and persistent tracking.
            </p>

            <ul className="list-disc pl-5 text-sm text-text-secondary/80 space-y-2 mb-6">
              <li><strong>Persistence API:</strong> Developed Spring Boot REST endpoints for dynamic CRUD and status operations, backed by Spring Data JPA.</li>
              <li><strong>Drag-and-Drop Interaction:</strong> Integrated Vanilla JS logic wrapping the HTML5 drag event handlers to enable immediate column transitions and REST sync.</li>
              <li><strong>Docker & HF Spaces Deployment:</strong> Containerized the application using multi-stage builds and successfully deployed the Docker configuration to Hugging Face Spaces cloud.</li>
            </ul>

            <div className="flex flex-wrap gap-2 mb-8">
              {["Java Spring Boot", "Spring Data JPA", "Vanilla JS", "HTML5 Drag & Drop", "Docker"].map((tag) => (
                <span key={tag} className="text-xs px-3 py-1 rounded-full border border-white/10 bg-[#0a1627]/80 text-text-secondary">{tag}</span>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <a
                href="https://erc003-taskflow.hf.space"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-transparent bg-gradient-to-r from-accent-2 to-accent-3 text-bg-deep font-orbitron font-bold text-xs uppercase tracking-wider hover:shadow-[0_0_15px_rgba(255,143,63,0.3)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                ⚡ View Live Kanban Board <ExternalLink size={14} />
              </a>
              <a
                href="https://github.com/Mihir0003/taskflow-app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-white/20 bg-bg-mid/30 hover:border-accent-2 hover:bg-bg-mid/50 text-white font-orbitron font-bold text-xs uppercase tracking-wider hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                <Github size={14} /> View Repository <ExternalLink size={14} />
              </a>
            </div>
          </motion.div>

          {/* Project 3 - EchoChat */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-[850px] bg-bg-surface/50 border border-glass-border rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md hover:border-accent-3/50 hover:shadow-[0_0_40px_rgba(52,245,179,0.18)] transition-all duration-300"
          >
            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
              <div>
                <h3 className="font-orbitron font-bold text-2xl text-accent-3">EchoChat - Private HQ Chat</h3>
                <h4 className="text-white font-medium text-sm mt-1">Real-Time WebSockets & FastAPI System</h4>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 border border-accent-3/30 bg-accent-3/5 text-accent-3 rounded">
                Live Deployment
              </span>
            </div>

            <p className="text-text-secondary text-sm md:text-base leading-relaxed mb-5">
              A professional-grade real-time chat matrix engineered with a high-performance Python <strong>FastAPI</strong> backend. The system unifies HTTP static file serving and dynamic WebSockets onto a single port, enabling seamless cloud deployments. Features auto-generated secure URL sessions with 1-click shareable invite links, guaranteeing peer isolation. The immersive UI executes live debounced typing indicators, private whisper handling, and markdown parsing.
            </p>

            <ul className="list-disc pl-5 text-sm text-text-secondary/80 space-y-2 mb-6">
              <li><strong>WebSocket Matrix:</strong> Created server-side WebSocket session managers in Python FastAPI to support real-time room communication.</li>
              <li><strong>Secure Sharing:</strong> Built URL-hashed sessions for temporary invite links, ensuring secure user isolation across chats.</li>
              <li><strong>Immersive Chat Experience:</strong> Designed layout in HTML/CSS with debounced typing indicators, Markdown formatting support, and direct whisper messaging.</li>
            </ul>

            <div className="flex flex-wrap gap-2 mb-8">
              {["Python FastAPI", "WebSockets", "Vanilla JS", "Docker Container", "Real-Time Systems"].map((tag) => (
                <span key={tag} className="text-xs px-3 py-1 rounded-full border border-white/10 bg-[#0a1627]/80 text-text-secondary">{tag}</span>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <a
                href="https://erc003-echochat.hf.space"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-transparent bg-gradient-to-r from-accent-3 to-accent-1 text-bg-deep font-orbitron font-bold text-xs uppercase tracking-wider hover:shadow-[0_0_15px_rgba(52,245,179,0.3)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                💬 Join Live Chat Room! <ExternalLink size={14} />
              </a>
              <a
                href="https://github.com/Mihir0003/echochat"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-white/20 bg-bg-mid/30 hover:border-accent-3 hover:bg-bg-mid/50 text-white font-orbitron font-bold text-xs uppercase tracking-wider hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                <Github size={14} /> View Repository <ExternalLink size={14} />
              </a>
            </div>
          </motion.div>

          {/* Project 4 - AI Portfolio Assistant */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-[850px] bg-bg-surface/50 border border-glass-border rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md hover:border-accent-1/50 hover:shadow-[0_0_40px_rgba(77,228,255,0.18)] transition-all duration-300"
          >
            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
              <div>
                <h3 className="font-orbitron font-bold text-2xl text-accent-1">AI Portfolio Assistant - Intelligent Chatbot</h3>
                <h4 className="text-white font-medium text-sm mt-1">Serverless Cloud AI & RAG Pipeline</h4>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 border border-accent-1/30 bg-accent-1/5 text-accent-1 rounded">
                Live Deployment
              </span>
            </div>

            <p className="text-text-secondary text-sm md:text-base leading-relaxed mb-5">
              An intelligent, context-aware AI assistant integrated directly into this portfolio website. Uses a high-performance **Retrieval-Augmented Generation (RAG)** pipeline to query vector databases in the cloud and deliver factual, citation-backed answers about professional experience, projects, skills, and resume details in real time.
            </p>

            <ul className="list-disc pl-5 text-sm text-text-secondary/80 space-y-2 mb-6">
              <li><strong>Google Gemini Cloud API</strong>: Leverages Gemini 2.5 Flash for low-latency text generation and Gemini-embedding-2 for fast vector generation, bringing latency to under 1.5 seconds.</li>
              <li><strong>Qdrant Cloud Integration</strong>: Interfaces with a hosted Qdrant Vector Database containing vectorized semantic knowledge base chunks of the candidate's resume and qualifications.</li>
              <li><strong>Local-to-Cloud Fallback</strong>: Engineered a flexible fallback routing to local Ollama models (`qwen2.5` & `nomic-embed-text`) for fully offline local testing.</li>
            </ul>

            <div className="flex flex-wrap gap-2 mb-8">
              {["Next.js", "Qdrant Cloud", "Google Gemini API", "Vector Embeddings", "RAG Pipeline", "Serverless Functions"].map((tag) => (
                <span key={tag} className="text-xs px-3 py-1 rounded-full border border-white/10 bg-[#0a1627]/80 text-text-secondary">{tag}</span>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <a
                href="https://animated-portfolio-kohl.vercel.app/"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-transparent bg-gradient-to-r from-accent-1 to-accent-3 text-bg-deep font-orbitron font-bold text-xs uppercase tracking-wider hover:shadow-[0_0_15px_rgba(77,228,255,0.3)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                ⚡ Live Application <ExternalLink size={14} />
              </a>
              <a
                href="https://github.com/Mihir0003/animated-portfolio"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-white/20 bg-bg-mid/30 hover:border-accent-1 hover:bg-bg-mid/50 text-white font-orbitron font-bold text-xs uppercase tracking-wider hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                <Github size={14} /> View Repository <ExternalLink size={14} />
              </a>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Footer / Contact Section */}
      <footer id="contact" className="py-24 max-w-[1120px] mx-auto px-6 relative">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="bg-bg-surface/50 border border-glass-border rounded-3xl p-8 md:p-12 text-center flex flex-col items-center gap-6 shadow-2xl backdrop-blur-md"
        >
          <h2 className="font-orbitron font-bold text-3xl sm:text-5xl text-white">
            Let's build something <span className="gradient-text">amazing</span> together.
          </h2>
          
          <p className="text-text-secondary text-sm sm:text-base max-w-[550px] leading-relaxed">
            Interested in hiring me as an intern or full-stack software engineer? Reach out directly via email, connect on LinkedIn, or inspect my GitHub repositories.
          </p>

          <div className="flex flex-wrap gap-4 justify-center items-center mt-4">
            <a
              href="mailto:mihumodi@gmail.com"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider bg-gradient-to-br from-accent-1 to-accent-3 text-bg-deep shadow-[0_10px_24px_rgba(77,228,255,0.2)] hover:shadow-[0_14px_30px_rgba(77,228,255,0.3)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
            >
              <Mail size={16} /> Email: mihumodi@gmail.com
            </a>
            <a
              href="https://linkedin.com/in/mihir-amodwala-8ba3a7279"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-white/20 bg-bg-mid/30 hover:border-accent-1 hover:bg-bg-mid/50 text-white font-orbitron font-bold text-xs uppercase tracking-wider hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
            >
              <Linkedin size={16} /> LinkedIn Profile <ExternalLink size={14} />
            </a>
          </div>

          <div className="flex flex-wrap gap-6 items-center justify-center text-xs text-text-secondary/70 mt-6 border-t border-white/10 pt-8 w-full max-w-[600px]">
            <span className="flex items-center gap-1.5"><Phone size={14} className="text-accent-2" /> +91-9724296359</span>
            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-accent-3" /> Bharuch, Gujarat, India</span>
          </div>

          <p className="text-[10px] text-text-secondary/40 mt-6 select-none">
            © {new Date().getFullYear()} Mihir Amodwala. All rights reserved. Registered for Vercel Deployments.
          </p>
        </motion.div>
      </footer>

      {/* Floating RAG Chatbot widget in the bottom-right corner */}
      <ChatBot />
    </div>
  );
}

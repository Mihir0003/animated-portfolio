"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

const IDLE_MESSAGES = [
  "Need help?",
  "Explore my projects 🚀",
  "Ask me anything.",
  "Let's build something amazing!",
];

export const AIMascot = () => {
  const mascotRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [idleMessage, setIdleMessage] = useState<string | null>(null);
  const [isYawning, setIsYawning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Mouse Tracking values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150 };
  const eyeX = useSpring(mouseX, springConfig);
  const eyeY = useSpring(mouseY, springConfig);
  const headRotate = useSpring(useMotionValue(0), springConfig);

  // Blinking logic
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    // Check if mobile (reduce motion / disable tracking)
    if (typeof window !== "undefined") {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    }

    let idleTimer: NodeJS.Timeout;
    let messageTimer: NodeJS.Timeout;
    let blinkTimer: NodeJS.Timeout;

    // --- Cursor Tracking & Idle Timers ---
    const handleMouseMove = (e: MouseEvent) => {
      // Reset Idle Timer on activity
      clearTimeout(idleTimer);
      setIsYawning(false);
      idleTimer = setTimeout(() => {
        setIsYawning(true);
      }, 60000); // 60s idle -> yawn

      if (isMobile || !mascotRef.current) return;

      const rect = mascotRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let dx = e.clientX - centerX;
      let dy = e.clientY - centerY;

      const angle = Math.atan2(dy, dx);
      const distance = Math.min(Math.sqrt(dx * dx + dy * dy) * 0.03, 6);

      mouseX.set(Math.cos(angle) * distance);
      mouseY.set(Math.sin(angle) * distance);
      headRotate.set(Math.cos(angle) * (distance * 1.5)); // max 9 degrees rotation
    };

    if (!isMobile) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    // --- Random Idle Messages ---
    const triggerRandomMessage = () => {
      if (!isHovered && !isYawning) {
        const randomMsg = IDLE_MESSAGES[Math.floor(Math.random() * IDLE_MESSAGES.length)];
        setIdleMessage(randomMsg);
        setTimeout(() => setIdleMessage(null), 5000); // clear after 5s
      }
      messageTimer = setTimeout(triggerRandomMessage, 25000 + Math.random() * 10000); // 25-35s
    };
    messageTimer = setTimeout(triggerRandomMessage, 20000);

    // --- Blinking ---
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
      blinkTimer = setTimeout(triggerBlink, 3000 + Math.random() * 4000);
    };
    blinkTimer = setTimeout(triggerBlink, 2000);

    // --- Section Observer ---
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    const sections = ["projects", "experience", "contact"];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(idleTimer);
      clearTimeout(messageTimer);
      clearTimeout(blinkTimer);
      observer.disconnect();
    };
  }, [isMobile, mouseX, mouseY, headRotate, isHovered, isYawning]);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => {
      setIsClicked(false);
      window.dispatchEvent(new CustomEvent("open-chatbot"));
    }, 600);
  };

  // Determine current active message
  let displayMessage = idleMessage;
  if (isHovered) displayMessage = "Hi 👋 I'm Mihir's AI Assistant.";
  if (isYawning) displayMessage = "Zzz... 😴";
  if (activeSection === "contact") displayMessage = "Let's get in touch!";

  return (
    <div className="fixed bottom-24 right-6 z-[9990] flex flex-col items-center pointer-events-none">
      
      {/* Speech Bubble */}
      <AnimatePresence>
        {displayMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="mb-4 relative bg-bg-deep border border-[#00E5FF]/40 text-[#00E5FF] px-4 py-2 rounded-xl text-sm font-space font-medium shadow-[0_0_15px_rgba(0,229,255,0.2)] backdrop-blur-md whitespace-nowrap"
          >
            {displayMessage}
            <div className="absolute -bottom-2 right-6 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-bg-deep filter drop-shadow-[0_2px_2px_rgba(0,229,255,0.4)]"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mascot Container */}
      <motion.div
        ref={mascotRef}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative cursor-pointer pointer-events-auto"
        animate={{
          y: isClicked ? [0, -30, 0] : [-5, 5, -5],
        }}
        transition={{
          y: isClicked
            ? { duration: 0.6, type: "spring", bounce: 0.6 }
            : { duration: 4, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        {/* Subtle Glow */}
        <div className="absolute inset-0 bg-[#00E5FF]/20 rounded-full blur-2xl transform scale-150 animate-pulse"></div>

        {/* SVG Mascot */}
        <svg
          width="80"
          height="100"
          viewBox="0 0 100 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-2xl relative z-10"
        >
          {/* Back of Hoodie / Body */}
          <path
            d="M 25 110 C 25 70, 75 70, 75 110"
            fill="#111827"
            stroke="#1F2937"
            strokeWidth="3"
          />
          <path d="M 20 120 L 25 110 L 75 110 L 80 120 Z" fill="#0F172A" />

          {/* Left Arm (Waves on hover) */}
          <motion.g
            animate={isHovered ? { rotate: [0, -30, 20, -20, 0] } : { rotate: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{ originX: "60px", originY: "80px" }}
          >
            <path d="M 70 85 C 85 85, 95 70, 90 60" stroke="#111827" strokeWidth="12" strokeLinecap="round" />
            {/* Hand */}
            <circle cx="90" cy="60" r="5" fill="#00E5FF" className="drop-shadow-[0_0_5px_rgba(0,229,255,0.8)]" />
          </motion.g>

          {/* Head & Hood */}
          <motion.g style={{ rotate: headRotate, originX: "50px", originY: "50px" }}>
            {/* Hood Outer */}
            <path
              d="M 30 75 C 20 30, 80 30, 70 75"
              fill="#111827"
              stroke="#00E5FF"
              strokeWidth="1.5"
              strokeOpacity="0.3"
            />
            {/* Face/Void */}
            <path
              d="M 35 70 C 30 45, 70 45, 65 70 C 65 80, 35 80, 35 70"
              fill="#020617"
            />

            {/* Glowing Eyes */}
            <motion.g style={{ x: eyeX, y: eyeY }}>
              {!isYawning ? (
                <>
                  {/* Left Eye */}
                  <motion.rect
                    x="42"
                    y="55"
                    width="6"
                    height="10"
                    rx="3"
                    fill="#00E5FF"
                    className="drop-shadow-[0_0_8px_rgba(0,229,255,0.9)]"
                    animate={{ scaleY: isBlinking ? 0.1 : 1 }}
                    transition={{ duration: 0.1 }}
                    style={{ originY: "60px" }}
                  />
                  {/* Right Eye */}
                  <motion.rect
                    x="52"
                    y="55"
                    width="6"
                    height="10"
                    rx="3"
                    fill="#00E5FF"
                    className="drop-shadow-[0_0_8px_rgba(0,229,255,0.9)]"
                    animate={{ scaleY: isBlinking ? 0.1 : 1 }}
                    transition={{ duration: 0.1 }}
                    style={{ originY: "60px" }}
                  />
                </>
              ) : (
                <>
                  {/* Closed Eyes (Yawning) */}
                  <path d="M 40 60 Q 45 55 50 60" stroke="#00E5FF" strokeWidth="2" fill="none" opacity="0.5" />
                  <path d="M 50 60 Q 55 55 60 60" stroke="#00E5FF" strokeWidth="2" fill="none" opacity="0.5" />
                </>
              )}
            </motion.g>
          </motion.g>

          {/* Floating Laptop */}
          <motion.g
            animate={{ y: [-2, 2, -2], rotate: [-1, 1, -1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            {/* Laptop Base */}
            <path d="M 25 90 L 75 90 L 85 98 L 15 98 Z" fill="#1E293B" />
            <path d="M 15 98 L 85 98 L 85 102 L 15 102 Z" fill="#0F172A" />
            {/* Laptop Screen glow */}
            <path d="M 28 88 L 72 88 L 68 75 L 32 75 Z" fill="#00E5FF" opacity="0.2" className="drop-shadow-[0_0_10px_rgba(0,229,255,0.6)]" />
            <path d="M 32 75 L 68 75 L 72 88 L 28 88 Z" stroke="#00E5FF" strokeWidth="1" fill="none" />
          </motion.g>

          {/* Contextual Props (Briefcase, Wrench, Envelope) */}
          <AnimatePresence>
            {activeSection === "projects" && (
              <motion.g
                initial={{ opacity: 0, scale: 0, rotate: -45 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0 }}
                className="drop-shadow-lg"
              >
                {/* Tiny Wrench */}
                <path d="M 15 65 C 10 60, 20 50, 25 55 L 40 70 L 35 75 Z" fill="#94A3B8" />
                <circle cx="18" cy="58" r="2" fill="#0F172A" />
              </motion.g>
            )}
            {activeSection === "experience" && (
              <motion.g
                initial={{ opacity: 0, scale: 0, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0 }}
              >
                {/* Tiny Briefcase */}
                <rect x="10" y="65" width="20" height="15" rx="2" fill="#8B5CF6" />
                <path d="M 15 65 L 15 60 L 25 60 L 25 65" stroke="#A78BFA" strokeWidth="2" fill="none" />
              </motion.g>
            )}
            {activeSection === "contact" && (
              <motion.g
                initial={{ opacity: 0, scale: 0, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0 }}
              >
                {/* Tiny Envelope */}
                <rect x="10" y="70" width="20" height="12" fill="#10B981" />
                <path d="M 10 70 L 20 76 L 30 70" stroke="#D1FAE5" strokeWidth="1.5" fill="none" />
              </motion.g>
            )}
          </AnimatePresence>

        </svg>
      </motion.div>
    </div>
  );
};

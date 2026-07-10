"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence, useVelocity, useMotionValueEvent } from "framer-motion";

const IDLE_MESSAGES = [
  "Need help?",
  "Explore my projects 🗄️",
  "Ask me anything",
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

  // Animation States
  const [isWalking, setIsWalking] = useState(false);
  const [facingRight, setFacingRight] = useState(true);

  // Mouse Tracking values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const targetRobotX = useMotionValue(0); 

  const springConfig = { damping: 25, stiffness: 150 };
  const eyeX = useSpring(mouseX, springConfig);
  const eyeY = useSpring(mouseY, springConfig);
  const headRotate = useSpring(useMotionValue(0), springConfig);
  
  // Robot horizontal spring (Stiffer and snappier to fix gap issue!)
  const robotX = useSpring(targetRobotX, { damping: 22, stiffness: 220 });
  const robotVelocity = useVelocity(robotX);

  useMotionValueEvent(robotVelocity, "change", (latest) => {
    // Threshold to detect walking
    if (Math.abs(latest) > 15) {
      setIsWalking(true);
      setFacingRight(latest > 0);
    } else {
      setIsWalking(false);
    }
  });

  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    }

    let idleTimer: NodeJS.Timeout;
    let messageTimer: NodeJS.Timeout;
    let blinkTimer: NodeJS.Timeout;

    const handleMouseMove = (e: MouseEvent) => {
      clearTimeout(idleTimer);
      setIsYawning(false);
      idleTimer = setTimeout(() => {
        setIsYawning(true);
      }, 60000); 

      if (isMobile || !mascotRef.current) return;

      const rect = mascotRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let dx = e.clientX - centerX;
      let dy = e.clientY - centerY;

      const angle = Math.atan2(dy, dx);
      const distance = Math.min(Math.sqrt(dx * dx + dy * dy) * 0.03, 6);

      const eyeDirMultiplier = facingRight ? 1 : -1;
      mouseX.set(Math.cos(angle) * distance * eyeDirMultiplier);
      mouseY.set(Math.sin(angle) * distance);
      headRotate.set(Math.cos(angle) * (distance * 1.5) * eyeDirMultiplier);

      // PERFECTLY CENTER under mouse: width is 100, so center is e.clientX - 50
      const clampedX = Math.max(0, Math.min(e.clientX - 50, window.innerWidth - 100));
      targetRobotX.set(clampedX);
    };

    if (!isMobile) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    const triggerRandomMessage = () => {
      if (!isHovered && !isYawning) {
        const randomMsg = IDLE_MESSAGES[Math.floor(Math.random() * IDLE_MESSAGES.length)];
        setIdleMessage(randomMsg);
        messageTimer = setTimeout(() => {
          setIdleMessage(null);
        }, 4000); 
      }
    };
    const messageInterval = setInterval(triggerRandomMessage, 15000); 

    const triggerBlink = () => {
      setIsBlinking(true);
      blinkTimer = setTimeout(() => setIsBlinking(false), 150); 
      const nextBlink = Math.random() * 4000 + 2000; 
      setTimeout(triggerBlink, nextBlink);
    };
    triggerBlink();

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

    const sections = document.querySelectorAll("section, header");
    sections.forEach((section) => observer.observe(section));

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(idleTimer);
      clearTimeout(messageTimer);
      clearTimeout(blinkTimer);
      clearInterval(messageInterval);
      observer.disconnect();
    };
  }, [isMobile, isHovered, isYawning, facingRight]); 

  // Initialize robot position on mount only
  useEffect(() => {
    if (typeof window !== "undefined") {
      targetRobotX.set(window.innerWidth - 150);
    }
  }, []);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => {
      setIsClicked(false);
      window.dispatchEvent(new CustomEvent("open-chatbot"));
    }, 600);
  };

  let displayMessage = idleMessage;
  if (isHovered) displayMessage = "Hi 👋 I'm Mihir's AI Assistant.";
  if (isYawning) displayMessage = "Zzz... 😴";
  if (activeSection === "contact") displayMessage = "Let's get in touch!";
  if (activeSection === "projects") displayMessage = "Check out my work!";

  return (
    <motion.div 
      style={{ x: robotX }}
      className="fixed bottom-0 left-0 pb-12 z-[9990] flex flex-col items-center pointer-events-none"
    >
      
      {/* Speech Bubble */}
      <AnimatePresence>
        {displayMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="mb-2 relative bg-bg-deep border border-[#00E5FF]/40 text-[#00E5FF] px-4 py-2 rounded-xl text-sm font-space font-medium shadow-[0_0_15px_rgba(0,229,255,0.2)] backdrop-blur-md whitespace-nowrap"
          >
            {displayMessage}
            <div className="absolute -bottom-2 right-1/2 translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-bg-deep filter drop-shadow-[0_2px_2px_rgba(0,229,255,0.4)]"></div>
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
        style={{ originX: "50%" }} // Ensure perfect center flipping
        animate={{
          scaleX: facingRight ? 1 : -1,
          y: isWalking ? [0, -4, 0] : (isClicked ? [0, -20, 0] : [-5, 5, -5]),
        }}
        transition={{
          y: isWalking 
            ? { duration: 0.4, repeat: Infinity, ease: "easeInOut" }
            : (isClicked ? { duration: 0.6, type: "spring", bounce: 0.6 } : { duration: 4, repeat: Infinity, ease: "easeInOut" }),
          scaleX: { duration: 0.15, type: "spring", stiffness: 400, damping: 30 }
        }}
      >
        {/* Subtle Background Glow */}
        <div className="absolute inset-0 bg-[#00E5FF]/10 rounded-full blur-2xl transform scale-150 animate-pulse"></div>

        {/* Premium SVG Cyber-Mech */}
        <svg
          width="100"
          height="160"
          viewBox="0 0 100 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-2xl relative z-10"
        >
          <defs>
            <linearGradient id="metalGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4B5563" />
              <stop offset="50%" stopColor="#1F2937" />
              <stop offset="100%" stopColor="#030712" />
            </linearGradient>
            <linearGradient id="darkMetalGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1F2937" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <linearGradient id="cyanGlow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#A5F3FC" />
              <stop offset="50%" stopColor="#00E5FF" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
            <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="strongGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* --- Back Arm (Left Arm) --- */}
          <motion.g
            animate={isWalking ? { rotate: [25, -25, 25] } : { rotate: 5 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
            style={{ originX: "50px", originY: "65px" }}
          >
            <path d="M 50 65 Q 40 85 45 105" stroke="url(#darkMetalGrad)" strokeWidth="8" strokeLinecap="round" />
            <circle cx="45" cy="105" r="4" fill="#00E5FF" opacity="0.3" filter="url(#neonGlow)" />
          </motion.g>

          {/* --- Back Leg (Left Leg - Fully Articulated) --- */}
          <motion.g
            animate={isWalking ? { rotate: [-25, 30, -25] } : { rotate: 5 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
            style={{ originX: "50px", originY: "105px" }}
          >
            {/* Thigh */}
            <line x1="50" y1="105" x2="50" y2="135" stroke="url(#darkMetalGrad)" strokeWidth="10" strokeLinecap="round" />
            <circle cx="50" cy="135" r="3" fill="#00E5FF" opacity="0.4" />
            
            {/* Calf & Foot */}
            <motion.g
              animate={isWalking ? { rotate: [45, 0, 45] } : { rotate: 0 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
              style={{ originX: "50px", originY: "135px" }}
            >
              <line x1="50" y1="135" x2="50" y2="160" stroke="url(#darkMetalGrad)" strokeWidth="7" strokeLinecap="round" />
              <path d="M 46 160 L 56 160 L 56 165 L 44 165 Z" fill="#020617" />
            </motion.g>
          </motion.g>

          {/* --- Torso / Mech Armor --- */}
          {/* Main Chest Plate */}
          <path
            d="M 40 55 L 60 55 C 65 70, 65 90, 58 110 L 42 110 C 35 90, 35 70, 40 55 Z"
            fill="url(#metalGrad)"
            stroke="#1F2937"
            strokeWidth="1.5"
          />
          {/* Inner Glowing Core */}
          <path d="M 45 65 L 55 65 L 53 85 L 47 85 Z" fill="#020617" />
          <circle cx="50" cy="75" r="4" fill="url(#cyanGlow)" filter="url(#strongGlow)" />
          {/* Neon Accents */}
          <path d="M 42 55 L 40 70 M 58 55 L 60 70" stroke="#00E5FF" strokeWidth="1" opacity="0.5" filter="url(#neonGlow)" />

          {/* --- Front Leg (Right Leg - Fully Articulated) --- */}
          <motion.g
            animate={isWalking ? { rotate: [30, -25, 30] } : { rotate: -5 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
            style={{ originX: "50px", originY: "105px" }}
          >
            {/* Thigh */}
            <line x1="50" y1="105" x2="50" y2="135" stroke="url(#metalGrad)" strokeWidth="11" strokeLinecap="round" />
            <circle cx="50" cy="135" r="3.5" fill="#00E5FF" filter="url(#neonGlow)" />
            
            {/* Calf & Foot */}
            <motion.g
              animate={isWalking ? { rotate: [0, 45, 0] } : { rotate: 0 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
              style={{ originX: "50px", originY: "135px" }}
            >
              <line x1="50" y1="135" x2="50" y2="160" stroke="url(#metalGrad)" strokeWidth="8" strokeLinecap="round" />
              <path d="M 45 160 L 58 160 L 58 165 L 43 165 Z" fill="#111827" stroke="#00E5FF" strokeWidth="0.5" />
              {/* Thruster Glow on Foot */}
              <circle cx="50" cy="165" r="3" fill="#00E5FF" filter="url(#strongGlow)" opacity={isWalking ? 0.8 : 0.2} />
            </motion.g>
          </motion.g>

          {/* --- Head & Helmet --- */}
          <motion.g style={{ rotate: headRotate, originX: "50px", originY: "45px" }}>
            {/* Helmet Dome */}
            <path
              d="M 33 45 C 33 22, 67 22, 67 45 C 67 58, 33 58, 33 45"
              fill="url(#metalGrad)"
              stroke="#374151"
              strokeWidth="1.5"
            />
            {/* Cyber Visor Base */}
            <path
              d="M 35 40 Q 50 48 65 40 L 63 50 Q 50 56 37 50 Z"
              fill="#020617"
              stroke="#00E5FF"
              strokeWidth="0.5"
              strokeOpacity="0.4"
            />

            {/* Glowing Visor Light */}
            <motion.g style={{ x: eyeX, y: eyeY }}>
              {!isYawning ? (
                <motion.rect
                  x="40"
                  y="42"
                  width="20"
                  height="6"
                  rx="3"
                  fill="url(#cyanGlow)"
                  filter="url(#strongGlow)"
                  animate={{ scaleY: isBlinking ? 0.1 : 1 }}
                  transition={{ duration: 0.1 }}
                  style={{ originY: "45px" }}
                />
              ) : (
                // Yawning / Sleeping Visor Mode
                <path 
                  d="M 42 45 Q 50 40 58 45" 
                  stroke="url(#cyanGlow)" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  fill="none" 
                  filter="url(#neonGlow)" 
                />
              )}
            </motion.g>
          </motion.g>

          {/* --- Front Arm (Right Arm) & Holographic Emitter --- */}
          <motion.g
            animate={
              isHovered 
                ? { rotate: [0, -35, 15, -15, 0] } 
                : (isWalking ? { rotate: [-25, 25, -25] } : { rotate: -10 })
            }
            transition={
              isHovered 
                ? { duration: 0.8, ease: "easeInOut" }
                : { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
            }
            style={{ originX: "50px", originY: "65px" }}
          >
            {/* Front Arm Segment */}
            <path d="M 50 65 Q 65 85 55 105" stroke="url(#metalGrad)" strokeWidth="9" strokeLinecap="round" />
            
            {/* Holographic Wrist Emitter */}
            <ellipse cx="55" cy="105" rx="5" ry="3" fill="#020617" stroke="#00E5FF" strokeWidth="1" filter="url(#neonGlow)" />
            
            {/* Glowing Holographic Panel */}
            <motion.g
              animate={{ opacity: [0.6, 0.9, 0.6], y: [-2, 2, -2] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <polygon points="50,90 65,85 75,95 60,100" fill="#00E5FF" opacity="0.25" filter="url(#neonGlow)" />
              <line x1="55" y1="90" x2="65" y2="88" stroke="#A5F3FC" strokeWidth="1" opacity="0.8" />
              <line x1="57" y1="93" x2="68" y2="91" stroke="#A5F3FC" strokeWidth="1" opacity="0.8" />
            </motion.g>
          </motion.g>

        </svg>
      </motion.div>
    </motion.div>
  );
};

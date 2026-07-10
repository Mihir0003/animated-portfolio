"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence, useVelocity, useMotionValueEvent } from "framer-motion";

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

  // Animation States
  const [isWalking, setIsWalking] = useState(false);
  const [facingRight, setFacingRight] = useState(true);

  // Mouse Tracking values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const targetRobotX = useMotionValue(0); // For horizontal sliding

  const springConfig = { damping: 25, stiffness: 150 };
  const eyeX = useSpring(mouseX, springConfig);
  const eyeY = useSpring(mouseY, springConfig);
  const headRotate = useSpring(useMotionValue(0), springConfig);
  
  // Robot horizontal spring (slower damping for smooth glide)
  const robotX = useSpring(targetRobotX, { damping: 30, stiffness: 100 });
  const robotVelocity = useVelocity(robotX);

  useMotionValueEvent(robotVelocity, "change", (latest) => {
    if (Math.abs(latest) > 20) {
      setIsWalking(true);
      setFacingRight(latest > 0);
    } else {
      setIsWalking(false);
    }
  });

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

      // Adjust eye tracking based on which way the body is facing
      const eyeDirMultiplier = facingRight ? 1 : -1;

      mouseX.set(Math.cos(angle) * distance * eyeDirMultiplier);
      mouseY.set(Math.sin(angle) * distance);
      headRotate.set(Math.cos(angle) * (distance * 1.5) * eyeDirMultiplier);

      // Slide robot horizontally
      const clampedX = Math.max(20, Math.min(e.clientX - 50, window.innerWidth - 100));
      targetRobotX.set(clampedX);
    };

    if (!isMobile) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    // Initialize robot position on mount
    if (typeof window !== "undefined") {
      targetRobotX.set(window.innerWidth - 150);
    }

    // --- Random Idle Messages ---
    const triggerRandomMessage = () => {
      if (!isHovered && !isYawning) {
        const randomMsg = IDLE_MESSAGES[Math.floor(Math.random() * IDLE_MESSAGES.length)];
        setIdleMessage(randomMsg);
        messageTimer = setTimeout(() => {
          setIdleMessage(null);
        }, 4000); // hide after 4s
      }
    };
    const messageInterval = setInterval(triggerRandomMessage, 15000); // every 15s

    // --- Random Blinking ---
    const triggerBlink = () => {
      setIsBlinking(true);
      blinkTimer = setTimeout(() => setIsBlinking(false), 150); // blink duration
      const nextBlink = Math.random() * 4000 + 2000; // 2s to 6s
      setTimeout(triggerBlink, nextBlink);
    };
    triggerBlink();

    // --- Scroll Intersection Observer for Context ---
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 } // Trigger when 50% of section is visible
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
  }, [isMobile, isHovered, isYawning, facingRight]); // Added facingRight to dependencies

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
        animate={{
          scaleX: facingRight ? 1 : -1,
          y: isWalking ? [0, -3, 0] : (isClicked ? [0, -20, 0] : [-5, 5, -5]),
        }}
        transition={{
          y: isWalking 
            ? { duration: 0.3, repeat: Infinity, ease: "easeInOut" }
            : (isClicked ? { duration: 0.6, type: "spring", bounce: 0.6 } : { duration: 4, repeat: Infinity, ease: "easeInOut" }),
          scaleX: { duration: 0.2, type: "spring", stiffness: 300, damping: 25 }
        }}
      >
        {/* Subtle Glow */}
        <div className="absolute inset-0 bg-[#00E5FF]/20 rounded-full blur-2xl transform scale-150 animate-pulse"></div>

        {/* SVG Full Body Mascot */}
        <svg
          width="100"
          height="160"
          viewBox="0 0 100 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-2xl relative z-10"
        >
          {/* --- Back Arm (Left Arm) --- */}
          <motion.g
            animate={isWalking ? { rotate: [15, -25, 15] } : { rotate: 5 }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
            style={{ originX: "45px", originY: "85px" }}
          >
            <path d="M 45 85 Q 40 110 35 125" stroke="#0F172A" strokeWidth="10" strokeLinecap="round" />
            <circle cx="35" cy="125" r="4" fill="#00E5FF" opacity="0.5" />
          </motion.g>

          {/* --- Back Leg (Left Leg) --- */}
          <motion.g
            animate={isWalking ? { rotate: [-25, 25, -25] } : { rotate: 0 }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
            style={{ originX: "45px", originY: "115px" }}
          >
            <path d="M 45 115 L 45 145" stroke="#0F172A" strokeWidth="12" strokeLinecap="round" />
            {/* Foot */}
            <path d="M 40 145 L 55 145 L 55 150 L 40 150 Z" fill="#020617" />
          </motion.g>

          {/* --- Right Leg (Front Leg) --- */}
          <motion.g
            animate={isWalking ? { rotate: [25, -25, 25] } : { rotate: 0 }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
            style={{ originX: "55px", originY: "115px" }}
          >
            <path d="M 55 115 L 55 145" stroke="#111827" strokeWidth="14" strokeLinecap="round" />
            {/* Foot */}
            <path d="M 50 145 L 68 145 L 68 150 L 50 150 Z" fill="#00E5FF" className="drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
          </motion.g>

          {/* --- Torso / Trench Coat --- */}
          <path
            d="M 35 75 Q 50 70 65 75 L 70 120 Q 50 125 30 120 Z"
            fill="#111827"
            stroke="#1F2937"
            strokeWidth="3"
          />

          {/* --- Head & Hood --- */}
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
                    x="56"
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
                // Yawning Eyes
                <>
                  <path d="M 40 60 Q 45 55 50 60" stroke="#00E5FF" strokeWidth="2" fill="none" className="drop-shadow-[0_0_5px_rgba(0,229,255,0.8)]" />
                  <path d="M 54 60 Q 59 55 64 60" stroke="#00E5FF" strokeWidth="2" fill="none" className="drop-shadow-[0_0_5px_rgba(0,229,255,0.8)]" />
                </>
              )}
            </motion.g>
          </motion.g>

          {/* --- Right Arm (Front Arm) & Holographic Tablet --- */}
          <motion.g
            animate={
              isHovered 
                ? { rotate: [0, -30, 20, -20, 0] } 
                : (isWalking ? { rotate: [-15, 25, -15] } : { rotate: 0 })
            }
            transition={
              isHovered 
                ? { duration: 0.8, ease: "easeInOut" }
                : { duration: 0.6, repeat: Infinity, ease: "easeInOut" }
            }
            style={{ originX: "60px", originY: "85px" }}
          >
            {/* Front Arm */}
            <path d="M 60 85 Q 70 100 80 95" stroke="#111827" strokeWidth="12" strokeLinecap="round" />
            
            {/* Hand */}
            <circle cx="80" cy="95" r="5" fill="#00E5FF" className="drop-shadow-[0_0_5px_rgba(0,229,255,0.8)]" />

            {/* Glowing Holographic Tablet */}
            <motion.g
              animate={{ y: [-2, 2, -2], rotateZ: [-2, 2, -2] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <rect x="75" y="70" width="18" height="22" rx="2" fill="#020617" stroke="#00E5FF" strokeWidth="1.5" className="drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]" />
              <line x1="78" y1="75" x2="88" y2="75" stroke="#00E5FF" strokeWidth="1.5" strokeOpacity="0.6" />
              <line x1="78" y1="80" x2="85" y2="80" stroke="#00E5FF" strokeWidth="1.5" strokeOpacity="0.6" />
              <line x1="78" y1="85" x2="90" y2="85" stroke="#00E5FF" strokeWidth="1.5" strokeOpacity="0.6" />
            </motion.g>
          </motion.g>

        </svg>
      </motion.div>
    </motion.div>
  );
};

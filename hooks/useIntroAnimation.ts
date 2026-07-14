"use client";

import { useState, useCallback } from "react";

export const useIntroAnimation = () => {
  const [isIntroPlaying, setIsIntroPlaying] = useState(true);
  const [introProgress, setIntroProgress] = useState(0);
  const [shouldShake, setShouldShake] = useState(false);

  const startShake = useCallback(() => {
    setShouldShake(true);
    setTimeout(() => setShouldShake(false), 800); // Shake duration matching impact settle
  }, []);

  return {
    isIntroPlaying,
    setIsIntroPlaying,
    introProgress,
    setIntroProgress,
    shouldShake,
    startShake,
  };
};

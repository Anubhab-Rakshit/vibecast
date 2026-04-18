import { useCallback, useEffect, useRef, useState } from 'react';

const THEME_CLASSES = ['theme-pink', 'theme-sepia', 'theme-void', 'theme-green'];

function clearThemeClasses() {
  THEME_CLASSES.forEach((themeClass) => {
    document.body.classList.remove(themeClass);
  });
}

export default function useVisualInversion() {
  const [pinkMode, setPinkMode] = useState(false);
  const [glitchMode, setGlitchMode] = useState(false);
  const [decreaseReadability, setDecreaseReadability] = useState(false);

  const glitchTimerRef = useRef(null);

  const stopGlitchTimer = useCallback(() => {
    if (glitchTimerRef.current) {
      clearTimeout(glitchTimerRef.current);
      glitchTimerRef.current = null;
    }
  }, []);

  const applyPinkMode = useCallback((enabled) => {
    setPinkMode(enabled);
    if (enabled) {
      clearThemeClasses();
      document.body.classList.add('theme-pink');
      return;
    }
    document.body.classList.remove('theme-pink');
  }, []);

  const applyDecreaseReadability = useCallback((enabled) => {
    setDecreaseReadability(enabled);
    document.body.classList.toggle('mode-decrease-readability', enabled);
  }, []);

  const triggerRandomTheme = useCallback(() => {
    clearThemeClasses();
    if (Math.random() > 0.2) {
      const picked = THEME_CLASSES[Math.floor(Math.random() * THEME_CLASSES.length)];
      document.body.classList.add(picked);
    }
  }, []);

  useEffect(() => {
    if (!glitchMode) {
      stopGlitchTimer();
      return;
    }

    const scheduleNext = () => {
      const delay = Math.random() * (90000 - 45000) + 45000;
      glitchTimerRef.current = setTimeout(() => {
        triggerRandomTheme();
        scheduleNext();
      }, delay);
    };

    scheduleNext();

    return () => {
      stopGlitchTimer();
    };
  }, [glitchMode, stopGlitchTimer, triggerRandomTheme]);

  const setGlitchEnabled = useCallback((enabled) => {
    setGlitchMode(enabled);
    if (!enabled) {
      stopGlitchTimer();
      if (!pinkMode) {
        clearThemeClasses();
      }
    } else {
      setPinkMode(false);
      document.body.classList.remove('theme-pink');
      triggerRandomTheme();
    }
  }, [pinkMode, stopGlitchTimer, triggerRandomTheme]);

  const resetVisualInversion = useCallback(() => {
    stopGlitchTimer();
    setPinkMode(false);
    setGlitchMode(false);
    setDecreaseReadability(false);
    clearThemeClasses();
    document.body.classList.remove('mode-decrease-readability');
  }, [stopGlitchTimer]);

  useEffect(() => {
    return () => {
      stopGlitchTimer();
    };
  }, [stopGlitchTimer]);

  return {
    pinkMode,
    glitchMode,
    decreaseReadability,
    applyPinkMode,
    applyDecreaseReadability,
    setGlitchEnabled,
    resetVisualInversion,
  };
}

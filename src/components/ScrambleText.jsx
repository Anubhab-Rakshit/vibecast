import React, { useState, useEffect } from 'react';

const CHARS = '!<>-_\\[]{}—=+*^?#________';

const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const ScrambleText = ({ text }) => {
  const [displayText, setDisplayText] = useState(text);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isHovered || prefersReducedMotion) {
      setDisplayText(text);
      return;
    }
    
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(text.split('').map((char, index) => {
        if (char === ' ') return ' ';
        if (index < iteration) {
          return text[index];
        }
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      }).join(''));
      
      if (iteration >= text.length) {
        clearInterval(interval);
      }
      iteration += 1 / 2;
    }, 30);
    
    return () => clearInterval(interval);
  }, [isHovered, text]);

  return (
    <span
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: 'crosshair' }}
    >
      {displayText}
    </span>
  );
};

export default ScrambleText;

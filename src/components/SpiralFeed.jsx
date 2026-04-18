import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LiveDot from './LiveDot';
import WeatherBadge from './WeatherBadge';

const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const TypewriterText = ({ text }) => {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    let i = 0;
    let isGlitching = false;
    let glitchTimeout;

    const interval = setInterval(() => {
      if (i >= text.length) { clearInterval(interval); return; }

      if (!isGlitching && i > 0 && Math.random() < 0.12) {
        isGlitching = true;
        const glitchChars = '!@#$%^&*_+{}|<>?~`';
        const randomChar = glitchChars[Math.floor(Math.random() * glitchChars.length)];
        setDisplayed(prev => prev + randomChar);
        glitchTimeout = setTimeout(() => {
          setDisplayed(prev => prev.slice(0, -1) + text.charAt(i));
          i++;
          isGlitching = false;
        }, 80);
      } else if (!isGlitching) {
        setDisplayed(prev => prev + text.charAt(i));
        i++;
      }
    }, 15);

    return () => { clearInterval(interval); clearTimeout(glitchTimeout); };
  }, [text]);

  return <span>{displayed}</span>;
};

const FeedItem = ({ stepNum, text, level, isFaded, index }) => {
  let levelColor = 'var(--teal)';
  if (level === 2) levelColor = '#60A5FA';
  if (level === 3) levelColor = 'var(--amber)';
  if (level === 4) levelColor = 'var(--fog)';
  if (level >= 5) levelColor = 'var(--red)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: 8 }}
      animate={{ opacity: isFaded ? 0.4 : 1, y: 0, x: 0 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.35,
        ease: [0.22, 1, 0.36, 1],
        opacity: { duration: prefersReducedMotion ? 0 : 0.5 }
      }}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '12px',
        padding: '12px 16px',
        borderLeft: `2px solid transparent`,
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
        e.currentTarget.style.borderLeftColor = levelColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.borderLeftColor = 'transparent';
      }}
    >
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-ghost)', minWidth: '20px', paddingTop: '2px' }}>
        {stepNum.toString().padStart(2, '0')}
      </div>
      <div style={{ width: '0.5px', height: '12px', backgroundColor: 'var(--border-subtle)', marginTop: '4px', flexShrink: 0 }} />
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-bright)', lineHeight: 1.5, flex: 1 }}>
        <TypewriterText text={text} />
      </div>
      <div style={{ flexShrink: 0, marginTop: '2px' }}>
        <WeatherBadge level={level} />
      </div>
    </motion.div>
  );
};

const SpiralFeed = ({ steps = [], currentLevel = 1 }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [steps]);

  let borderColor = 'var(--teal)';
  if (currentLevel === 2) borderColor = '#60A5FA';
  if (currentLevel === 3) borderColor = 'var(--amber)';
  if (currentLevel === 4) borderColor = 'var(--fog)';
  if (currentLevel >= 5) borderColor = 'var(--red)';

  const displayStep = steps.length.toString().padStart(2, '0');

  return (
    <motion.div
      initial={{ x: 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed', right: 0, top: 0, bottom: 0,
        width: 'min(340px, 90vw)', maxWidth: '340px',
        backgroundColor: 'rgba(8,12,20,0.92)',
        backdropFilter: 'blur(8px)',
        borderLeft: `1px solid ${borderColor}`,
        transition: 'border-left-color 1s ease',
        display: 'flex', flexDirection: 'column', zIndex: 40
      }}
    >
      {/* Sticky Header */}
      <div style={{
        position: 'sticky', top: 0, backgroundColor: 'rgba(8,12,20,0.95)',
        padding: '16px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', borderBottom: '0.5px solid var(--border-subtle)', zIndex: 2
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LiveDot />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--teal)', letterSpacing: '0.18em' }}>
            LIVE SPIRAL BROADCAST
          </span>
        </div>

        {/* Framer Motion slot-machine counter */}
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-bright)', overflow: 'hidden', height: '18px', position: 'relative' }}>
          <AnimatePresence mode="popLayout">
            <motion.span
              key={displayStep}
              initial={{ y: -18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 18, opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: [0.4, 0, 0.2, 1] }}
              style={{ display: 'inline-block' }}
            >
              {displayStep} / 47
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Feed */}
      <div ref={containerRef} style={{ flex: 1, overflowY: 'auto', paddingBottom: '80px', scrollBehavior: 'smooth' }}>
        {steps.map((step, index) => (
          <FeedItem
            key={step.step || index}
            stepNum={step.step || index + 1}
            text={step.text}
            level={step.weatherLevel}
            isFaded={(steps.length - index) > 5}
            index={index}
          />
        ))}
      </div>

      <style>{`::-webkit-scrollbar { width: 0px; background: transparent; }`}</style>
    </motion.div>
  );
};

export default SpiralFeed;

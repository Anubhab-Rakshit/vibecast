import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RadarDisplay from '../components/RadarDisplay';
import ParticleCanvas from '../components/ParticleCanvas';
import ScrambleText from '../components/ScrambleText';

const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const isMobileViewport = window.matchMedia?.('(max-width: 900px)').matches;

// Stagger container for the hero elements
const containerVariants = {
  animate: {
    transition: {
      staggerChildren: prefersReducedMotion ? 0 : 0.12,
      delayChildren: prefersReducedMotion ? 0 : 0.1,
    }
  }
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

const radarVariants = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.05 } }
};

const StationScreen = ({ onSubmit }) => {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  // Useless Features State
  const [panicState, setPanicState] = useState(0);
  const panicTexts = ['PANIC', 'PANIC HARDER', 'SCREAM INTERNALLY', 'OKAY BREATHE'];
  
  const [fakeProgress, setFakeProgress] = useState(0);
  const [fakeProgressStatus, setFakeProgressStatus] = useState('Calibrating existential dread...');
  
  const [showBanner, setShowBanner] = useState(true);

  // Typewriter placeholder logic
  const placeholders = [
    "Tell the Oracle what you're avoiding, overthinking, or absolutely not dealing with right now.",
    "Which unread email is currently haunting you?",
    "Describe the catastrophic scenario playing in your head.",
    "What specific task are you procrastinating on today?"
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderText, setPlaceholderText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const target = placeholders[placeholderIndex];
    let timeout;
    
    if (!isDeleting && placeholderText === target) {
      timeout = setTimeout(() => setIsDeleting(true), 3000);
    } else if (isDeleting && placeholderText === '') {
      setIsDeleting(false);
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    } else {
      const nextText = isDeleting
        ? target.substring(0, placeholderText.length - 1)
        : target.substring(0, placeholderText.length + 1);
      
      timeout = setTimeout(() => setPlaceholderText(nextText), isDeleting ? 20 : 40);
    }
    
    return () => clearTimeout(timeout);
  }, [placeholderText, isDeleting, placeholderIndex]);

  // Fake Loading Bar Effect
  useEffect(() => {
    const statuses = [
      'Calibrating existential dread...',
      'Syncing with your imposter syndrome...',
      'Calculating probability of actually doing the work...',
      'Optimizing anxiety algorithms...',
      'Rerouting productivity to nowhere...',
    ];
    let interval = setInterval(() => {
      setFakeProgress(prev => {
        if (prev >= 100) {
          setFakeProgressStatus(statuses[Math.floor(Math.random() * statuses.length)]);
          return 0;
        }
        return prev + Math.floor(Math.random() * 15);
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (input.trim()) onSubmit(input);
  };


  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}
    >
      <ParticleCanvas />

      {/* Giant Bleeding Masthead — rotated, properly left-anchored */}
      <div style={{
        position: 'absolute',
        left: isMobileViewport ? '12vw' : '7vw',
        top: '50%',
        // translate(-50%, -50%) ensures the true center of the word is at left:4vw, top:50%
        transform: 'translate(-50%, -50%) rotate(-90deg)',
        fontFamily: 'var(--font-mono)',
        fontSize: isMobileViewport ? '24vw' : '18vw',
        fontWeight: '900',
        color: 'var(--bg-elevated)',
        opacity: 0.4,
        zIndex: 0,
        pointerEvents: 'none',
        lineHeight: 1,
        letterSpacing: '-0.04em',
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }}>
        VIBECAST
      </div>

      {/* Corner Data Overlays — shifted down to clear HUD */}
      <div style={{ position: 'absolute', top: isMobileViewport ? '86px' : '120px', left: '16px', zIndex: 20, fontFamily: 'var(--font-mono)', fontSize: isMobileViewport ? '8px' : '10px', color: 'var(--text-ghost)', lineHeight: 1.5 }}>
        <ScrambleText text="STATION ID: NMW-47" /><br/>
        UTC: {new Date().toISOString().split('T')[1].substring(0, 8)}
      </div>
      <div style={{ position: 'absolute', top: isMobileViewport ? '86px' : '120px', right: '16px', zIndex: 20, fontFamily: 'var(--font-mono)', fontSize: isMobileViewport ? '8px' : '10px', color: 'var(--text-ghost)', lineHeight: 1.5, textAlign: 'right' }}>
        <ScrambleText text="STORM CLASS: STANDBY" /><br/>
        COORD: 28°36'N 77°13'E
      </div>
      <div style={{ position: 'absolute', bottom: isMobileViewport ? '84px' : '32px', left: '16px', zIndex: 20, fontFamily: 'var(--font-mono)', fontSize: isMobileViewport ? '8px' : '10px', color: 'var(--text-ghost)', lineHeight: 1.5 }}>
        <ScrambleText text="ATMOSPHERIC INTEGRITY: 94.3%" />
      </div>
      <div style={{ position: 'absolute', bottom: isMobileViewport ? '84px' : '32px', right: '16px', zIndex: 20, fontFamily: 'var(--font-mono)', fontSize: isMobileViewport ? '8px' : '10px', color: 'var(--text-ghost)', lineHeight: 1.5, textAlign: 'right' }}>
        <span style={{ border: '1px solid var(--border-mid)', padding: '2px 6px', borderRadius: '2px' }}>
          <ScrambleText text="CLASS: UNRESOLVED" />
        </span>
      </div>

      {/* Radar — scaled in independently */}
      <div 
        className="radar-bloom"
        style={{
          position: 'absolute',
          left: '50%',
          top: '48%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10
        }}
      >
        <motion.div variants={radarVariants}>
          <RadarDisplay size={isMobileViewport ? 300 : 520} stormProgress={0} />
        </motion.div>
      </div>

      {/* The Oracle Label */}
      <div style={{
        position: 'absolute',
        bottom: isMobileViewport ? '31%' : '22%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: isMobileViewport ? 'calc(100vw - 28px)' : '560px',
        zIndex: 20,
        textAlign: 'center',
      }}>
        <motion.div variants={itemVariants}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: isMobileViewport ? '8px' : '9px',
            color: 'var(--text-dim)',
            letterSpacing: '0.18em',
            marginBottom: '4px'
          }}>
            [ CERTIFIED 47-STEP PROTOCOL — CLASSIFIED INPUT ]
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: isMobileViewport ? '8px' : '9px',
            color: 'var(--text-dim)',
            marginBottom: '8px'
          }}>
            AWAITING INPUT — RADAR CALIBRATED <span style={{ animation: 'blink 0.8s step-end infinite' }}>_</span>
          </div>
        </motion.div>
      </div>

      {/* Input Terminal */}
      <div style={{
        position: 'absolute',
        bottom: isMobileViewport ? '22%' : '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: isMobileViewport ? 'calc(100vw - 28px)' : '560px',
        zIndex: 20
      }}>
        <motion.div variants={itemVariants}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', borderBottom: isFocused ? '1px solid var(--teal)' : '1px solid var(--text-dim)', transition: 'border-color 0.25s ease, box-shadow 0.25s ease', boxShadow: isFocused ? '0 4px 30px rgba(74,222,204,0.12)' : 'none' }}>
            <span style={{ color: 'var(--teal)', marginRight: '12px', fontFamily: 'var(--font-mono)', fontSize: '14px', animation: 'blink 1s step-end infinite' }}>█</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholderText}
              className={!isFocused && !input ? "input-readiness" : ""}
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--text-bright)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(12px, 1.2vw, 16px)',
                padding: '12px 0',
                outline: 'none',
              }}
            />
          </form>
        </motion.div>
      </div>

      {/* GO Button — spring scale on mount */}
      <div style={{
        position: 'fixed',
        bottom: isMobileViewport ? '104px' : '96px',
        right: isMobileViewport ? '16px' : '48px',
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '8px'
      }}>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18, delay: prefersReducedMotion ? 0 : 0.5 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}
        >
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: 'var(--text-dim)', letterSpacing: '0.15em' }}>
          INITIATE FORECAST
        </div>
        <motion.button
          onClick={handleSubmit}
          whileHover={prefersReducedMotion ? {} : { scale: 1.08, boxShadow: '0 0 30px rgba(239,68,68,0.45)' }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.88 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          style={{
            width: isMobileViewport ? '56px' : '64px',
            height: isMobileViewport ? '56px' : '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--red)',
            color: 'white',
            fontFamily: 'var(--font-mono)',
            fontSize: isMobileViewport ? '12px' : '14px',
            fontWeight: 'bold',
            border: '2px solid rgba(255,255,255,0.15)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          GO
        </motion.button>
        </motion.div>
      </div>

      {/* Credit */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1.5, delay: 0.8 }}
        style={{
          position: 'fixed',
          bottom: isMobileViewport ? '70px' : '56px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'var(--font-mono)',
          fontSize: isMobileViewport ? '8px' : '9px',
          color: 'var(--text-ghost)',
          zIndex: 5,
          whiteSpace: 'nowrap',
          maxWidth: 'calc(100vw - 24px)',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        <ScrambleText text="VibeCast Live Desk | Est. whenever you started procrastinating" />
      </motion.div>

      {/* USELESS FEATURE 1: Panic Button */}
      <div style={{ position: 'absolute', bottom: isMobileViewport ? '106px' : '64px', left: '16px', zIndex: 30 }}>
        <button
          onClick={(e) => {
            e.preventDefault();
            setPanicState(p => (p + 1) % panicTexts.length);
          }}
          style={{
            backgroundColor: 'transparent',
            color: 'var(--accent-red)',
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            border: '1px solid var(--accent-red)',
            padding: '4px 8px',
            cursor: 'pointer',
            borderRadius: '2px',
            transition: 'all 0.1s'
          }}
          onMouseDown={(e) => {
            e.target.style.backgroundColor = 'var(--accent-red)';
            e.target.style.color = 'white';
          }}
          onMouseUp={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = 'var(--accent-red)';
          }}
        >
          [ {panicTexts[panicState]} ]
        </button>
      </div>

      {/* USELESS FEATURE 2: Fake Loading Bar */}
      <div style={{
        position: 'absolute',
        bottom: isMobileViewport ? '16%' : '8%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: isMobileViewport ? 'calc(100vw - 28px)' : '560px',
        zIndex: 20
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--text-dim)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
          <span>{fakeProgressStatus}</span>
          <span>{Math.min(fakeProgress, 100)}%</span>
        </div>
        <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
          <div style={{ width: `${Math.min(fakeProgress, 100)}%`, height: '100%', backgroundColor: 'var(--teal)', transition: 'width 0.3s ease' }} />
        </div>
      </div>

      {/* USELESS FEATURE 3: Accept Fate Cookie Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            style={{
              position: 'fixed',
              bottom: '0',
              left: '0',
              right: '0',
              backgroundColor: '#0a0d14', // Match elevated background
              borderTop: '1px solid var(--border-mid)',
              padding: isMobileViewport ? '10px 12px' : '12px 32px',
              zIndex: 9999,
              display: 'flex',
              flexDirection: isMobileViewport ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobileViewport ? 'flex-start' : 'center',
              gap: isMobileViewport ? '10px' : '0',
              fontFamily: 'var(--font-mono)',
              fontSize: isMobileViewport ? '9px' : '10px'
            }}
          >
            <div style={{ color: 'var(--text-ghost)' }}>
              NOTICE: We use cookies to track how much time you are wasting. By clicking 'Accept', you agree that it is officially too late to start that task today.
            </div>
            <div style={{ display: 'flex', gap: '8px', width: isMobileViewport ? '100%' : 'auto' }}>
              <button 
                onClick={() => setShowBanner(false)} 
                style={{ backgroundColor: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-mid)', padding: '6px 12px', cursor: 'pointer', fontSize: '9px', fontFamily: 'var(--font-mono)', flex: isMobileViewport ? 1 : 'unset' }}
                onMouseEnter={(e) => { e.target.style.color = 'var(--text-primary)'; e.target.style.borderColor = 'var(--text-muted)'; }}
                onMouseLeave={(e) => { e.target.style.color = 'var(--text-muted)'; e.target.style.borderColor = 'var(--border-mid)'; }}
              >
                [ ACCEPT FATE ]
              </button>
              <button 
                onClick={() => setShowBanner(false)} 
                style={{ backgroundColor: 'var(--accent-red)', color: 'white', border: '1px solid var(--accent-red)', padding: '6px 12px', cursor: 'pointer', fontSize: '9px', fontFamily: 'var(--font-mono)', flex: isMobileViewport ? 1 : 'unset' }}
                onMouseEnter={(e) => { e.target.style.boxShadow = '0 0 10px rgba(239,68,68,0.5)'; }}
                onMouseLeave={(e) => { e.target.style.boxShadow = 'none'; }}
              >
                [ ACCEPT FATE (AGGRESSIVELY) ]
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StationScreen;

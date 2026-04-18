import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import RadarDisplay from '../components/RadarDisplay';
import FloatingDust from '../components/FloatingDust';

const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const FALLBACK_BULLETS = [
  "Email replied to in 4 minutes. Inbox: zero.",
  "Relationship with obligations: healthy and functional.",
  "Sleep quality last night: 8.4 hours. Uninterrupted.",
  "Career trajectory: unaffected. Possibly improved.",
  "Current dread index: 0.3. Baseline. Acceptable."
];

const FALLBACK_WEATHER = "Dread index: 0.3 | Anxiety depth: 4% | Cosmic concern: None detected.";

const BoundaryScreen = ({ onAcceptFate, alternateSelf, forecastSource = 'pending', forecastModel = null }) => {
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const boundaryRef = useRef(null);
  const leftItemsRef = useRef([]);
  const rightItemsRef = useRef([]);

  useEffect(() => {
    if (prefersReducedMotion) {
      gsap.set([leftRef.current, rightRef.current], { x: 0, opacity: 1 });
      gsap.set(leftItemsRef.current, { opacity: 0.4 });
      return;
    }

    // GSAP: split reveal timeline
    const tl = gsap.timeline();

    // Both halves slide in simultaneously from opposite edges with cinematic easing
    tl.fromTo(leftRef.current,
      { x: '-100vw', opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, ease: 'power4.out' },
      0
    )
    .fromTo(rightRef.current,
      { x: '100vw', opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, ease: 'power4.out' },
      0
    )

    // Boundary line draws in after halves land
    .fromTo(boundaryRef.current,
      { scaleY: 0, opacity: 0 },
      { scaleY: 1, opacity: 1, duration: 0.7, ease: 'power2.out', transformOrigin: 'top center' },
      0.4
    )

    // Left items stagger in
    .fromTo(leftItemsRef.current,
      { opacity: 0, x: -16 },
      { opacity: (i) => i === 0 ? 1 : 0.4, x: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' },
      0.6
    )

    // Right items stagger in with clear hierarchy
    .fromTo(rightItemsRef.current.filter(Boolean),
      { opacity: 0, y: 16 },
      { opacity: (i) => i === 0 ? 1 : (i === 1 ? 1 : 0.8), y: 0, duration: 0.5, stagger: 0.12, ease: 'power2.out' },
      0.8
    );

    // Continuous morphing of the boundary path
    gsap.to('#boundary-path', {
      attr: { d: "M 40 0 C 0 250, 80 500, 40 750 C 0 1000, 80 1250, 40 1500" },
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

  }, []);

  const leftRef_item = (el, i) => { leftItemsRef.current[i] = el; };
  const rightRef_item = (el, i) => { rightItemsRef.current[i] = el; };
  const liveHeadline = alternateSelf?.headline || 'PARALLEL UNIVERSE - CLEAR CONDITIONS';
  const liveBullets =
    Array.isArray(alternateSelf?.bulletPoints) && alternateSelf.bulletPoints.length
      ? alternateSelf.bulletPoints
      : FALLBACK_BULLETS;
  const liveWeatherReport = alternateSelf?.weatherReport || `Current conditions: Clear. Visibility: Excellent. ${FALLBACK_WEATHER}`;
  const sourceLabel =
    forecastSource === 'gemini'
      ? `LIVE GEMINI${forecastModel ? ` (${forecastModel})` : ''}`
      : forecastSource === 'fallback'
        ? 'LOCAL EMERGENCY FORECAST'
        : 'CALIBRATING FEED';
  const sourceTone = forecastSource === 'fallback' ? '#B45309' : '#0F766E';

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', overflow: 'hidden', position: 'relative' }}>

      {/* ─── LEFT HALF: YOUR UNIVERSE ─── */}
      <div ref={leftRef} style={{
        width: '50vw', height: '100vh', position: 'relative',
        backgroundColor: 'var(--bg-deep)',
        willChange: 'transform',
      }}>
        {/* Heavy CRT scanlines on left */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
          pointerEvents: 'none', zIndex: 1
        }} />
        {/* Red cast overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(239,68,68,0.04)', pointerEvents: 'none', zIndex: 2 }} />

        {/* Top Label */}
        <div ref={el => leftRef_item(el, 0)} className="label-caps" style={{ position: 'absolute', top: 0, left: 0, padding: '24px', fontSize: '9px', color: 'var(--red)', letterSpacing: '0.2em', zIndex: 5 }}>
          YOUR UNIVERSE
        </div>

        <div
          style={{
            position: 'absolute',
            top: '56px',
            left: '24px',
            fontFamily: 'var(--font-mono)',
            fontSize: '8px',
            color: 'rgba(239,68,68,0.72)',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            zIndex: 5,
          }}
        >
          Internal Reality Snapshot
        </div>

        {/* Mini Radar */}
        <div ref={el => leftRef_item(el, 1)} style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 5 }}>
          <RadarDisplay size={160} stormProgress={1} isLevel5={true} />
        </div>

        {/* Scrolling steps */}
        <div ref={el => leftRef_item(el, 2)} style={{
          position: 'absolute', top: '65%', left: '50%', transform: 'translateX(-50%)',
          height: '100px', overflow: 'hidden', zIndex: 5,
          maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)'
        }}>
          <div style={{ animation: 'scroll-up-steps 12s linear infinite', fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-ghost)', whiteSpace: 'nowrap', textAlign: 'center', lineHeight: 2 }}>
            step 40: What if I replied to the wrong thread?<br/>
            step 41: I definitely replied to the wrong thread.<br/>
            step 42: I should fake my own death.<br/>
            step 43: Moving to the woods sounds viable.<br/>
            step 44: They are all talking about me.<br/>
            step 45: I have ruined everything.<br/>
            step 46: There is no recovery from this.<br/>
            step 47: Total structural collapse.<br/>
            step 40: What if I replied to the wrong thread?
          </div>
        </div>

        {/* Weather Readout */}
        <div ref={el => leftRef_item(el, 3)} style={{ position: 'absolute', bottom: '88px', left: '32px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--red)', lineHeight: 1.5, zIndex: 5 }}>
          CATEGORY 5 MIDNIGHT DREAD HURRICANE<br/>
          VISIBILITY: ZERO
        </div>
      </div>

      {/* ─── RIGHT HALF: ALTERNATE UNIVERSE ─── */}
      <div ref={rightRef} style={{
        width: '50vw', height: '100vh', position: 'relative',
        background: 'radial-gradient(circle at center, #FFF8DB 0%, #FEF3C7 100%)',
        willChange: 'transform',
      }}>
        <FloatingDust />

        {/* Top Label */}
        <div ref={el => rightRef_item(el, 0)} className="label-caps" style={{ position: 'absolute', top: 0, left: 0, padding: '24px', fontSize: '9px', color: '#92400E', letterSpacing: '0.12em' }}>
          {liveHeadline}
        </div>

        <div
          style={{
            position: 'absolute',
            top: '56px',
            left: '24px',
            border: `1px solid ${sourceTone}`,
            backgroundColor: 'rgba(255,255,255,0.55)',
            borderRadius: '999px',
            padding: '4px 10px',
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            color: sourceTone,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            maxWidth: 'calc(100% - 48px)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          Source: {sourceLabel}
        </div>

        {/* Sun icon */}
        <div ref={el => rightRef_item(el, 1)} style={{ position: 'absolute', top: '22%', left: '50%', transform: 'translateX(-50%)' }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="8" fill="#D97706" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <line key={angle} x1="20" y1="6" x2="20" y2="2" stroke="#D97706" strokeWidth="2" strokeLinecap="round" transform={`rotate(${angle} 20 20)`} />
            ))}
          </svg>
        </div>

        {/* Bullet Points — real data from API or fallback */}
        <div style={{ position: 'absolute', top: '34%', left: '50%', transform: 'translateX(-50%)', width: '80%' }}>
          <div
            style={{
              marginBottom: '10px',
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              color: '#A16207',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
            }}
          >
            Alternate Universe Briefing
          </div>
          {liveBullets.map((text, i) => (
            <div key={i} ref={el => rightRef_item(el, 2 + i)} style={{ display: 'flex', gap: '10px', marginBottom: '14px', opacity: 0, animation: `boundary-fade-up 0.4s ease ${0.3 + i * 0.15}s forwards` }}>
              <span style={{ color: '#4ADECC', fontSize: '13px', flexShrink: 0 }}>{i % 2 === 0 ? '○' : '◦'}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(11px, 1.2vw, 13px)', color: '#44403C', lineHeight: 1.5 }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Stats + weather report */}
        <div ref={el => rightRef_item(el, 7)} style={{ position: 'absolute', bottom: '180px', left: '50%', transform: 'translateX(-50%)', width: '80%', fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#78716C', lineHeight: 1.6 }}>
          {liveWeatherReport}
        </div>

        {/* Accept Fate button — inside right panel, below stats */}
        <div ref={el => rightRef_item(el, 8)} style={{ position: 'absolute', bottom: '96px', left: '50%', transform: 'translateX(-50%)', width: '80%' }}>
          <motion.button
            onClick={onAcceptFate}
            whileHover={prefersReducedMotion ? {} : { backgroundColor: '#44403C', color: '#FEF3C7', borderColor: '#44403C' }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
            transition={{ duration: 0.2 }}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 'clamp(9px, 1.1vw, 12px)',
              color: '#44403C', background: 'transparent',
              border: '1px solid #44403C', padding: '12px 28px',
              borderRadius: '3px', cursor: 'pointer',
              letterSpacing: '0.08em', whiteSpace: 'nowrap',
              transition: 'background 0.2s, color 0.2s',
              width: '100%',
            }}
          >
            ACCEPT YOUR FATE &amp; RECEIVE OFFICIAL FORECAST
          </motion.button>
        </div>
      </div>

      {/* ─── THE WAVY BOUNDARY ─── */}
      <div ref={boundaryRef} style={{
        position: 'absolute', left: '50%', top: 0, height: '100vh',
        width: '2px', zIndex: 20, transform: 'translateX(-50%)', pointerEvents: 'none'
      }}>
        <svg height="100%" width="80" style={{ position: 'absolute', left: '-40px', top: 0 }} preserveAspectRatio="none">
          <path id="boundary-path" d="M 40 0 C 80 250, 0 500, 40 750 C 80 1000, 0 1250, 40 1500"
            fill="none" stroke="rgba(239,68,68,0.08)" strokeWidth="12" filter="blur(6px)" />
          <path d="M 40 0 C 80 250, 0 500, 40 750 C 80 1000, 0 1250, 40 1500"
            fill="none" stroke="rgba(254,243,199,0.08)" strokeWidth="12" filter="blur(6px)" transform="translate(4, 0)" />
          <path d="M 40 0 C 80 250, 0 500, 40 750 C 80 1000, 0 1250, 40 1500"
            fill="none" stroke="rgba(74,222,204,0.35)" strokeWidth="1" />
        </svg>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%) rotate(-90deg)',
          fontFamily: 'var(--font-mono)', fontSize: '7px', color: 'var(--text-ghost)', whiteSpace: 'nowrap'
        }}>
          UNIVERSE BOUNDARY
        </div>
      </div>

      <style>{`
        @keyframes scroll-up-steps {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes boundary-fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default BoundaryScreen;

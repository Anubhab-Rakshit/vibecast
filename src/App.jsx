import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { gsap } from 'gsap';
import NewsTicker from './components/NewsTicker';
import HUDBar from './components/HUDBar';
import StationScreen from './screens/StationScreen';
import SpiralScreen from './screens/SpiralScreen';
import BoundaryScreen from './screens/BoundaryScreen';
import DocumentScreen from './screens/DocumentScreen';
import ChaosPanel from './components/ChaosPanel';
import useSpiral from '../hooks/useSpiral';
import { getLivePhraseFromLevel, getWeatherConditionFromLevel } from '../utils/weatherUtils';

import useVisualInversion from '../hooks/useVisualInversion';
import CursorTrail from './components/CursorTrail';
import WeatherEngine from './components/WeatherEngine';

const TOTAL_STEPS = 47;
const INITIAL_SCREEN = 1;
const LAST_SCREEN = 4;

const transitionPhases = {
  idle: 'idle',
  toLiveFlash: 'to-live-flash',
  toBoundaryBulletin: 'to-boundary-bulletin',
  toDocumentFlash: 'to-document-flash',
};

const screenVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, transition: { duration: 0.28 } },
};

const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function getMilestones(currentStep) {
  return {
    step10: currentStep >= 10,
    step25: currentStep >= 25,
    step39: currentStep >= 39,
    step47: currentStep >= 47,
  };
}

function formatPercent(value, fallback = 94) {
  const pct = Number.isFinite(value) ? Math.round(value) : fallback;
  return `${Math.max(0, Math.min(100, pct))}%`;
}

function buildCertificateViewModel({
  certificate,
  alternateSelf,
  weatherCondition,
  currentStep,
  barometerPct,
}) {
  const fallbackAlternate = alternateSelf?.headline
    ? 'Thriving (confirmed)'
    : 'Signal weak, likely thriving';

  return {
    currentConditions: certificate?.currentConditions || weatherCondition || 'Midnight Dread Hurricane',
    spiralDepth: Number.isInteger(certificate?.spiralDepth) ? certificate.spiralDepth : Math.max(currentStep, 47),
    anxietyBarometer: formatPercent(certificate?.anxietyBarometer, barometerPct || 94),
    alternateSelfStatus: certificate?.alternateSelfStatus || fallbackAlternate,
    shortTermForecast: certificate?.shortTermForecast || 'Paralysis by analysis with intermittent task-switching winds',
    tonightForecast: certificate?.tonightForecast || 'Replaying conversations from 2014 with dense regret cloud cover',
    longTermForecast: certificate?.longTermForecast || 'Uncertain. Highly cloudy with bureaucratic visibility advisories',
    officialAdvisory:
      certificate?.officialAdvisory ||
      'The storm remains entirely internal and fully operational. External umbrellas provide ceremonial comfort only.',
  };
}

function buildAlternateSelfViewModel(alternateSelf) {
  const fallbackBulletPoints = [
    'Inbox replied to with suspiciously healthy response latency.',
    'All obligations acknowledged without dramatic internal weather events.',
    'Sleep cycle detected and verified by at least one witness.',
    'Career trajectory remains upright and only mildly surreal.',
    'Dread index stable at ceremonial levels.',
  ];

  return {
    headline: alternateSelf?.headline || 'PARALLEL UNIVERSE - CLEAR CONDITIONS',
    bulletPoints:
      Array.isArray(alternateSelf?.bulletPoints) && alternateSelf.bulletPoints.length
        ? alternateSelf.bulletPoints
        : fallbackBulletPoints,
    weatherReport:
      alternateSelf?.weatherReport ||
      'Current conditions: Calm. Visibility: Excellent. Dread index: 0.3 | Cosmic concern: politely postponed.',
  };
}

function App() {
  const [screen, setScreen] = useState(INITIAL_SCREEN);
  const [transitionPhase, setTransitionPhase] = useState(transitionPhases.idle);

  const flashRef = useRef(null);
  const bulletinRef = useRef(null);
  const crtRef = useRef(null);
  const activeTimelineRef = useRef(null);
  const transitionLockRef = useRef(false);
  const hasTriggeredBoundaryRef = useRef(false);

  const {
    steps,
    currentLevel,
    barometerPct,
    isStreaming,
    isComplete,
    alternateSelf,
    certificate,
    forecastSource,
    forecastModel,
    weatherType,
    error,
    startForecast,
    reset: resetSpiral,
  } = useSpiral();

  const { resetVisualInversion } = useVisualInversion();

  const currentStep = steps.length;
  const milestones = useMemo(() => getMilestones(currentStep), [currentStep]);

  const weatherCondition = useMemo(() => getWeatherConditionFromLevel(currentLevel), [currentLevel]);

  const clearTimeline = useCallback(() => {
    if (activeTimelineRef.current) {
      activeTimelineRef.current.kill();
      activeTimelineRef.current = null;
    }
    if (flashRef.current) {
      gsap.set(flashRef.current, { opacity: 0 });
    }
    if (bulletinRef.current) {
      gsap.set(bulletinRef.current, { opacity: 0, display: 'none', y: 0 });
    }
    if (crtRef.current) {
      gsap.set(crtRef.current, { opacity: 0, display: 'none' });
    }
    setTransitionPhase(transitionPhases.idle);
    transitionLockRef.current = false;
  }, []);

  const runTimeline = useCallback(
    (name, onComplete) => {
      clearTimeline();
      setTransitionPhase(name);
      transitionLockRef.current = true;

      if (prefersReducedMotion) {
        onComplete();
        clearTimeline();
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => {
          onComplete();
          clearTimeline();
        },
        onInterrupt: () => {
          clearTimeline();
        },
      });

      if (name === transitionPhases.toLiveFlash) {
        tl.set(flashRef.current, { opacity: 0 }).to(flashRef.current, {
          opacity: 1,
          duration: 0.09,
          ease: 'none',
        })
          .to(flashRef.current, {
            opacity: 0,
            duration: 0.28,
            ease: 'power2.out',
          });
      }

      if (name === transitionPhases.toBoundaryBulletin) {
        tl.set(bulletinRef.current, { display: 'flex', opacity: 0, y: 30 })
          .to(bulletinRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power3.out',
          })
          .to(bulletinRef.current, { opacity: 1, duration: 0.9 })
          .to(bulletinRef.current, {
            opacity: 0,
            y: -10,
            duration: 0.25,
            ease: 'power2.in',
          })
          .set(bulletinRef.current, { display: 'none' })
          .set(crtRef.current, { display: 'block', opacity: 0 })
          .to(crtRef.current, { opacity: 0.95, duration: 0.08 })
          .to(crtRef.current, { opacity: 0.95, duration: 0.48 })
          .to(crtRef.current, { opacity: 0, duration: 0.08 })
          .set(crtRef.current, { display: 'none' })
          .set(flashRef.current, { opacity: 0 })
          .to(flashRef.current, { opacity: 1, duration: 0.08, ease: 'none' })
          .to(flashRef.current, { opacity: 0, duration: 0.15, ease: 'power2.out' });
      }

      if (name === transitionPhases.toDocumentFlash) {
        tl.set(flashRef.current, { opacity: 0 })
          .to(flashRef.current, { opacity: 1, duration: 0.1, ease: 'none' })
          .to(flashRef.current, { opacity: 0, duration: 0.28, ease: 'power2.out' });
      }

      activeTimelineRef.current = tl;
    },
    [clearTimeline]
  );

  const handleStartForecast = useCallback(
    (userInput) => {
      if (transitionLockRef.current) {
        return;
      }

      runTimeline(transitionPhases.toLiveFlash, () => {
        hasTriggeredBoundaryRef.current = false;
        setScreen(2);
        void startForecast(userInput);
      });
    },
    [runTimeline, startForecast]
  );

  const handleAcceptFate = useCallback(() => {
    if (transitionLockRef.current) {
      return;
    }

    runTimeline(transitionPhases.toDocumentFlash, () => {
      setScreen(4);
    });
  }, [runTimeline]);

  const handleResetAll = useCallback(() => {
    clearTimeline();
    hasTriggeredBoundaryRef.current = false;
    resetVisualInversion();
    resetSpiral();
    setScreen(INITIAL_SCREEN);
  }, [clearTimeline, resetSpiral, resetVisualInversion]);

  const handleNavigateTo = useCallback((targetScreen) => {
    if (transitionLockRef.current) {
      return;
    }

    const bounded = Math.max(INITIAL_SCREEN, Math.min(LAST_SCREEN, targetScreen));
    setScreen(bounded);
  }, []);

  const handleNextScreen = useCallback(() => {
    handleNavigateTo(screen + 1);
  }, [handleNavigateTo, screen]);

  const handlePrevScreen = useCallback(() => {
    handleNavigateTo(screen - 1);
  }, [handleNavigateTo, screen]);

  useEffect(() => {
    if (screen !== 2) {
      return;
    }
    if (!isComplete || hasTriggeredBoundaryRef.current || transitionLockRef.current) {
      return;
    }
    if (currentStep < TOTAL_STEPS) {
      return;
    }

    hasTriggeredBoundaryRef.current = true;
    runTimeline(transitionPhases.toBoundaryBulletin, () => {
      setScreen(3);
    });
  }, [currentStep, isComplete, runTimeline, screen]);

  useEffect(() => {
    return () => {
      clearTimeline();
    };
  }, [clearTimeline]);

  const renderScreen = () => {
    switch (screen) {
      case 1:
        return <StationScreen onSubmit={handleStartForecast} />;
      case 2:
        return (
          <SpiralScreen
            steps={steps}
            currentLevel={currentLevel}
            weatherCondition={weatherCondition}
            barometerPct={barometerPct}
            isStreaming={isStreaming}
            transitionPhase={transitionPhase}
            milestones={milestones}
            error={error}
            onRestart={handleResetAll}
            forecastSource={forecastSource}
            forecastModel={forecastModel}
          />
        );
      case 3:
        return (
          <BoundaryScreen
            onAcceptFate={handleAcceptFate}
            alternateSelf={alternateSelfViewModel}
            forecastSource={forecastSource}
            forecastModel={forecastModel}
            transitionPhase={transitionPhase}
            milestones={milestones}
          />
        );
      case 4:
        return (
          <DocumentScreen
            onReset={handleResetAll}
            certificate={certificateViewModel}
            alternateSelf={alternateSelf}
            weatherCondition={weatherCondition}
            forecastSource={forecastSource}
            forecastModel={forecastModel}
            currentStep={currentStep}
            barometerPct={barometerPct}
            isStreaming={isStreaming}
          />
        );
      default:
        return <StationScreen onSubmit={handleStartForecast} />;
    }
  };

  const certificateViewModel = useMemo(
    () =>
      buildCertificateViewModel({
        certificate,
        alternateSelf,
        weatherCondition,
        currentStep,
        barometerPct,
      }),
    [alternateSelf, barometerPct, certificate, currentStep, weatherCondition]
  );

  const alternateSelfViewModel = useMemo(
    () => buildAlternateSelfViewModel(alternateSelf),
    [alternateSelf]
  );

  const livePhrase = useMemo(() => getLivePhraseFromLevel(currentLevel), [currentLevel]);

  return (
    <div className="app-container">
      <div
        ref={flashRef}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'white',
          zIndex: 99999,
          pointerEvents: 'none',
          opacity: 0,
        }}
      />

      <div
        ref={bulletinRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99990,
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          backgroundColor: 'rgba(0,0,0,0.85)',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(16px, 3vw, 32px)',
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            letterSpacing: '0.04em',
            lineHeight: 1.4,
          }}
        >
          SPECIAL BULLETIN
          <br />
          <span style={{ color: 'var(--accent-teal)', fontSize: '0.6em', letterSpacing: '0.12em' }}>
            - ALTERNATE UNIVERSE DETECTED -
          </span>
        </div>
        <div
          style={{
            marginTop: '16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--text-muted)',
            letterSpacing: '0.18em',
          }}
        >
          INITIATING 47-STEP PROTOCOL DEBRIEF
        </div>
      </div>

      <div
        ref={crtRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99998,
          display: 'none',
          pointerEvents: 'none',
        }}
      >
        <svg style={{ width: '100%', height: '100%' }}>
          <filter id="crt-glitch">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch">
              <animate
                attributeName="baseFrequency"
                values="0.85;0.9;0.82;0.9;0.85"
                dur="0.6s"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="5" />
            </feComponentTransfer>
          </filter>
          <rect width="100%" height="100%" filter="url(#crt-glitch)" />
        </svg>
      </div>

      <WeatherEngine weatherType={screen > 1 ? weatherType : null} />
      <NewsTicker />
      <CursorTrail />
      {screen < 3 && (
        <HUDBar
          isStreaming={isStreaming}
          isComplete={isComplete}
          step={currentStep}
          livePhrase={livePhrase}
          transitionPhase={transitionPhase}
          milestones={milestones}
        />
      )}
      <ChaosPanel />

      <div
        style={{
          position: 'fixed',
          left: '50%',
          bottom: '18px',
          transform: 'translateX(-50%)',
          zIndex: 9850,
          width: 'min(720px, calc(100vw - 24px))',
          border: '1px solid var(--border-mid)',
          borderRadius: '10px',
          background: 'linear-gradient(108deg, rgba(10,14,26,0.9) 0%, rgba(12,18,30,0.9) 100%)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
        }}
      >
        <button
          type="button"
          onClick={handlePrevScreen}
          disabled={screen <= INITIAL_SCREEN || transitionLockRef.current}
          style={{
            minWidth: '82px',
            padding: '8px 10px',
            border: '1px solid var(--border-mid)',
            borderRadius: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.08em',
            color: screen <= INITIAL_SCREEN ? 'var(--text-dim)' : 'var(--text-bright)',
            background: 'transparent',
            cursor: screen <= INITIAL_SCREEN ? 'not-allowed' : 'pointer',
          }}
        >
          PREV
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {[1, 2, 3, 4].map((target) => {
            const active = target === screen;
            return (
              <button
                key={target}
                type="button"
                onClick={() => handleNavigateTo(target)}
                disabled={transitionLockRef.current}
                style={{
                  minWidth: '40px',
                  padding: '7px 8px',
                  border: active ? '1px solid var(--accent-teal)' : '1px solid var(--border-mid)',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: active ? 'var(--accent-teal)' : 'var(--text-secondary)',
                  background: active ? 'rgba(74,222,204,0.08)' : 'transparent',
                  cursor: transitionLockRef.current ? 'not-allowed' : 'pointer',
                }}
              >
                S{target}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleNextScreen}
          disabled={screen >= LAST_SCREEN || transitionLockRef.current}
          style={{
            minWidth: '82px',
            padding: '8px 10px',
            border: '1px solid var(--border-mid)',
            borderRadius: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.08em',
            color: screen >= LAST_SCREEN ? 'var(--text-dim)' : 'var(--text-bright)',
            background: 'transparent',
            cursor: screen >= LAST_SCREEN ? 'not-allowed' : 'pointer',
          }}
        >
          NEXT
        </button>
      </div>

      <main style={{ width: '100vw', height: '100vh', overflow: screen === 4 ? 'auto' : 'hidden' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ width: '100%', height: '100%' }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;

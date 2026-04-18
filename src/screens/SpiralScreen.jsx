import React from 'react';
import { motion } from 'framer-motion';
import RadarFrameScrub from '../components/RadarFrameScrub';
import SpiralFeed from '../components/SpiralFeed';
import Barometer from '../components/Barometer';
import WeatherClassification from '../components/WeatherClassification';
import ForecastBar from '../components/ForecastBar';

const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const isMobileViewport = window.matchMedia?.('(max-width: 900px)').matches;

const SpiralScreen = ({
  steps = [],
  currentLevel = 1,
  weatherCondition = 'Calibrating',
  barometerPct = 0,
  isStreaming = false,
  error = null,
  onRestart,
  forecastSource = 'pending',
  forecastModel = null,
}) => {
  const stepCount = steps.length;
  const hasNoSteps = stepCount === 0;
  const showOverlay = hasNoSteps && (isStreaming || Boolean(error));
  const sourceLabel =
    forecastSource === 'gemini'
      ? `SOURCE: GEMINI LIVE${forecastModel ? ` (${forecastModel})` : ''}`
      : forecastSource === 'fallback'
        ? 'SOURCE: LOCAL EMERGENCY FORECAST'
        : 'SOURCE: CALIBRATING FEED';

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>

      {/* THE RADAR WORLD */}
      <div style={{
        position: 'absolute', left: '50%', top: '48%',
        transform: 'translate(-50%, -50%)', zIndex: 10
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <RadarFrameScrub mode="controlled" currentStep={stepCount} totalSteps={47} size={isMobileViewport ? 300 : 520} />
        </motion.div>
      </div>

      {/* FLOATING INSTRUMENTS — each mounts independently with Framer Motion */}
      <WeatherClassification level={currentLevel} />
      <Barometer step={stepCount} />
      <SpiralFeed steps={steps} currentLevel={currentLevel} />
      <ForecastBar step={stepCount} />

      {showOverlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 80,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: 'min(620px, calc(100vw - 48px))',
              border: '0.5px solid var(--border-mid)',
              backgroundColor: 'rgba(8,12,20,0.78)',
              backdropFilter: 'blur(8px)',
              padding: '18px 20px',
              boxShadow: '0 12px 36px rgba(0,0,0,0.45)',
              pointerEvents: error ? 'auto' : 'none',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                color: 'var(--text-dim)',
                letterSpacing: '0.14em',
                marginBottom: '8px',
              }}
            >
              LIVE FORECAST INTAKE
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                color: forecastSource === 'fallback' ? 'var(--amber)' : 'var(--teal)',
                letterSpacing: '0.12em',
                marginBottom: '8px',
                textTransform: 'uppercase',
              }}
            >
              {sourceLabel}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '14px',
                color: error ? 'var(--red)' : 'var(--text-bright)',
                lineHeight: 1.5,
                maxHeight: '110px',
                overflowY: 'auto',
                paddingRight: '6px',
              }}
            >
              {error
                ? `Transmission interrupted: ${error}`
                : 'Calibrating atmospheric dread field. First step is about to broadcast.'}
            </div>
            <div
              style={{
                marginTop: '10px',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--text-mid)',
              }}
            >
              Conditions: {weatherCondition} | Barometer: {barometerPct}% | Depth: {stepCount} / 47
            </div>
            {error && (
              <button
                onClick={onRestart}
                style={{
                  marginTop: '14px',
                  pointerEvents: 'auto',
                  background: 'transparent',
                  border: '0.5px solid var(--red)',
                  color: 'var(--text-bright)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  padding: '8px 14px',
                  cursor: 'pointer',
                }}
              >
                RESET CHANNEL
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SpiralScreen;

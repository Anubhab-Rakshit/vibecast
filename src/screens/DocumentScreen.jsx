import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// The dot leader row
const DataRow = ({ label, value, isStriped }) => (
  <div style={{
    display: 'flex', alignItems: 'baseline', height: '28px',
    backgroundColor: isStriped ? 'rgba(139,115,85,0.06)' : 'transparent',
    padding: '0 8px',
  }}>
    <span style={{ fontFamily: 'var(--font-cert)', fontSize: '13px', color: '#5C4A2A', whiteSpace: 'nowrap' }}>{label}</span>
    <div style={{
      flexGrow: 1, margin: '0 8px', height: '1px',
      backgroundImage: 'radial-gradient(circle, #B8A898 1px, transparent 1px)',
      backgroundSize: '8px 8px', backgroundRepeat: 'repeat-x',
      backgroundPosition: 'bottom', position: 'relative', top: '-4px'
    }} />
    <span style={{ fontFamily: 'var(--font-cert)', fontSize: '13px', color: '#2C2416', whiteSpace: 'nowrap' }}>{value}</span>
  </div>
);

const OfficialSeal = () => {
  const sealRef = useRef(null);
  const holoRef = useRef(null);

  useEffect(() => {
    if (!sealRef.current || prefersReducedMotion) {
      if (sealRef.current) {
        sealRef.current.style.opacity = '1';
        sealRef.current.style.transform = 'rotate(-15deg)';
      }
      if (holoRef.current) holoRef.current.style.opacity = '0.8';
      return;
    }

    // GSAP: dramatic stamp impact — delay until cert + rows finish
    const tl = gsap.timeline({ delay: 1.0 });
    tl.fromTo(sealRef.current,
      { scale: 3, rotation: -45, opacity: 0 },
      { scale: 0.9, rotation: -15, opacity: 1, duration: 0.2, ease: 'power4.in' }
    )
    .to(sealRef.current,
      { scale: 1.1, duration: 0.15, ease: 'power2.out' }
    )
    .to(sealRef.current,
      { scale: 1, duration: 0.1, ease: 'power2.inOut' }
    )
    // After settle: holographic shimmer fades in
    .to(holoRef.current,
      { opacity: 1, duration: 0.6, ease: 'power2.out' },
      '+=0.1'
    );
  }, []);

  return (
    <>
      <style>{`
        @property --holo-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes holo-rotate {
          from { --holo-angle: 0deg; }
          to   { --holo-angle: 360deg; }
        }
        .seal-holo-shimmer {
          animation: holo-rotate 4s linear infinite;
          background: conic-gradient(
            from var(--holo-angle, 0deg),
            transparent 20%,
            rgba(74,222,204,0.45) 35%,
            transparent 50%,
            rgba(255,195,0,0.3) 65%,
            transparent 80%
          );
        }
      `}</style>

      <div
        ref={sealRef}
        style={{
          position: 'absolute', bottom: '40px', right: '48px',
          width: '100px', height: '100px',
          borderRadius: '50%',
          border: '1.5px solid #8B7355',
          backgroundColor: '#F5F0E8',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 20,
          transformOrigin: 'center center',
          boxShadow: '0 0 0 4px rgba(139,115,85,0.08), inset 0 0 10px rgba(139,115,85,0.08)',
          opacity: 0,
          overflow: 'hidden',
        }}
      >
        <svg width="100" height="100" viewBox="0 0 100 100">
          {/* Outer ring */}
          <circle cx="50" cy="50" r="47" fill="none" stroke="#8B7355" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="#8B7355" strokeWidth="0.5" />

          {/* Arc text path — upper arc */}
          <path id="seal-arc-top" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0" fill="none" />
          <text style={{ fontSize: '6.5px', fontFamily: 'var(--font-mono)', fill: '#8B7355', letterSpacing: '0.12em' }}>
            <textPath href="#seal-arc-top">NATIONAL MENTAL WEATHER SERVICE</textPath>
          </text>

          {/* "DR. A. VOIDSWORTH" centered below middle */}
          <text x="50" y="78" textAnchor="middle" style={{ fontSize: '5.5px', fontFamily: 'var(--font-mono)', fill: '#8B7355', letterSpacing: '0.1em' }}>
            DR. A. VOIDSWORTH
          </text>

          {/* Center weather icon group */}
          <g transform="translate(50, 48)">
            {/* Cloud shape */}
            <circle cx="0" cy="0" r="8" fill="none" stroke="#8B7355" strokeWidth="1" />
            {/* Rain lines */}
            {[-4, -2, 0, 2, 4].map((x, i) => (
              <line key={i} x1={x} y1={4} x2={x - 2} y2={9} stroke="#8B7355" strokeWidth="0.8" strokeLinecap="round" opacity="0.7" />
            ))}
            {/* Cloud bump top */}
            <path d="M -6 2 Q -3 -5 0 -6 Q 3 -5 6 2 Z" fill="#8B7355" opacity="0.5" />
          </g>
        </svg>

        {/* Holographic shimmer — true @property angle animation */}
        <div
          ref={holoRef}
          className="seal-holo-shimmer"
          style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            mixBlendMode: 'overlay',
            pointerEvents: 'none',
            zIndex: 2,
            opacity: 0,
          }}
        />
      </div>
    </>
  );
};

const DocumentScreen = ({
  onReset,
  certificate,
  weatherCondition,
  alternateSelf,
  forecastSource = 'pending',
  forecastModel = null,
  currentStep = 47,
  barometerPct = 94,
  isStreaming = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const certRef = useRef(null);
  const rowsRef = useRef([]);

  const sourceLabel =
    forecastSource === 'gemini'
      ? `LIVE GEMINI${forecastModel ? ` (${forecastModel})` : ''}`
      : forecastSource === 'fallback'
        ? 'LOCAL EMERGENCY FORECAST'
        : forecastSource === 'pending'
          ? 'CALIBRATING FEED'
          : 'SIGNAL UNKNOWN';

  const sourceColor =
    forecastSource === 'gemini'
      ? '#0F766E'
      : forecastSource === 'fallback'
        ? '#B45309'
        : '#475569';

  const feedStatusText = isStreaming
    ? 'LIVE STREAM ACTIVE'
    : forecastSource === 'gemini'
      ? 'LIVE STREAM CAPTURED'
      : forecastSource === 'fallback'
        ? 'FALLBACK FORECAST ISSUED'
        : 'AWAITING FEED';

  const feedStatusGlow =
    forecastSource === 'gemini'
      ? '0 0 18px rgba(15,118,110,0.35)'
      : forecastSource === 'fallback'
        ? '0 0 18px rgba(180,83,9,0.28)'
        : '0 0 0 rgba(0,0,0,0)';

  const alternateHeadline = alternateSelf?.headline || 'ALTERNATE UNIVERSE - CLEAR CONDITIONS';
  const alternateWeatherReport =
    alternateSelf?.weatherReport ||
    'Current conditions: calm. Visibility: excellent. Dread index: 0.3.';
  const alternateBullets =
    Array.isArray(alternateSelf?.bulletPoints) && alternateSelf.bulletPoints.length
      ? alternateSelf.bulletPoints
      : [
          'The situation resolved without dramatic weather events.',
          'Administrative panic levels remain ceremonially low.',
          'Forward outlook: stable with traces of suspicious competence.',
        ];

  useEffect(() => {
    if (prefersReducedMotion || !certRef.current) return;

    // GSAP: certificate slides up from below
    const tl = gsap.timeline();
    tl.fromTo(certRef.current,
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
    )
    // Data rows stagger in
    .fromTo(rowsRef.current.filter(Boolean),
      { x: -12, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'power2.out' },
      0.5
    );
  }, []);

  const handleShare = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = async () => {
    if (isDownloading) {
      return;
    }

    const certificateNode = document.getElementById('forecast-certificate');
    if (!certificateNode) {
      return;
    }

    try {
      setIsDownloading(true);

      const canvas = await html2canvas(certificateNode, {
        backgroundColor: '#F5F0E8',
        scale: Math.min(3, window.devicePixelRatio || 2),
        useCORS: true,
      });

      const imageData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 28;
      const maxRenderWidth = pageWidth - margin * 2;
      const maxRenderHeight = pageHeight - margin * 2;

      const renderRatio = Math.min(maxRenderWidth / canvas.width, maxRenderHeight / canvas.height);
      const renderWidth = canvas.width * renderRatio;
      const renderHeight = canvas.height * renderRatio;
      const x = (pageWidth - renderWidth) / 2;
      const y = (pageHeight - renderHeight) / 2;

      pdf.addImage(imageData, 'PNG', x, y, renderWidth, renderHeight, undefined, 'FAST');

      const safeSource = (forecastSource || 'pending').toLowerCase();
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `vibecast-forecast-${safeSource}-${timestamp}.pdf`;
      pdf.save(filename);
    } finally {
      setIsDownloading(false);
    }
  };

  const rows = [
    ['Current Conditions', certificate?.currentConditions || weatherCondition || 'Midnight Dread Hurricane', false],
    ['Spiral Depth', `${certificate?.spiralDepth || 47} / 47`, true],
    ['Anxiety Barometer', certificate?.anxietyBarometer || '94%', false],
    ['Alternate Self Status', certificate?.alternateSelfStatus || 'Thriving (confirmed)', true],
    ['Short-term Forecast', certificate?.shortTermForecast || 'Paralysis by analysis', false],
    ['Tonight\'s Forecast', certificate?.tonightForecast || 'Replaying conversations from 2014', true],
    ['Long-term Outlook', certificate?.longTermForecast || 'Uncertain. Highly cloudy.', false],
  ];

  return (
    <div style={{
      width: '100vw', minHeight: '100vh', backgroundColor: 'var(--bg-primary)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '60px 20px', position: 'relative'
    }}>
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.6) 100%)', pointerEvents: 'none', zIndex: 0 }} />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.45, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: '860px',
          marginBottom: '20px',
          borderRadius: '10px',
          border: `1px solid ${sourceColor}`,
          background:
            forecastSource === 'gemini'
              ? 'linear-gradient(120deg, rgba(15,118,110,0.22) 0%, rgba(10,14,26,0.9) 55%, rgba(15,118,110,0.12) 100%)'
              : forecastSource === 'fallback'
                ? 'linear-gradient(120deg, rgba(180,83,9,0.2) 0%, rgba(10,14,26,0.9) 55%, rgba(180,83,9,0.12) 100%)'
                : 'linear-gradient(120deg, rgba(71,85,105,0.2) 0%, rgba(10,14,26,0.9) 55%, rgba(71,85,105,0.1) 100%)',
          boxShadow: `0 14px 34px rgba(0,0,0,0.4), ${feedStatusGlow}`,
          padding: '14px 16px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: sourceColor, boxShadow: feedStatusGlow, animation: 'radiate 1.4s infinite' }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--text-bright)' }}>
              {feedStatusText}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ border: `1px solid ${sourceColor}`, color: sourceColor, backgroundColor: 'rgba(255,255,255,0.06)', padding: '5px 10px', borderRadius: '999px', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.08em' }}>
              Source: {sourceLabel}
            </span>
            <span style={{ border: '1px solid var(--border-mid)', color: 'var(--text-secondary)', backgroundColor: 'rgba(8,12,20,0.6)', padding: '5px 10px', borderRadius: '999px', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.08em' }}>
              Steps Captured: {Math.max(currentStep, 0)} / 47
            </span>
            <span style={{ border: '1px solid var(--border-mid)', color: 'var(--text-secondary)', backgroundColor: 'rgba(8,12,20,0.6)', padding: '5px 10px', borderRadius: '999px', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.08em' }}>
              Anxiety Barometer: {Math.max(0, Math.min(100, Math.round(barometerPct)))}%
            </span>
          </div>
        </div>
      </motion.div>

      <div
        ref={certRef}
        id="forecast-certificate"
        style={{
          width: '100%', maxWidth: '680px', backgroundColor: '#F5F0E8',
          borderRadius: '2px', padding: '40px 48px', position: 'relative', zIndex: 10,
          boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
          border: '2px solid #8B7355',
          outline: '0.5px solid #8B7355', outlineOffset: '-6px', overflow: 'hidden',
          opacity: prefersReducedMotion ? 1 : 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '16px',
            padding: '4px 8px',
            borderRadius: '999px',
            border: `1px solid ${sourceColor}`,
            color: sourceColor,
            fontFamily: 'var(--font-mono)',
            fontSize: '8px',
            letterSpacing: '0.1em',
            backgroundColor: 'rgba(255,255,255,0.55)',
            textTransform: 'uppercase',
          }}
        >
          Source: {sourceLabel}
        </div>

        {/* Crosshatch Texture */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.03, pointerEvents: 'none' }}>
          <pattern id="crosshatch" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M 8 0 L 0 8 M 0 0 L 8 8" stroke="#000" strokeWidth="0.5" fill="none" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#crosshatch)" />
        </svg>

        {/* Corner Ornaments */}
        {[
          { top: '6px', left: '6px' },
          { top: '6px', right: '6px' },
          { bottom: '6px', left: '6px' },
          { bottom: '6px', right: '6px' }
        ].map((pos, i) => (
          <div key={i} style={{ position: 'absolute', width: '20px', height: '20px', border: '1px solid #8B7355', opacity: 0.5, ...pos }} />
        ))}

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ color: '#8B7355', letterSpacing: '-1px', overflow: 'hidden', whiteSpace: 'nowrap' }}>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
          <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 'bold', color: '#2C2416', letterSpacing: '0.12em', margin: '12px 0 4px 0' }}>
            NATIONAL MENTAL WEATHER SERVICE
          </h1>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#5C4A2A', letterSpacing: '0.05em' }}>
            OFFICIAL PSYCHOLOGICAL FORECAST — 47-STEP CERTIFIED PROTOCOL
          </div>
          <div style={{ color: '#8B7355', letterSpacing: '-1px', overflow: 'hidden', whiteSpace: 'nowrap', marginTop: '8px' }}>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
        </div>

        {/* Data Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '32px' }}>
          {rows.map(([label, value, striped], i) => (
            <div key={i} ref={el => rowsRef.current[i] = el} style={{ opacity: prefersReducedMotion ? 1 : 0 }}>
              <DataRow label={label} value={value} isStriped={striped} />
            </div>
          ))}
        </div>

        {/* Advisory Block */}
        <div style={{ borderLeft: '2px solid #8B7355', paddingLeft: '16px', marginBottom: '48px', width: '75%' }}>
          <div className="label-caps" style={{ fontSize: '9px', color: '#2D7D6A', marginBottom: '8px' }}>
            OFFICIAL WEATHER ADVISORY
          </div>
          <div style={{ fontFamily: 'var(--font-signature)', fontStyle: 'italic', fontSize: '14px', color: '#2C2416', lineHeight: 1.8 }}>
            "{certificate?.officialAdvisory || 'The storm is contained entirely within the skull. No external umbrellas will help. Suggest lying flat on the floor until the front passes.'}"
          </div>
        </div>

        <div style={{
          border: '1px dashed rgba(45,125,106,0.45)',
          borderRadius: '4px',
          padding: '14px',
          marginBottom: '40px',
          background: 'linear-gradient(160deg, rgba(45,125,106,0.08) 0%, rgba(255,255,255,0.35) 100%)',
        }}>
          <div className="label-caps" style={{ fontSize: '9px', color: '#2D7D6A', marginBottom: '8px' }}>
            LIVE PARALLEL-WORLD DIGEST
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#5C4A2A', letterSpacing: '0.08em', marginBottom: '8px', textTransform: 'uppercase' }}>
            {alternateHeadline}
          </div>
          <div style={{ fontFamily: 'var(--font-cert)', fontSize: '13px', color: '#2C2416', lineHeight: 1.5, marginBottom: '10px' }}>
            {alternateWeatherReport}
          </div>
          <div style={{ display: 'grid', gap: '8px' }}>
            {alternateBullets.slice(0, 3).map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ color: '#2D7D6A', fontSize: '12px', lineHeight: 1.4 }}>•</span>
                <span style={{ fontFamily: 'var(--font-cert)', fontSize: '12px', color: '#3A2F1E', lineHeight: 1.45 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <OfficialSeal />

        {/* Barcode */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <svg width="120" height="24" preserveAspectRatio="none">
            {[...Array(30)].map((_, i) => (
              <rect key={i} x={i * 4} y="0" width={1 + (i % 3)} height="24" fill="#5C4A2A" />
            ))}
          </svg>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: '#8B7355', marginTop: '4px' }}>
            USELESS-47-VOIDSWORTH
          </div>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '9px', fontStyle: 'italic', color: '#8B7355' }}>
          This certificate is not a medical document. Or is it. We honestly don't know anymore.
        </div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : 1.8 }}
        style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '32px', marginBottom: '92px', zIndex: 10 }}
      >
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          style={{
          backgroundColor: 'var(--accent-red)', color: 'white',
          fontFamily: 'var(--font-mono)', fontSize: '13px',
          padding: '12px 24px', borderRadius: '4px', border: 'none',
          display: 'flex', alignItems: 'center', gap: '12px',
          cursor: isDownloading ? 'not-allowed' : 'pointer',
          opacity: isDownloading ? 0.75 : 1,
          boxShadow: '0 4px 12px rgba(239,68,68,0.2)'
        }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'white', animation: isDownloading ? 'none' : 'radiate 1s infinite' }} />
          {isDownloading ? 'GENERATING PDF...' : 'DOWNLOAD FORECAST PDF'}
        </button>

        <button onClick={handleShare} style={{
          backgroundColor: 'transparent', color: 'var(--text-primary)',
          fontFamily: 'var(--font-mono)', fontSize: '13px',
          padding: '12px 24px', borderRadius: '4px',
          border: '0.5px solid var(--text-secondary)', cursor: 'pointer',
          transition: 'all 0.2s ease', width: '180px'
        }}>
          {copied ? "COPIED ✓" : "SHARE MY DIAGNOSIS"}
        </button>

        <button onClick={onReset} style={{
          backgroundColor: 'transparent', color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)', fontSize: '11px',
          padding: '12px 24px', border: 'none', cursor: 'pointer',
          textDecoration: 'underline transparent', transition: 'text-decoration 0.2s ease'
        }}
          onMouseEnter={(e) => e.target.style.textDecorationColor = 'var(--text-muted)'}
          onMouseLeave={(e) => e.target.style.textDecorationColor = 'transparent'}
        >
          FORECAST ANOTHER CRISIS
        </button>
      </motion.div>
    </div>
  );
};

export default DocumentScreen;

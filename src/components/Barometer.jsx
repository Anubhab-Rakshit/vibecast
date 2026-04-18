import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const Barometer = ({ step = 0 }) => {
  const needleRef = useRef(null);
  const pctRef = useRef(null);
  const prevPct = useRef(0);

  const percentage = Math.min(100, Math.round((step / 47) * 100));

  // GSAP: spring-eased needle rotation
  useEffect(() => {
    if (!needleRef.current) return;
    const targetRotation = (percentage / 100) * 180;

    if (prefersReducedMotion) {
      gsap.set(needleRef.current, { rotation: targetRotation, transformOrigin: '90px 80px' });
    } else {
      gsap.to(needleRef.current, {
        rotation: targetRotation,
        transformOrigin: '90px 80px',
        duration: 0.7,
        ease: 'back.out(1.2)', // Slight overshoot spring
      });
    }

    // Count-up the percentage number
    if (pctRef.current) {
      gsap.to({ val: prevPct.current }, {
        val: percentage,
        duration: prefersReducedMotion ? 0 : 0.5,
        ease: 'power2.out',
        onUpdate: function() {
          if (pctRef.current) {
            pctRef.current.textContent = Math.round(this.targets()[0].val) + '%';
          }
        }
      });
    }
    prevPct.current = percentage;
  }, [percentage]);

  let stateText = "MILD CONCERN";
  let stateColor = 'var(--teal)';
  if (percentage > 20) { stateText = "ELEVATED AVOIDANCE"; stateColor = '#60A5FA'; }
  if (percentage > 40) { stateText = "SEVERE FIXATION"; stateColor = 'var(--amber)'; }
  if (percentage > 70) { stateText = "CRITICAL SPIRAL"; stateColor = 'var(--fog)'; }
  if (percentage > 90) { stateText = "SEEK SHELTER"; stateColor = 'var(--red)'; }

  const r = 60, cx = 90, cy = 80;

  const getArcPath = (startAngle, endAngle) => {
    const start = {
      x: cx + r * Math.cos(Math.PI - startAngle * Math.PI / 180),
      y: cy - r * Math.sin(Math.PI - startAngle * Math.PI / 180)
    };
    const end = {
      x: cx + r * Math.cos(Math.PI - endAngle * Math.PI / 180),
      y: cy - r * Math.sin(Math.PI - endAngle * Math.PI / 180)
    };
    return `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`;
  };

  return (
    <div style={{
      position: 'absolute', left: '48px', bottom: '96px',
      width: '180px', height: '120px',
      backgroundColor: 'var(--bg-surface)',
      border: '0.5px solid var(--border-mid)',
      borderRadius: '4px', padding: '16px',
      display: 'flex', flexDirection: 'column', zIndex: 30
    }}>
      <div style={{ position: 'relative', width: '100%', height: '70px' }}>
        <svg viewBox="0 0 180 80" style={{ width: '100%', height: '100%' }}>
          <path d={getArcPath(0, 45)} fill="none" stroke="var(--teal)" strokeWidth="6" strokeLinecap="butt" />
          <path d={getArcPath(45, 90)} fill="none" stroke="var(--amber)" strokeWidth="6" strokeLinecap="butt" />
          <path d={getArcPath(90, 135)} fill="none" stroke="#F97316" strokeWidth="6" strokeLinecap="butt" />
          <path d={getArcPath(135, 180)} fill="none" stroke="var(--red)" strokeWidth="6" strokeLinecap="butt" />

          {/* Needle group — GSAP controls rotation */}
          <g ref={needleRef}>
            <line x1={cx} y1={cy} x2={cx - r + 4} y2={cy} stroke="var(--text-bright)" strokeWidth="1.5" strokeLinecap="round" />
          </g>

          <circle cx={cx} cy={cy} r="4" fill="var(--text-bright)" />
        </svg>

        <div style={{ position: 'absolute', bottom: '-4px', left: '0', fontFamily: 'var(--font-mono)', fontSize: '7px', color: 'var(--text-dim)', width: '40px' }}>
          MILD CONCERN
        </div>
        <div style={{ position: 'absolute', bottom: '-4px', right: '0', fontFamily: 'var(--font-mono)', fontSize: '7px', color: 'var(--red)', textAlign: 'right', width: '40px' }}>
          SEEK SHELTER
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 'auto' }}>
        <div ref={pctRef} style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', color: 'var(--text-bright)', lineHeight: 1 }}>
          {percentage}%
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '8px', color: stateColor,
          marginTop: '2px',
          animation: percentage > 90 ? 'blink 0.5s infinite' : 'none'
        }}>
          {stateText}
        </div>
      </div>
    </div>
  );
};

export default Barometer;

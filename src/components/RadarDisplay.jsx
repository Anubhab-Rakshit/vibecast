import React, { useRef, useEffect, useMemo } from 'react';

const RadarDisplay = ({
  size = 520,
  stormProgress = 0, // 0 to 1
  isLevel5 = false
}) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  const step = Math.floor(stormProgress * 47);

  // Generate deterministic random offsets that change every 3 steps
  const blobOffsets = useMemo(() => {
    const seed = Math.floor(step / 3);
    // Simple pseudo-random function
    const pseudoRandom = (index) => {
      const x = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453;
      return x - Math.floor(x);
    };

    return Array(8).fill(0).map((_, i) => (pseudoRandom(i) * 40) - 20); // ±20px
  }, [Math.floor(step / 3)]);

  // Determine blob color based on step
  let blobColor = [74, 222, 204]; // teal
  if (step > 10) blobColor = [96, 165, 250];   // blue
  if (step > 20) blobColor = [245, 158, 11];   // amber
  if (step > 30) blobColor = [239, 68, 68];    // red
  if (step > 40) blobColor = [239, 68, 68];    // deep red (handled by opacity later)
  if (isLevel5) blobColor = [239, 68, 68];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const R = size / 2;
    let angle = 0;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);

      // --- Layer 2: 3 Concentric rings ---
      [0.33, 0.66, 0.99].forEach((ratio) => {
        ctx.beginPath();
        ctx.arc(R, R, R * ratio, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(74, 222, 204, 0.06)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      // --- Layer 3: Crosshairs ---
      ctx.beginPath();
      ctx.moveTo(0, R); ctx.lineTo(size, R);
      ctx.moveTo(R, 0); ctx.lineTo(R, size);
      ctx.strokeStyle = 'rgba(74, 222, 204, 0.04)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // --- Layer 5: Organic Storm blob ---
      if (stormProgress > 0) {
        const baseRadius = stormProgress * 240; // Max 240px
        
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const theta = (i / 8) * Math.PI * 2;
          const r = Math.max(0, baseRadius + blobOffsets[i]);
          const x = R + Math.cos(theta) * r;
          const y = R + Math.sin(theta) * r;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            // Smooth bezier using midway points
            const prevTheta = ((i - 1) / 8) * Math.PI * 2;
            const prevR = Math.max(0, baseRadius + blobOffsets[i - 1]);
            const prevX = R + Math.cos(prevTheta) * prevR;
            const prevY = R + Math.sin(prevTheta) * prevR;
            
            const midX = (prevX + x) / 2;
            const midY = (prevY + y) / 2;
            
            ctx.quadraticCurveTo(prevX, prevY, midX, midY);
            if (i === 7) {
              const startR = Math.max(0, baseRadius + blobOffsets[0]);
              const startX = R + Math.cos(0) * startR;
              const startY = R + Math.sin(0) * startR;
              const finalMidX = (x + startX) / 2;
              const finalMidY = (y + startY) / 2;
              ctx.quadraticCurveTo(x, y, finalMidX, finalMidY);
              ctx.quadraticCurveTo(startX, startY, startX, startY);
            }
          }
        }
        ctx.closePath();

        // Opacity mapping based on step
        let opacity = 0.15;
        if (step > 10) opacity = 0.18;
        if (step > 20) opacity = 0.20;
        if (step > 30) opacity = 0.22;
        if (step > 40) opacity = 0.30;

        ctx.fillStyle = `rgba(${blobColor.join(',')}, ${opacity})`;
        ctx.fill();
      }

      // --- Layer 4: Radar sweep ---
      const sweepSpeed = step >= 47 ? 0.1 : 0.026; // Accelerate at end
      angle += sweepSpeed; 
      
      const wakeAngle = Math.PI / 6; 
      const trailGrad = ctx.createLinearGradient(
        R + Math.cos(angle - wakeAngle) * R,
        R + Math.sin(angle - wakeAngle) * R,
        R + Math.cos(angle) * R,
        R + Math.sin(angle) * R
      );
      trailGrad.addColorStop(0, 'rgba(74, 222, 204, 0)');
      trailGrad.addColorStop(1, 'rgba(74, 222, 204, 0.06)');

      ctx.beginPath();
      ctx.moveTo(R, R);
      ctx.arc(R, R, R, angle - wakeAngle, angle);
      ctx.closePath();
      ctx.fillStyle = trailGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(R, R);
      ctx.lineTo(R + Math.cos(angle) * R, R + Math.sin(angle) * R);
      const lineGrad = ctx.createLinearGradient(
        R, R,
        R + Math.cos(angle) * R, R + Math.sin(angle) * R
      );
      lineGrad.addColorStop(0, '#4ADECC');
      lineGrad.addColorStop(1, 'transparent');
      ctx.strokeStyle = lineGrad;
      ctx.lineWidth = 1;
      ctx.stroke();

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [size, stormProgress, isLevel5, ...blobColor, blobOffsets, step]);

  const compassStyle = {
    position: 'absolute',
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    color: 'var(--text-ghost)',
    pointerEvents: 'none',
  };

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <div style={{ ...compassStyle, top: '-24px', left: '50%', transform: 'translateX(-50%)' }}>N</div>
      <div style={{ ...compassStyle, bottom: '-24px', left: '50%', transform: 'translateX(-50%)' }}>S</div>
      <div style={{ ...compassStyle, left: '-24px', top: '50%', transform: 'translateY(-50%)' }}>W</div>
      <div style={{ ...compassStyle, right: '-24px', top: '50%', transform: 'translateY(-50%)' }}>E</div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          backgroundColor: 'var(--bg-void)',
          border: '1px solid rgba(74,222,204,0.1)',
          overflow: 'hidden',
          animation: isLevel5 ? 'shake-level-5 0.15s steps(4) infinite' : 'none',
          boxShadow: '0 0 40px rgba(0,0,0,0.5)', 
        }}
      >
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          style={{ display: 'block', width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
};

export default RadarDisplay;

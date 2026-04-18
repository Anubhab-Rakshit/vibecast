import { useEffect, useRef, useState } from 'react';

const FRAME_COUNT = 30;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function drawRadarBase(ctx, size) {
  const center = size / 2;
  const radius = size / 2;

  ctx.clearRect(0, 0, size, size);

  ctx.save();
  ctx.beginPath();
  ctx.arc(center, center, radius - 1, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  ctx.fillStyle = '#0A0E1A';
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = 'rgba(74, 222, 204, 0.08)';
  ctx.lineWidth = 1;

  [0.25, 0.5, 0.75].forEach((ring) => {
    ctx.beginPath();
    ctx.arc(center, center, radius * ring, 0, Math.PI * 2);
    ctx.stroke();
  });

  ctx.restore();
}

function blobFillStyle(progress) {
  if (progress <= 0.3) {
    return 'rgba(74, 222, 204, 0.70)';
  }
  if (progress <= 0.6) {
    return 'rgba(245, 158, 11, 0.75)';
  }
  if (progress <= 0.85) {
    return 'rgba(239, 68, 68, 0.80)';
  }
  return 'rgba(220, 38, 38, 0.90)';
}

function buildBlobPoints(stormRadius, frameIndex, centerX, centerY) {
  const points = [];
  const count = 8;
  for (let point = 0; point < count; point += 1) {
    const angle = (Math.PI * 2 * point) / count;
    const noise = Math.sin(point * 2.3 + frameIndex * 0.4) * stormRadius * 0.15;
    const radius = Math.max(0, stormRadius + noise);
    points.push({
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    });
  }
  return points;
}

function drawStormBlob(ctx, size, frameIndex, progress) {
  const baseCenter = size / 2;
  const stormRadius = progress * size * 0.48;

  if (stormRadius <= 0) {
    return;
  }

  const wobbleX = progress > 0.85 ? Math.sin(frameIndex * 7.3) * 4 : 0;
  const wobbleY = progress > 0.85 ? Math.cos(frameIndex * 5.1) * 3 : 0;

  const centerX = baseCenter + wobbleX;
  const centerY = baseCenter + wobbleY;
  const points = buildBlobPoints(stormRadius, frameIndex, centerX, centerY);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 0; i < points.length; i += 1) {
    const current = points[i];
    const next = points[(i + 1) % points.length];
    const controlX = (current.x + next.x) / 2;
    const controlY = (current.y + next.y) / 2;
    ctx.bezierCurveTo(current.x, current.y, controlX, controlY, next.x, next.y);
  }

  ctx.closePath();
  ctx.fillStyle = blobFillStyle(progress);
  ctx.fill();
  ctx.restore();

  if (progress > 0.5) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;

    const armLength = stormRadius * 0.9;
    const armCurve = stormRadius * 0.45;

    ctx.beginPath();
    ctx.moveTo(centerX - stormRadius * 0.1, centerY - stormRadius * 0.1);
    ctx.bezierCurveTo(
      centerX + armCurve,
      centerY - armCurve,
      centerX + armLength,
      centerY + armCurve * 0.3,
      centerX + stormRadius * 0.2,
      centerY + armLength * 0.55
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX + stormRadius * 0.1, centerY + stormRadius * 0.1);
    ctx.bezierCurveTo(
      centerX - armCurve,
      centerY + armCurve,
      centerX - armLength,
      centerY - armCurve * 0.25,
      centerX - stormRadius * 0.25,
      centerY - armLength * 0.6
    );
    ctx.stroke();
    ctx.restore();
  }
}

function drawLiveSweep(ctx, size, angleRadians) {
  const center = size / 2;
  const radius = size / 2;

  ctx.clearRect(0, 0, size, size);

  ctx.save();
  ctx.beginPath();
  ctx.arc(center, center, radius - 1, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  const endX = center + Math.cos(angleRadians) * radius;
  const endY = center + Math.sin(angleRadians) * radius;

  const gradient = ctx.createLinearGradient(center, center, endX, endY);
  gradient.addColorStop(0, 'rgba(74, 222, 204, 0)');
  gradient.addColorStop(0.35, 'rgba(74, 222, 204, 0.18)');
  gradient.addColorStop(1, 'rgba(74, 222, 204, 0.82)');

  ctx.strokeStyle = gradient;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(center, center);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  ctx.restore();
}

export default function RadarFrameScrub({
  mode = 'autoplay',
  currentStep = 0,
  totalSteps = 47,
  size = 280,
}) {
  const canvasRef = useRef(null);
  const sweepRef = useRef(null);
  const framesRef = useRef([]);
  const sweepRafRef = useRef(0);
  const [displayFrame, setDisplayFrame] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const offscreen = document.createElement('canvas');
    offscreen.width = size;
    offscreen.height = size;
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });

    if (!offCtx) {
      setIsReady(false);
      return;
    }

    const generated = [];
    for (let i = 0; i < FRAME_COUNT; i += 1) {
      const progress = i / (FRAME_COUNT - 1);
      drawRadarBase(offCtx, size);
      drawStormBlob(offCtx, size, i, progress);
      generated.push(offCtx.getImageData(0, 0, size, size));
    }

    framesRef.current = generated;
    setDisplayFrame((prev) => clamp(prev, 0, FRAME_COUNT - 1));
    setIsReady(true);

    return () => {
      framesRef.current = [];
      setIsReady(false);
    };
  }, [size]);

  useEffect(() => {
    if (mode !== 'controlled') {
      return undefined;
    }

    const safeTotal = Math.max(totalSteps, 1);
    const clampedStep = clamp(currentStep, 0, safeTotal);
    const mappedFrame = Math.round((clampedStep / safeTotal) * (FRAME_COUNT - 1));
    setDisplayFrame(clamp(mappedFrame, 0, FRAME_COUNT - 1));

    return undefined;
  }, [mode, currentStep, totalSteps]);

  useEffect(() => {
    if (mode !== 'autoplay') {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setDisplayFrame((prev) => (prev + 1) % FRAME_COUNT);
    }, 900);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [mode]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const canvas = canvasRef.current;
    const frame = framesRef.current[displayFrame];
    if (!canvas || !frame) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    ctx.putImageData(frame, 0, 0);
  }, [displayFrame, isReady]);

  useEffect(() => {
    const sweepCanvas = sweepRef.current;
    if (!sweepCanvas) {
      return undefined;
    }

    const sweepCtx = sweepCanvas.getContext('2d');
    if (!sweepCtx) {
      return undefined;
    }

    const animate = () => {
      const now = performance.now();
      const angle = ((now / 10) % 360) * (Math.PI / 180);
      drawLiveSweep(sweepCtx, size, angle);
      sweepRafRef.current = window.requestAnimationFrame(animate);
    };

    sweepRafRef.current = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(sweepRafRef.current);
    };
  }, [size]);

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
      }}
    >
      <canvas ref={canvasRef} width={size} height={size} />
      <canvas
        ref={sweepRef}
        width={size}
        height={size}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

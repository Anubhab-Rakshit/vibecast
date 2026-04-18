import React from 'react';

const WeatherBadge = ({ level = 1 }) => {
  // Determine color based on 1-5 level specification
  let color = 'var(--teal)'; // 1
  if (level === 2) color = '#60A5FA';
  if (level === 3) color = 'var(--amber)';
  if (level === 4) color = 'var(--fog)';
  if (level >= 5) color = 'var(--red)';

  const text = level === 1 ? 'MILD' : 
               level === 2 ? 'ELEVATED' : 
               level === 3 ? 'SEVERE' : 
               level === 4 ? 'CRITICAL' : 'MAXIMUM';

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      borderLeft: `2px solid ${color}`,
      padding: '2px 8px',
      fontFamily: 'var(--font-mono)',
      fontSize: '9px',
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: color
    }}>
      LEVEL {level}: {text}
    </div>
  );
};

export default WeatherBadge;

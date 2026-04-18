import React from 'react';

const NewsTicker = () => {
  const messages = [
    "4.2 billion humans are overthinking something right now",
    "Mercury is in retrograde. Your ping is 450ms. These are related.",
    "ALERT: Your alternate self replied to that email immediately. They are fine.",
    "FORECAST: Partly cloudy with a 90% chance of not doing the thing",
    "BREAKING: Local human has been 'about to start' for 3 hours",
    "ADVISORY: Existential fog persisting through the weekend",
    "UPDATE: The thing you are avoiding has not gone away"
  ];

  return (
    <div className="news-ticker" style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      height: '40px', 
      background: 'var(--bg-surface)', 
      borderBottom: '1px solid var(--border)',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      zIndex: 100
    }}>
      <div style={{ 
        display: 'flex', 
        whiteSpace: 'nowrap',
        animation: 'ticker-scroll 30s linear infinite',
        gap: '50px'
      }}>
        {messages.concat(messages).map((msg, i) => (
          <span key={i} className="label-caps" style={{ color: 'var(--accent-teal)', fontSize: '12px' }}>
            {msg}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default NewsTicker;

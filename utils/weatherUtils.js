export function getWeatherConditionFromLevel(level) {
  if (level <= 1) return 'Mild Avoidance Drizzle';
  if (level === 2) return 'Category 2 Procrastination Front';
  if (level === 3) return 'Overthinking Thunderstorm';
  if (level === 4) return 'Existential Fog';
  return 'Midnight Dread Hurricane';
}

export function getLivePhraseFromLevel(level) {
  if (level <= 1) return 'Atmosphere: nominal unease';
  if (level === 2) return 'Atmosphere: escalating postponement';
  if (level === 3) return 'Atmosphere: thunderhead cognition';
  if (level === 4) return 'Atmosphere: dense existential fog';
  return 'Atmosphere: category-five dread core';
}

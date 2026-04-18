import { useCallback, useEffect, useRef, useState } from 'react';
import { streamForecast } from '../utils/geminiApi';

const TOTAL_STEPS = 47;

const initialState = {
  steps: [],
  currentLevel: 1,
  barometerPct: 0,
  isStreaming: false,
  isComplete: false,
  alternateSelf: null,
  certificate: null,
  forecastSource: 'idle',
  forecastModel: null,
  weatherType: 'FOG', // Default to FOG
  error: null,
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function calculateBarometer(stepCount, currentLevel) {
  const countProgress = (stepCount / TOTAL_STEPS) * 70;
  const levelProgress = (currentLevel / 5) * 30;
  return clamp(Math.round(countProgress + levelProgress), 0, 100);
}

export default function useSpiral() {
  const [steps, setSteps] = useState(initialState.steps);
  const [currentLevel, setCurrentLevel] = useState(initialState.currentLevel);
  const [barometerPct, setBarometerPct] = useState(initialState.barometerPct);
  const [isStreaming, setIsStreaming] = useState(initialState.isStreaming);
  const [isComplete, setIsComplete] = useState(initialState.isComplete);
  const [alternateSelf, setAlternateSelf] = useState(initialState.alternateSelf);
  const [certificate, setCertificate] = useState(initialState.certificate);
  const [forecastSource, setForecastSource] = useState(initialState.forecastSource);
  const [forecastModel, setForecastModel] = useState(initialState.forecastModel);
  const [weatherType, setWeatherType] = useState(initialState.weatherType);
  const [error, setError] = useState(initialState.error);

  const cleanupRef = useRef(() => {});
  const runIdRef = useRef(0);
  const highestLevelRef = useRef(initialState.currentLevel);
  const abortControllerRef = useRef(null);

  const reset = useCallback(() => {
    cleanupRef.current();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    runIdRef.current += 1;
    highestLevelRef.current = initialState.currentLevel;

    setSteps(initialState.steps);
    setCurrentLevel(initialState.currentLevel);
    setBarometerPct(initialState.barometerPct);
    setIsStreaming(initialState.isStreaming);
    setIsComplete(initialState.isComplete);
    setAlternateSelf(initialState.alternateSelf);
    setCertificate(initialState.certificate);
    setForecastSource(initialState.forecastSource);
    setForecastModel(initialState.forecastModel);
    setWeatherType(initialState.weatherType);
    setError(initialState.error);

    cleanupRef.current = () => {};
  }, []);

  const startForecast = useCallback(
    async (userInput) => {
      cleanupRef.current();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      runIdRef.current += 1;
      const activeRunId = runIdRef.current;
      let isCancelled = false;

      cleanupRef.current = () => {
        isCancelled = true;
        abortController.abort();
      };

      highestLevelRef.current = initialState.currentLevel;
      setSteps(initialState.steps);
      setCurrentLevel(initialState.currentLevel);
      setBarometerPct(initialState.barometerPct);
      setIsStreaming(true);
      setIsComplete(false);
      setAlternateSelf(initialState.alternateSelf);
      setCertificate(initialState.certificate);
      setForecastSource('pending');
      setForecastModel(null);
      setWeatherType(initialState.weatherType);
      setError(initialState.error);

      const isActive = () => !isCancelled && runIdRef.current === activeRunId;

      try {
        await streamForecast(userInput, {
          signal: abortController.signal,
          onStep: (incomingStep) => {
            if (!isActive()) {
              return;
            }

            setSteps((prevSteps) => {
              const exists = prevSteps.some((step) => step.step === incomingStep.step);
              if (exists) {
                return prevSteps;
              }

              const nextSteps = [...prevSteps, incomingStep].sort((a, b) => a.step - b.step);
              const escalatedLevel = Math.max(highestLevelRef.current, incomingStep.weatherLevel || 1);

              highestLevelRef.current = escalatedLevel;
              setCurrentLevel(escalatedLevel);
              setBarometerPct(calculateBarometer(nextSteps.length, escalatedLevel));

              return nextSteps;
            });
          },
          onAlternateSelf: (payload) => {
            if (!isActive()) {
              return;
            }
            setAlternateSelf(payload || null);
          },
          onCertificate: (payload) => {
            if (!isActive()) {
              return;
            }
            setCertificate(payload || null);
          },
          onMeta: (meta) => {
            if (!isActive()) {
              return;
            }
            setForecastSource(meta?.source || 'pending');
            setForecastModel(meta?.model || null);
          },
          onError: (message) => {
            if (!isActive()) {
              return;
            }
            setError(message || 'Unknown streaming error');
            setIsStreaming(false);
            setIsComplete(false);
          },
          onComplete: (payload) => {
            if (!isActive()) {
              return;
            }
            if (payload?.weatherType) {
              setWeatherType(payload.weatherType);
            }
            setIsStreaming(false);
            setIsComplete(true);
          },
        });
      } catch (caughtError) {
        if (!isActive()) {
          return;
        }

        if (abortController.signal.aborted) {
          return;
        }

        const message =
          caughtError instanceof Error
            ? caughtError.message
            : 'Unexpected forecast startup error';
        setError(message);
        setIsStreaming(false);
        setIsComplete(false);
      } finally {
        if (abortControllerRef.current === abortController) {
          abortControllerRef.current = null;
        }
      }
    },
    []
  );

  useEffect(() => {
    return () => {
      cleanupRef.current();
    };
  }, []);

  return {
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
    reset,
  };
}

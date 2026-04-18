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
  const [error, setError] = useState(initialState.error);

  const cleanupRef = useRef(() => {});
  const runIdRef = useRef(0);
  const highestLevelRef = useRef(initialState.currentLevel);

  const reset = useCallback(() => {
    cleanupRef.current();
    runIdRef.current += 1;
    highestLevelRef.current = initialState.currentLevel;

    setSteps(initialState.steps);
    setCurrentLevel(initialState.currentLevel);
    setBarometerPct(initialState.barometerPct);
    setIsStreaming(initialState.isStreaming);
    setIsComplete(initialState.isComplete);
    setAlternateSelf(initialState.alternateSelf);
    setCertificate(initialState.certificate);
    setError(initialState.error);

    cleanupRef.current = () => {};
  }, []);

  const startForecast = useCallback(
    async (userInput) => {
      cleanupRef.current();
      runIdRef.current += 1;
      const activeRunId = runIdRef.current;
      let isCancelled = false;

      cleanupRef.current = () => {
        isCancelled = true;
      };

      highestLevelRef.current = initialState.currentLevel;
      setSteps(initialState.steps);
      setCurrentLevel(initialState.currentLevel);
      setBarometerPct(initialState.barometerPct);
      setIsStreaming(true);
      setIsComplete(false);
      setAlternateSelf(initialState.alternateSelf);
      setCertificate(initialState.certificate);
      setError(initialState.error);

      const isActive = () => !isCancelled && runIdRef.current === activeRunId;

      await streamForecast(userInput, {
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
        onError: (message) => {
          if (!isActive()) {
            return;
          }
          setError(message || 'Unknown streaming error');
          setIsStreaming(false);
          setIsComplete(false);
        },
        onComplete: () => {
          if (!isActive()) {
            return;
          }
          setIsStreaming(false);
          setIsComplete(true);
        },
      });
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
    error,
    startForecast,
    reset,
  };
}

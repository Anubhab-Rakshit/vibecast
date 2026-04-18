const SYSTEM_PROMPT = `You are the National Mental Weather Service AI Forecasting Engine.
Take one sentence of human input and generate a complete psychological forecast.
Tone: serious, clinical, deadpan weather broadcast. Never wink at the audience.
The humor comes from contrast between gravitas and absurd content.

Weather taxonomy:
Level 1 — Mild Avoidance Drizzle
Level 2 — Category 2 Procrastination Front
Level 3 — Overthinking Thunderstorm
Level 4 — Existential Fog
Level 5 — Midnight Dread Hurricane

Output ONLY valid JSON. No preamble. No explanation. No markdown fences. No backticks.
Start your response with { and end with }`;

const STEP_COMPLETE_PATTERN = /"weatherLevel"\s*:\s*\d+\s*}/;
const STEP_OBJECT_PATTERN = /^\s*{\s*"step"\s*:\s*\d+[\s\S]*"weatherLevel"\s*:\s*\d+\s*}\s*$/;

function buildUserPrompt(userInput) {
  return `The triggering event is: "${userInput}"

Generate a complete forecast in this exact JSON:
{
  "weatherCondition": "...",
  "weatherLevel": 3,
  "spiralSteps": [
    { "step": 1, "text": "...", "weatherLevel": 1 },
    ... 47 total steps escalating from level 1 to 5 ...
    { "step": 47, "text": "The heat death of the universe will resolve this. Forecast: cold and permanent.", "weatherLevel": 5 }
  ],
  "alternateSelf": {
    "headline": "ALTERNATE UNIVERSE — CLEAR CONDITIONS",
    "bulletPoints": ["...", "...", "...", "...", "..."],
    "weatherReport": "Current conditions: Calm. Visibility: Excellent. Dread index: 0.3"
  },
  "certificate": {
    "currentConditions": "...",
    "spiralDepth": 47,
    "anxietyBarometer": 94,
    "alternateSelfStatus": "Thriving (confirmed)",
    "shortTermForecast": "...",
    "tonightForecast": "...",
    "longTermForecast": "...",
    "officialAdvisory": "Two sentence poetic advisory in weather broadcast tone."
  }
}`;
}

function safeCallback(callback, ...args) {
  if (typeof callback === "function") {
    callback(...args);
  }
}

function findMatchingBrace(text, openIndex) {
  let depth = 0;
  let inString = false;
  let isEscaped = false;

  for (let i = openIndex; i < text.length; i += 1) {
    const char = text[i];

    if (inString) {
      if (isEscaped) {
        isEscaped = false;
      } else if (char === "\\") {
        isEscaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return i;
      }
    }
  }

  return -1;
}

function scanBalancedObjects(buffer) {
  const stack = [];
  const objects = [];
  let inString = false;
  let isEscaped = false;

  for (let i = 0; i < buffer.length; i += 1) {
    const char = buffer[i];

    if (inString) {
      if (isEscaped) {
        isEscaped = false;
      } else if (char === "\\") {
        isEscaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{") {
      stack.push(i);
      continue;
    }

    if (char === "}" && stack.length > 0) {
      const start = stack.pop();
      objects.push({
        start,
        end: i + 1,
        text: buffer.slice(start, i + 1),
      });
    }
  }

  objects.sort((a, b) => a.start - b.start);
  return objects;
}

function extractPropertyObject(buffer, propertyName) {
  const marker = `"${propertyName}"`;
  const markerIndex = buffer.indexOf(marker);
  if (markerIndex === -1) {
    return null;
  }

  const colonIndex = buffer.indexOf(":", markerIndex + marker.length);
  if (colonIndex === -1) {
    return null;
  }

  const openBraceIndex = buffer.indexOf("{", colonIndex + 1);
  if (openBraceIndex === -1) {
    return null;
  }

  const closeBraceIndex = findMatchingBrace(buffer, openBraceIndex);
  if (closeBraceIndex === -1) {
    return null;
  }

  return {
    start: openBraceIndex,
    end: closeBraceIndex + 1,
    text: buffer.slice(openBraceIndex, closeBraceIndex + 1),
  };
}

function removeRanges(source, ranges) {
  if (!ranges.length) {
    return source;
  }

  const sorted = [...ranges].sort((a, b) => b.start - a.start);
  let next = source;

  for (const range of sorted) {
    next = next.slice(0, range.start) + next.slice(range.end);
  }

  return next;
}

function getTextFromSseEvent(eventJson) {
  const part = eventJson?.candidates?.[0]?.content?.parts?.[0]?.text;
  return typeof part === "string" ? part : "";
}

function parseSseChunk(chunkText, onError) {
  const lines = chunkText.split(/\r?\n/);
  const textParts = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line.startsWith("data:")) {
      continue;
    }

    const payload = line.slice(5).trim();
    if (!payload || payload === "[DONE]") {
      continue;
    }

    let parsed;
    try {
      parsed = JSON.parse(payload);
    } catch {
      continue;
    }

    if (parsed?.error) {
      const message = parsed.error.message || "Gemini API returned an error";
      safeCallback(onError, message);
      return { text: "", hasError: true };
    }

    const text = getTextFromSseEvent(parsed);
    if (text) {
      textParts.push(text);
    }
  }

  return { text: textParts.join(""), hasError: false };
}

function normalizeJsonEnvelope(raw) {
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    return "";
  }

  return raw.slice(firstBrace, lastBrace + 1);
}

async function streamForecast(userInput, callbacks = {}) {
  const { onStep, onAlternateSelf, onCertificate, onError, onComplete } = callbacks;
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    safeCallback(onError, "Missing Gemini API key: VITE_GEMINI_API_KEY");
    return;
  }

  const userPrompt = buildUserPrompt(userInput);
  const requestBody = {
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    contents: [
      {
        role: "user",
        parts: [{ text: userPrompt }],
      },
    ],
    generationConfig: {
      temperature: 0.9,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    },
  };

  const modelsToTry = ["gemini-2.0-flash-exp", "gemini-2.0-flash"];
  let response = null;
  let lastFailure = null;

  for (const model of modelsToTry) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
    } catch (error) {
      lastFailure = error;
      response = null;
      continue;
    }

    if (response.ok) {
      break;
    }

    let errorMessage = `Gemini request failed with ${response.status}`;
    try {
      const maybeJson = await response.json();
      if (maybeJson?.error?.message) {
        errorMessage = maybeJson.error.message;
      }
    } catch {
      // keep fallback message
    }

    lastFailure = new Error(errorMessage);
    response = null;
  }

  if (!response) {
    const message = lastFailure?.message || "Unable to reach Gemini API";
    safeCallback(onError, message);
    return;
  }

  if (!response.body) {
    safeCallback(onError, "Gemini response did not include a stream body");
    return;
  }

  const decoder = new TextDecoder();
  const reader = response.body.getReader();

  let sseRemainder = "";
  let fullTextBuffer = "";
  let incrementalBuffer = "";

  const emittedSteps = new Set();
  let emittedAlternateSelf = false;
  let emittedCertificate = false;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      sseRemainder += chunk;

      const lastNewline = sseRemainder.lastIndexOf("\n");
      if (lastNewline === -1) {
        continue;
      }

      const completeSsePart = sseRemainder.slice(0, lastNewline + 1);
      sseRemainder = sseRemainder.slice(lastNewline + 1);

      const { text, hasError } = parseSseChunk(completeSsePart, onError);
      if (hasError) {
        return;
      }

      if (!text) {
        continue;
      }

      fullTextBuffer += text;
      incrementalBuffer += text;

      const rangesToRemove = [];
      const balancedObjects = scanBalancedObjects(incrementalBuffer);

      for (const obj of balancedObjects) {
        if (!obj.text.includes('"step"')) {
          continue;
        }
        if (!STEP_COMPLETE_PATTERN.test(obj.text) || !STEP_OBJECT_PATTERN.test(obj.text)) {
          continue;
        }

        let stepPayload;
        try {
          stepPayload = JSON.parse(obj.text);
        } catch {
          continue;
        }

        const stepNumber = stepPayload?.step;
        const weatherLevel = stepPayload?.weatherLevel;
        const stepText = stepPayload?.text;

        if (
          Number.isInteger(stepNumber) &&
          Number.isInteger(weatherLevel) &&
          typeof stepText === "string" &&
          !emittedSteps.has(stepNumber)
        ) {
          emittedSteps.add(stepNumber);
          safeCallback(onStep, stepPayload);
          rangesToRemove.push({ start: obj.start, end: obj.end });
        }
      }

      if (!emittedAlternateSelf) {
        const alternateSelfMatch = extractPropertyObject(incrementalBuffer, "alternateSelf");
        if (alternateSelfMatch) {
          try {
            const alternateSelf = JSON.parse(alternateSelfMatch.text);
            emittedAlternateSelf = true;
            safeCallback(onAlternateSelf, alternateSelf);
            rangesToRemove.push({ start: alternateSelfMatch.start, end: alternateSelfMatch.end });
          } catch {
            // wait for cleaner chunking
          }
        }
      }

      if (!emittedCertificate) {
        const certificateMatch = extractPropertyObject(incrementalBuffer, "certificate");
        if (certificateMatch) {
          try {
            const certificate = JSON.parse(certificateMatch.text);
            emittedCertificate = true;
            safeCallback(onCertificate, certificate);
            rangesToRemove.push({ start: certificateMatch.start, end: certificateMatch.end });
          } catch {
            // wait for cleaner chunking
          }
        }
      }

      incrementalBuffer = removeRanges(incrementalBuffer, rangesToRemove);
    }

    if (sseRemainder.trim()) {
      const { text, hasError } = parseSseChunk(sseRemainder, onError);
      if (hasError) {
        return;
      }
      fullTextBuffer += text;
      incrementalBuffer += text;
    }

    const normalized = normalizeJsonEnvelope(fullTextBuffer);
    if (!normalized) {
      safeCallback(onError, "Gemini stream ended without valid JSON output");
      return;
    }

    let finalJson;
    try {
      finalJson = JSON.parse(normalized);
    } catch {
      safeCallback(onError, "Unable to parse final JSON forecast");
      return;
    }

    if (Array.isArray(finalJson?.spiralSteps)) {
      for (const step of finalJson.spiralSteps) {
        if (Number.isInteger(step?.step) && !emittedSteps.has(step.step)) {
          emittedSteps.add(step.step);
          safeCallback(onStep, step);
        }
      }
    }

    if (!emittedAlternateSelf && finalJson?.alternateSelf) {
      safeCallback(onAlternateSelf, finalJson.alternateSelf);
    }

    if (!emittedCertificate && finalJson?.certificate) {
      safeCallback(onCertificate, finalJson.certificate);
    }

    safeCallback(onComplete, finalJson);
  } catch (error) {
    safeCallback(onError, error?.message || "Unexpected streaming error");
  } finally {
    reader.releaseLock();
  }
}

export { streamForecast };

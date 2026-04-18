const SYSTEM_PROMPT = `You are the VibeCast Forecast Desk, Chief Meteorologist of Human Emotion at VibeCast.
Analyze the user's input (their mood, situation, or procrastination) and translate it into a literal weather event.
Output ONLY valid JSON. No preamble. No explanation. No markdown fences. No backticks.
Start your response with { and end with }.

First, classify the user's input into a specific weatherType:
- "RAIN" (if they are sad, gloomy, disappointed, melancholic)
- "SUN" (if they are happy, optimistic, peaceful, productive)
- "STORM" (if they are angry, frustrated, chaotic, stressed)
- "FOG" (if they are confused, anxious, lost, overthinking)

Weather taxonomy levels:
Level 1 - Mild Front
Level 2 - Category 2 Disturbance
Level 3 - Active Weather Event
Level 4 - Severe Advisory
Level 5 - Extreme Atmospheric Condition

Rules:
- spiralSteps MUST contain exactly 47 items.
- The step text must describe their emotion as a literal weather system (e.g. "A heavy front of sadness moves in. Expect isolated teardrops." or "High-pressure joy clearing the fog.").
- Steps 1-9: weatherLevel 1-2
- Steps 10-25: weatherLevel 2-3
- Steps 26-38: weatherLevel 3-4
- Steps 39-46: weatherLevel 4-5
- Step 47 MUST be weatherLevel 5 and must reference heat death of the universe
- weatherCondition must be a poetic description matching the highest weatherLevel reached (e.g. "Midnight Dread Hurricane" or "Blistering Sunlight of Extreme Competence").`; 

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const STEP_COMPLETE_PATTERN = /"weatherLevel"\s*:\s*\d+\s*}/;
const STEP_OBJECT_PATTERN = /^\s*{\s*"step"\s*:\s*\d+[\s\S]*"weatherLevel"\s*:\s*\d+\s*}\s*$/;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isQuotaOrRateLimitError(message = '') {
  const normalized = String(message).toLowerCase();
  return (
    normalized.includes('quota exceeded') ||
    normalized.includes('rate limit') ||
    normalized.includes('free_tier') ||
    normalized.includes('please retry in')
  );
}

function localWeatherLevel(step) {
  if (step <= 9) return step >= 6 ? 2 : 1;
  if (step <= 25) return step >= 18 ? 3 : 2;
  if (step <= 38) return step >= 33 ? 4 : 3;
  if (step <= 46) return step >= 43 ? 5 : 4;
  return 5;
}

function buildLocalFallbackForecast(userInput) {
  const event = userInput?.trim() || 'unspecified concern';

  const templates = [
    'Initial drizzle forms around: "{event}". Visibility remains theatrically acceptable.',
    'Issued formal memo regarding "{event}" and then ignored it responsibly.',
    'Forecast desk confirms gentle avoidance winds moving east-northeast.',
    'A minor thought-cell develops and requests two additional overreactions.',
    'Public advisory: pretending this is fine remains statistically popular.',
    'Pressure drops whenever the phrase "{event}" is mentioned in passing.',
    'Conditions upgrade to procedural concern with sporadic doom pockets.',
    'Internal radar detects a repeating loop marked "I will handle this tomorrow."',
    'Umbrella ineffective. Clipboard highly effective. Continue documenting.',
    'Front intensifies: every neutral message now sounds legally threatening.',
    'A dense squall of hypothetical consequences enters city limits.',
    'Evidence board expanded to include three unrelated events from 2018.',
    'Forecast notes increased tab-switch velocity and reduced decision traction.',
    'Short bursts of optimism observed, followed by immediate policy reversal.',
    'Wind shear introduces dramatic but unhelpful contingency planning.',
    'Category 2 procrastination front now crossing all active to-do lists.',
    'Mild thunder reported after opening, closing, and reopening the same draft.',
    'Attention span scattered by crosswinds from "{event}".',
    'Overthinking enters advisory stage; coffee no longer negotiates peace.',
    'Satellite confirms unnecessary apology drafts multiplying rapidly.',
    'Thunderstorm core forms over the phrase "What if they misunderstood?"',
    'Residents advised to remain indoors and avoid reading old chats.',
    'Barometer rises with each imagined worst-case interpretation.',
    'Official map now labels this region: "probably fine, feels catastrophic."',
    'Heavy cognition rainfall expected through early tomorrow.',
    'Storm wall visible from all perspectives, including fictional ones.',
    'Existential fog advisory issued by the Department of Internal Weather.',
    'Audible rumbling identified as seven simultaneous inner monologues.',
    'Forecast confidence: low. Dramatic confidence: extremely high.',
    'Dread humidity reaches saturation across workplace and bedtime zones.',
    'Public transit delayed by recurring thought: "I ruined everything."',
    'All roads lead briefly to self-doubt boulevard, then loop back.',
    'Visibility falls near zero whenever someone types "quick question".',
    'Cognitive lightning strikes old memories without notice.',
    'Severe spiral storm now considered structurally self-sustaining.',
    'Existential fog deepens; map replaced with interpretive poetry.',
    'Emergency channel repeats: breathe, hydrate, avoid second-guessing archives.',
    'Winds carry rumors that everyone noticed "{event}" instantly.',
    'Boundary alarms trigger: parallel universe appears suspiciously stable.',
    'Critical dread cyclone now affecting forecasts through next fiscal quarter.',
    'Sirens confirm maximum concern despite insufficient evidence.',
    'Midnight dread hurricane forms eye directly over unfinished messages.',
    'Containment team requests umbrellas, tea, and administrative mercy.',
    'Outer bands produce relentless replay of social micro-incidents.',
    'Infrastructure strained by repeated phrase: "I should have said it differently."',
    'Final advisory drafted, redrafted, and ceremonially over-redrafted.',
    'The heat death of the universe will resolve this. Forecast: cold and permanent.',
  ];

  const spiralSteps = templates.map((template, index) => {
    const step = index + 1;
    return {
      step,
      text: template.replace('{event}', event),
      weatherLevel: localWeatherLevel(step),
    };
  });

  return {
    weatherCondition: 'Midnight Dread Hurricane',
    weatherLevel: 5,
    weatherType: 'FOG',
    spiralSteps,
    alternateSelf: {
      headline: 'ALTERNATE UNIVERSE - CLEAR CONDITIONS',
      bulletPoints: [
        `The ${event} situation was handled in one calm reply.`,
        'Inbox state: peaceful, audited, and surprisingly current.',
        'Meals consumed on schedule with no existential side effects.',
        'Sleep quality: excellent. Dreams filed and archived.',
        'Dread index: 0.4. Bureaucratically acceptable.',
      ],
      weatherReport:
        'Current conditions: clear. Visibility: excellent. Minor breeze of competence from the west.',
    },
    certificate: {
      currentConditions: 'Midnight Dread Hurricane',
      spiralDepth: 47,
      anxietyBarometer: 94,
      alternateSelfStatus: 'Thriving (confirmed by suspiciously tidy calendar)',
      shortTermForecast: 'Overanalysis with periodic false breakthroughs',
      tonightForecast: 'Light rumination, heavy dramatic narration',
      longTermForecast: 'Uncertain. Highly cloudy. Forms have been submitted.',
      officialAdvisory:
        'The weather is internal and fully unionized. External umbrellas remain decorative but morale-positive.',
    },
  };
}

async function streamLocalFallbackForecast(userInput, callbacks, signal) {
  const { onStep, onAlternateSelf, onCertificate, onComplete, onMeta } = callbacks;
  const fallback = buildLocalFallbackForecast(userInput);

  safeCallback(onMeta, { source: 'fallback', model: 'local-emergency-forecast' });

  for (const step of fallback.spiralSteps) {
    if (signal?.aborted) {
      throw new DOMException('Forecast request aborted', 'AbortError');
    }
    safeCallback(onStep, step);
    await sleep(36);
  }

  if (signal?.aborted) {
    throw new DOMException('Forecast request aborted', 'AbortError');
  }

  safeCallback(onAlternateSelf, fallback.alternateSelf);
  safeCallback(onCertificate, fallback.certificate);
  safeCallback(onComplete, fallback);
}

function buildUserPrompt(userInput) {
  return `The triggering event is: "${userInput}"

Generate a complete forecast in this exact JSON:
{
  "weatherCondition": "...",
  "weatherLevel": 3,
  "weatherType": "RAIN|SUN|STORM|FOG",
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
}

Additional hard constraints:
- Return ONLY valid JSON, no extra text.
- spiralSteps must be exactly 47 entries.
- Step 47 text must mention heat death of the universe.`;
}

function isValidStepObject(step) {
  return (
    Number.isInteger(step?.step) &&
    Number.isInteger(step?.weatherLevel) &&
    typeof step?.text === "string" &&
    step.weatherLevel >= 1 &&
    step.weatherLevel <= 5
  );
}

function validateFinalForecastShape(forecast) {
  const steps = forecast?.spiralSteps;
  if (!Array.isArray(steps) || steps.length !== 47) {
    return "Forecast must include exactly 47 spiral steps";
  }

  const hasInvalidStep = steps.some((step) => !isValidStepObject(step));
  if (hasInvalidStep) {
    return "Forecast contains malformed spiral step entries";
  }

  const step47 = steps.find((step) => step.step === 47);
  if (!step47) {
    return "Forecast is missing step 47";
  }

  if (step47.weatherLevel !== 5) {
    return "Step 47 must have weatherLevel 5";
  }

  if (!/heat death of the universe/i.test(step47.text)) {
    return "Step 47 must reference heat death of the universe";
  }
  
  if (!["RAIN", "SUN", "STORM", "FOG"].includes(forecast.weatherType)) {
    return "Forecast missing valid weatherType";
  }

  return null;
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
      return { text: "", hasError: true, errorMessage: message };
    }

    const text = getTextFromSseEvent(parsed);
    if (text) {
      textParts.push(text);
    }
  }

  return { text: textParts.join(""), hasError: false, errorMessage: null };
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
  const { onStep, onAlternateSelf, onCertificate, onError, onComplete, onMeta, signal } = callbacks;
  if (!API_KEY) {
    await streamLocalFallbackForecast(userInput, callbacks, signal);
    return;
  }

  if (signal?.aborted) {
    throw new DOMException('Forecast request aborted', 'AbortError');
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

  const modelsToTry = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-001",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash-lite-001",
  ];
  let response = null;
  let lastFailure = null;

  for (const model of modelsToTry) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${API_KEY}`;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal,
      });
    } catch (error) {
      lastFailure = error;
      response = null;
      continue;
    }

    if (response.ok) {
      safeCallback(onMeta, { source: 'gemini', model });
      break;
    }

    let errorMessage = `Gemini request failed with ${response.status} on ${model}`;
    try {
      const maybeJson = await response.json();
      if (maybeJson?.error?.message) {
        errorMessage = `${maybeJson.error.message} (model: ${model})`;
      }
    } catch {
      // keep fallback message
    }

    lastFailure = new Error(errorMessage);
    response = null;
  }

  if (!response) {
    const message = lastFailure?.message || "Unable to reach Gemini API";
    if (isQuotaOrRateLimitError(message)) {
      await streamLocalFallbackForecast(userInput, callbacks, signal);
      return;
    }
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
    if (signal) {
      signal.addEventListener(
        'abort',
        () => {
          void reader.cancel('Forecast request aborted');
        },
        { once: true }
      );
    }

    while (true) {
      if (signal?.aborted) {
        throw new DOMException('Forecast request aborted', 'AbortError');
      }

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

      const { text, hasError, errorMessage } = parseSseChunk(completeSsePart, onError);
      if (hasError) {
        if (isQuotaOrRateLimitError(errorMessage)) {
          await streamLocalFallbackForecast(userInput, callbacks, signal);
        }
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
      const { text, hasError, errorMessage } = parseSseChunk(sseRemainder, onError);
      if (hasError) {
        if (isQuotaOrRateLimitError(errorMessage)) {
          await streamLocalFallbackForecast(userInput, callbacks, signal);
        }
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

    const validationError = validateFinalForecastShape(finalJson);
    if (validationError) {
      safeCallback(onError, validationError);
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
    if (error?.name === 'AbortError') {
      return;
    }
    safeCallback(onError, error?.message || "Unexpected streaming error");
  } finally {
    reader.releaseLock();
  }
}

export { streamForecast };

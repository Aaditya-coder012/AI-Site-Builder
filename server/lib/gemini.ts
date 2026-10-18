import { GoogleGenAI } from "@google/genai";

const getGeminiApiKey = () =>
  process.env.GEMINI_API_KEY || process.env.AI_API_KEY || "";

export const geminiModels = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.5-pro",
] as const;

export const ai = new GoogleGenAI(
  getGeminiApiKey() ? { apiKey: getGeminiApiKey() } : {},
);

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String((error as any)?.message || error);

const getErrorStatus = (error: unknown) => {
  const rawStatus = (error as any)?.status ?? (error as any)?.code;
  const parsedStatus =
    typeof rawStatus === "string" ? Number.parseInt(rawStatus, 10) : rawStatus;

  return Number.isFinite(parsedStatus) ? parsedStatus : undefined;
};

const isRetryableError = (error: unknown) => {
  const message = getErrorMessage(error).toLowerCase();
  const status = getErrorStatus(error);

  return (
    status === 429 ||
    status === 503 ||
    status === 504 ||
    message.includes("too many requests") ||
    message.includes("resource_exhausted") ||
    message.includes("quota exceeded") ||
    message.includes("rate limit") ||
    message.includes("high demand") ||
    message.includes("unavailable") ||
    message.includes("temporarily")
  );
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getRetryableErrorMessage = (error: unknown) => {
  const status = getErrorStatus(error);

  if (status === 429) {
    return "The AI service is rate-limited right now. Please try again in a moment.";
  }

  if (status === 503 || status === 504) {
    return "The AI service is temporarily unavailable. Please try again in a moment.";
  }

  return "The AI service is temporarily busy. Please try again in a moment.";
};

const generateMockTemplate = (prompt: string): string => {
  const cleanTitle = prompt.replace(/[^\w\s-]/g, "").slice(0, 32) || "Modern Web Studio";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${cleanTitle}</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen selection:bg-indigo-500 selection:text-white">
  <nav class="fixed top-0 inset-x-0 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 z-50 px-6 py-4">
    <div class="max-w-6xl mx-auto flex items-center justify-between">
      <a href="#" class="font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">${cleanTitle}</a>
      <div class="space-x-8 text-sm text-slate-300 font-medium hidden md:flex">
        <a href="#features" class="hover:text-indigo-400 transition-colors">Features</a>
        <a href="#showcase" class="hover:text-indigo-400 transition-colors">Showcase</a>
        <a href="#pricing" class="hover:text-indigo-400 transition-colors">Pricing</a>
      </div>
      <a href="#cta" class="px-5 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/30">Get Started</a>
    </div>
  </nav>

  <section class="pt-36 pb-24 px-6 max-w-6xl mx-auto flex flex-col items-center text-center">
    <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-medium mb-8">
      <span class="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span> Built with AI Precision
    </div>
    <h1 class="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6">
      Transforming ideas into <span class="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">captivating websites</span>.
    </h1>
    <p class="text-slate-400 text-lg sm:text-xl max-w-2xl mb-10 leading-relaxed">
      ${prompt}
    </p>
    <div class="flex flex-wrap items-center justify-center gap-4">
      <a href="#cta" class="px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-xl shadow-indigo-600/30">Explore Demo</a>
      <a href="#features" class="px-7 py-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold transition-all">Learn More</a>
    </div>
  </section>

  <section id="features" class="py-20 px-6 max-w-6xl mx-auto border-t border-slate-900">
    <div class="text-center mb-16">
      <h2 class="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Core Capabilities</h2>
      <p class="text-slate-400 max-w-xl mx-auto">Everything you need to deliver high-impact digital experiences.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-8 hover:border-indigo-500/50 transition-all">
        <div class="w-12 h-12 rounded-xl bg-indigo-950/80 border border-indigo-800/50 flex items-center justify-center text-indigo-400 text-xl mb-6">
          <i class="fa-solid fa-bolt"></i>
        </div>
        <h3 class="text-xl font-bold mb-3">Ultra Fast</h3>
        <p class="text-slate-400 text-sm leading-relaxed">Engineered with clean Tailwind CSS utilities for maximum load speeds.</p>
      </div>
      <div class="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-8 hover:border-purple-500/50 transition-all">
        <div class="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-800/50 flex items-center justify-center text-purple-400 text-xl mb-6">
          <i class="fa-solid fa-layer-group"></i>
        </div>
        <h3 class="text-xl font-bold mb-3">Modular Layout</h3>
        <p class="text-slate-400 text-sm leading-relaxed">Fully responsive components optimized for desktop, tablet, and mobile displays.</p>
      </div>
      <div class="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-8 hover:border-cyan-500/50 transition-all">
        <div class="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-800/50 flex items-center justify-center text-cyan-400 text-xl mb-6">
          <i class="fa-solid fa-sparkles"></i>
        </div>
        <h3 class="text-xl font-bold mb-3">Interactive UX</h3>
        <p class="text-slate-400 text-sm leading-relaxed">Built-in micro-interactions, smooth hover states, and seamless navigation.</p>
      </div>
    </div>
  </section>

  <section id="cta" class="py-20 px-6 max-w-5xl mx-auto">
    <div class="rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-700/40 p-10 sm:p-14 text-center">
      <h2 class="text-3xl sm:text-4xl font-extrabold mb-4">Start your journey today</h2>
      <p class="text-slate-300 max-w-xl mx-auto mb-8">Join the next wave of creators building with AI.</p>
      <button class="px-8 py-4 rounded-xl bg-white text-slate-950 font-bold hover:bg-slate-200 transition-all shadow-xl">Get Started</button>
    </div>
  </section>

  <footer class="py-12 border-t border-slate-900 text-center text-sm text-slate-500">
    <p>© 2026 ${cleanTitle}. Generated with AI Site Builder.</p>
  </footer>
</body>
</html>`;
};

export const generateContentWithFallback = async (contents: any) => {
  const currentKey = getGeminiApiKey();

  // If API key is available, run through Gemini models
  if (currentKey) {
    const genAi = new GoogleGenAI({ apiKey: currentKey });
    let lastError: unknown;
    let lastRetryableError: unknown;

    for (let index = 0; index < geminiModels.length; index += 1) {
      const model = geminiModels[index];
      const retries = 2;

      for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
          return await genAi.models.generateContent({
            model,
            contents,
          });
        } catch (error) {
          lastError = error;

          const retryable = isRetryableError(error);
          const hasMoreAttempts = attempt < retries;

          if (!retryable) {
            break;
          }

          lastRetryableError = error;

          if (hasMoreAttempts) {
            const delay = 1200 * Math.pow(2, attempt);
            await sleep(delay);
            continue;
          }

          break;
        }
      }
    }

    if (lastRetryableError) {
      console.warn("Gemini retryable error occurred, using fallback:", getErrorMessage(lastRetryableError));
    } else if (lastError) {
      console.warn("Gemini error occurred, using fallback:", getErrorMessage(lastError));
    }
  } else {
    console.warn("[AI Studio] GEMINI_API_KEY not configured — using fallback generator");
  }

  // Graceful fallback response when API key is missing or quota is exhausted
  const promptText =
    contents?.[0]?.parts?.[0]?.text ||
    contents?.[0]?.text ||
    "Modern Web Application";

  if (promptText.includes("enhance") || promptText.includes("prompt enhancement")) {
    const rawUserPromptMatch = promptText.match(/User(?:'s)? original prompt:\s*"([^"]+)"/i) ||
      promptText.match(/User's request:\s*"([^"]+)"/i);
    const userPrompt = rawUserPromptMatch ? rawUserPromptMatch[1] : "A modern responsive web application";
    return {
      text: `Create a clean, modern, and fully responsive website for: "${userPrompt}", featuring a sleek dark-themed header, intuitive navigation, high-converting hero banner, feature highlight cards with glowing accents, interactive call-to-action sections, and polished mobile-ready responsiveness with Tailwind CSS.`,
    };
  }

  return {
    text: generateMockTemplate(promptText),
  };
};

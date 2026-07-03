import { GoogleGenAI } from "@google/genai";
import { createOpenRouterClient } from "../configs/openai.js";
const geminiApiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY || "";
export const geminiModels = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.5-pro",
];
export const ai = new GoogleGenAI({ apiKey: geminiApiKey });
const openRouterModel = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
const getErrorMessage = (error) => error instanceof Error ? error.message : String(error?.message || error);
const getErrorStatus = (error) => {
    const rawStatus = error?.status ?? error?.code;
    const parsedStatus = typeof rawStatus === "string" ? Number.parseInt(rawStatus, 10) : rawStatus;
    return Number.isFinite(parsedStatus) ? parsedStatus : undefined;
};
const isRetryableError = (error) => {
    const message = getErrorMessage(error).toLowerCase();
    const status = getErrorStatus(error);
    return (status === 429 ||
        status === 503 ||
        status === 504 ||
        message.includes("too many requests") ||
        message.includes("resource_exhausted") ||
        message.includes("quota exceeded") ||
        message.includes("rate limit") ||
        message.includes("high demand") ||
        message.includes("unavailable") ||
        message.includes("temporarily"));
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const normalizeContentParts = (parts) => parts
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .join("")
    .trim();
const toOpenRouterMessages = (contents) => (Array.isArray(contents) ? contents : []).flatMap((entry) => {
    const text = normalizeContentParts(entry?.parts || []);
    if (!text) {
        return [];
    }
    return [
        {
            role: entry?.role === "assistant" ? "assistant" : "user",
            content: text,
        },
    ];
});
const generateContentWithOpenRouter = async (contents) => {
    const messages = toOpenRouterMessages(contents);
    if (messages.length === 0) {
        throw new Error("No prompt content was provided for fallback generation.");
    }
    const openai = createOpenRouterClient();
    const response = await openai.chat.completions.create({
        model: openRouterModel,
        messages,
        temperature: 0.7,
    });
    const text = response.choices[0]?.message?.content;
    return { text: typeof text === "string" ? text : "" };
};
const getRetryableErrorMessage = (error) => {
    const status = getErrorStatus(error);
    if (status === 429) {
        return "The AI service is rate-limited right now. Please try again in a moment.";
    }
    if (status === 503 || status === 504) {
        return "The AI service is temporarily unavailable. Please try again in a moment.";
    }
    return "The AI service is temporarily busy. Please try again in a moment.";
};
export const generateContentWithFallback = async (contents) => {
    if (!geminiApiKey) {
        throw new Error("GEMINI_API_KEY is not configured on the server.");
    }
    let lastError;
    let lastRetryableError;
    for (let index = 0; index < geminiModels.length; index += 1) {
        const model = geminiModels[index];
        const retries = 2;
        for (let attempt = 0; attempt <= retries; attempt += 1) {
            try {
                return await ai.models.generateContent({
                    model,
                    contents,
                });
            }
            catch (error) {
                lastError = error;
                const retryable = isRetryableError(error);
                const hasMoreAttempts = attempt < retries;
                if (!retryable) {
                    throw error;
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
        try {
            return await generateContentWithOpenRouter(contents);
        }
        catch (fallbackError) {
            if (fallbackError instanceof Error) {
                throw fallbackError;
            }
            throw new Error(getRetryableErrorMessage(lastRetryableError));
        }
    }
    throw lastError instanceof Error ? lastError : new Error("Unable to generate content.");
};

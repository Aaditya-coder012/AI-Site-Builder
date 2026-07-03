import OpenAI from "openai";
const openRouterApiKey = process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_KEY || "";
export const hasOpenRouterKey = Boolean(openRouterApiKey);
export const createOpenRouterClient = () => {
    if (!openRouterApiKey) {
        throw new Error("OPENROUTER_API_KEY is not configured on the server.");
    }
    return new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: openRouterApiKey,
    });
};

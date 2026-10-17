import { createAuthClient } from "better-auth/react";

const getAuthBaseUrl = () => {
  const envUrl = import.meta.env.VITE_AUTH_BASEURL;
  if (envUrl && (envUrl.startsWith("http://") || envUrl.startsWith("https://"))) {
    return envUrl.replace(/\/$/, "");
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "http://localhost:3000";
};

export const authClient = createAuthClient({
  baseURL: getAuthBaseUrl(),
  fetchOptions: { credentials: "include" },
});

export const { signIn, signUp, useSession } = authClient;

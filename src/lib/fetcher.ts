"use server";

import { cache as reactCache } from "react";

// Default configuration
const DEFAULT_CONFIG = {
  timeout: 30000,
  retries: 2,
  retryDelay: 500, // ms
};

/**
 * Translates raw error or status into user-friendly messages.
 */
function getFriendlyMessage(status, errorMessage) {
  if (errorMessage?.includes("timeout") || errorMessage?.includes("AbortError")) {
    return "The request took too long. Please try again.";
  }

  switch (status) {
    case 400:
      return "Invalid request. Please check your input and try again.";
    case 401:
      return "You are not authorized. Please log in again.";
    case 403:
      return "Access denied. You don’t have permission for this action.";
    case 404:
      return "The requested resource could not be found.";
    case 408:
      return "Request timed out. Please try again.";
    case 429:
      return "Too many requests. Please wait and try again later.";
    case 500:
      return "Server error. Please try again later.";
    case 502:
    case 503:
    case 504:
      return "The server is currently unavailable. Please try again later.";
    default:
      return "Something went wrong. Please try again later.";
  }
}

/**
 * Universal API fetcher with retries, timeout, and friendly error handling.
 */
export const fetcher = reactCache(async (endpoint, options = {}) => {
  const {
    method = "GET",
    data = null,
    retries = DEFAULT_CONFIG.retries,
    timeout = DEFAULT_CONFIG.timeout,
    retryDelay = DEFAULT_CONFIG.retryDelay,
    headers = {},
  } = options;

  const fullUrl = `${process.env.API_URL}${endpoint}`;
  const requestHeaders = new Headers({
    "Content-Type": "application/json",
    ...headers,
  });

  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      console.log(
        `🌐 Attempt ${attempt + 1}/${retries + 1} → ${method} ${fullUrl}`
      );

      const response = await fetch(fullUrl, {
        method,
        headers: requestHeaders,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
        credentials: "include", // ✅ Correct setting
        ...options,
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get("content-type") || "";

      // Handle different content types safely
      let parsedData = null;
      try {
        if (contentType.includes("application/json")) {
          parsedData = await response.json();
        } else if (contentType.includes("text/")) {
          parsedData = await response.text();
        } else if (contentType.includes("image/") || contentType.includes("octet-stream")) {
          parsedData = await response.blob();
        } else {
          parsedData = await response.text();
        }
      } catch {
        parsedData = null;
      }

      if (!response.ok) {
        const message =
          parsedData?.message ||
          getFriendlyMessage(response.status, response.statusText);
        return { success: false, message, data: null };
      }

      // ✅ Return consistent success structure
      return {
        success: true,
        message:
          parsedData?.message || "Request completed successfully.",
        data: parsedData?.data ?? parsedData,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;

      console.error(
        `❌ Request failed (${method} ${endpoint}):`,
        error?.message || error
      );

      const isNetworkError =
        error.name === "FetchError" ||
        error.message?.includes("Check your network") ||
        error.message?.includes("Failed to fetch");

      const friendlyMessage = isNetworkError
        ? "Network error. Please check your connection."
        : getFriendlyMessage(null, error.message);

      // Don’t retry on user or network errors
      if (
        isNetworkError ||
        error.name === "AbortError" ||
        error.message?.includes("HTTP 4")
      ) {
        return { success: false, message: friendlyMessage, data: null };
      }

      // Retry logic with exponential backoff
      if (attempt < retries) {
        const delay = retryDelay * Math.pow(2, attempt);
        console.warn(`⏳ Retrying in ${delay}ms...`);
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }

  return {
    success: false,
    message:
      lastError?.message ||
      "Something went wrong. Please try again later.",
    data: null,
  };
});

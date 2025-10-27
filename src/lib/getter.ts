"use server";

import { fetcher } from "./fetcher";

/**
 * Reusable GET request method.
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Optional fetcher configurations
 * @returns {Promise<Object>} Response data
 */
export const getter = async (endpoint, options = {}) => {
  const res = await fetcher(endpoint, {
    method: "GET",
    credentials: "include",
    ...options,
  });

  return {
    success: !!res?.success,
    message:
      res?.message ??
      (res?.success ? "Success" : "Something went wrong, try again later"),
    data: res?.data ?? null,
  };
};

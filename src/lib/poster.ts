"use server";

import { fetcher } from "./fetcher";

/**
 * Reusable POST request method.
 * @param {string} endpoint - API endpoint
 * @param {Object} data - The data to be sent in the request body
 * @param {Object} options - Optional fetcher configurations
 * @returns {Promise<Object>} Response data
 */

export const poster = async (endpoint, data, options = {}) => {
  const res = await fetcher(endpoint, {
    method: "POST",
    data,
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

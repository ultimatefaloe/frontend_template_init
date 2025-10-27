"use server";

import { fetcher } from "./fetcher";

/**
 * Reusable POST request method.
 * @param {string} endpoint - API endpoint
 * @param {Object} data - The data to be sent in the request body
 * @param {Object} options - Optional fetcher configurations
 * @returns {Promise<Object>} Response data
 */

export const pacther = async (endpoint, data, options = {}) => {
  const res = await fetcher(endpoint, {
    ...options,
    method: "PATCH",
    credentials: "include",
    data: data,
  });

  return {
    success: !!res?.success,
    message:
      res?.message ??
      (res?.success ? "Success" : "Something went wrong, try again later"),
    data: res?.data ?? null,
  };
};

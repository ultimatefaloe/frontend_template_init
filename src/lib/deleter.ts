"use server";

const { fetcher } = require("./fetcher");

/**
 * Reusable DELETE request method.
 * @param {string} endpoint - API endpoint
 * @param {Object} data - The data to be sent in the request body
 * @param {Object} options - Optional fetcher configurations
 * @returns {Promise<Object>} Response data
 */

export const deleter = async (endpoint, data, options = {}) => {
  const response = await fetcher(endpoint, {
    ...options,
    method: "DELETE",
    credential: "inlcude",
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

'use server';
import 'server-only';
import { cookies } from 'next/headers';

export interface ApiOptions extends Omit<RequestInit, 'body'> {
  body?: Record<string, any> | FormData | string | null;
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  forwardCookies?: boolean;
}

export interface ApiResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

class ApiError extends Error {
  constructor(
    public status: number,
    public body: any | null,
    public url: string
  ) {
    const message =
      (body && (body.message || body.detail || body.error)) ??
      (typeof body === 'string' ? body : null) ??
      `Request failed with status ${status}`;
    super(message);
    this.name = 'ApiError';
  }
}

// Utility helpers
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getBackoffDelay(base: number, attempt: number, cap = 30_000) {
  const max = Math.min(cap, base * 2 ** attempt);
  return Math.random() * max;
}

async function parseBody(res: Response) {
  if ([204, 205, 304].includes(res.status)) return null;
  const ct = res.headers.get('content-type') ?? '';
  try {
    if (ct.includes('application/json')) return await res.json();
    const text = await res.text();
    return text || null;
  } catch {
    return null;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  opts: ApiOptions = {}
): Promise<ApiResult<T>> {
  if (typeof window !== 'undefined') {
    throw new Error('❌ apiFetch can only be called on the server.');
  }

  let data: T | null = null;
  let error: Error | null = null;
  let loading = true;

  try {
    data = await performRequest<T>(path, opts);
  } catch (err: any) {
    if (err instanceof ApiError) {
      error = new Error(err.message);
    } else if (err.name === 'AbortError') {
      error = new Error('Request timed out. Please try again.');
    } else if (err.message?.includes('fetch failed')) {
      error = new Error(
        'Unable to reach the server. Please check your network connection or API_URL configuration.'
      );
    } else {
      error = new Error(err.message || 'Unexpected error occurred.');
    }
  } finally {
    loading = false;
  }

  return { data, loading, error };
}

async function performRequest<T>(path: string, opts: ApiOptions): Promise<T> {
  const baseUrl = process.env.API_URL;
  if (!baseUrl) throw new Error('❌ Missing API_URL in .env.local');

  const {
    retries = 0,
    retryDelay = 500,
    timeout = 0,
    forwardCookies = false,
    ...init
  } = opts;

  const url = path.startsWith('http')
    ? path
    : new URL(path, baseUrl).toString();

  const headers = new Headers(init.headers);
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');

  let body = init.body;

  if (body && !(body instanceof FormData) && typeof body === 'object') {
    body = JSON.stringify(body);
    if (!headers.has('Content-Type'))
      headers.set('Content-Type', 'application/json');
  }

  // ✅ Forward cookies on the server
  if (forwardCookies) {
    const cookieStr = cookies().toString();
    if (cookieStr) headers.set('cookie', cookieStr);
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const signal = controller.signal;
    let timeoutId: NodeJS.Timeout | undefined;

    if (timeout > 0) timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(url, {
        ...init,
        body: body as BodyInit | undefined,
        headers,
        signal,
        credentials: 'include',
        cache: 'no-store',
      });

      if (timeoutId) clearTimeout(timeoutId);

      const parsed = await parseBody(res);
      if (!res.ok) throw new ApiError(res.status, parsed, url);

      return parsed as T;
    } catch (err: any) {
      if (timeoutId) clearTimeout(timeoutId);
      lastError = err instanceof Error ? err : new Error(String(err));

      const retriable =
        (err.name === 'AbortError' || err instanceof TypeError) &&
        attempt < retries;

      if (retriable) {
        await sleep(getBackoffDelay(retryDelay, attempt));
        continue;
      }

      throw lastError;
    }
  }

  throw lastError ?? new Error('Unknown apiFetch failure');
}

// SWR Fetcher - Centralized fetch helper for all API calls
export const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
  }

  return res.json();
};

// Extended fetcher with error details
export const fetcherWithErrorDetails = async (url: string) => {
  try {
    const res = await fetch(url);

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || `HTTP ${res.status}`);
    }

    return res.json();
  } catch (error) {
    console.error(`Fetcher error for ${url}:`, error);
    throw error;
  }
};

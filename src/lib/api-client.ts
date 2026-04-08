import { toast } from 'sonner';

export class APIError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

interface FetchOptions extends RequestInit {
  showErrorToast?: boolean;
}

/**
 * A wrapper around fetch that gracefully handles HTTP and network errors.
 * Useful for client-side API calls. For server-side, it suppresses toast.
 */
export async function fetchClient<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { showErrorToast = true, ...fetchOptions } = options;
  const isClient = typeof window !== 'undefined';

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      let errorMsg = 'An unexpected error occurred';
      let errorData;

      try {
        errorData = await response.json();
        errorMsg = errorData?.error || errorData?.message || errorMsg;
      } catch {
        const text = await response.text();
        if (text) errorMsg = text;
      }

      throw new APIError(errorMsg, response.status, errorData);
    }

    // Attempt to parse JSON response
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json() as T;
    }

    return await response.text() as unknown as T;
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      if (isClient && showErrorToast) {
        toast.error('Network Error: Please check your internet connection.');
      }
      throw new APIError('Network error', 0);
    }

    if (error instanceof APIError) {
      if (isClient && showErrorToast) {
        if (error.status >= 500) {
          toast.error(`Server Error (${error.status}): Our team has been notified.`);
        } else if (error.status === 401) {
          toast.error('Unauthorized. Please log in again.');
        } else if (error.status === 403) {
          toast.error('You do not have permission to perform this action.');
        } else if (error.status === 404) {
          toast.error('The requested resource was not found.');
        } else if (error.status === 429) {
          toast.error('Too many requests. Please slow down.');
        } else {
          toast.error(error.message);
        }
      }
      throw error;
    }

    if (isClient && showErrorToast) {
      toast.error(error instanceof Error ? error.message : 'An unknown error occurred');
    }
    throw error;
  }
}

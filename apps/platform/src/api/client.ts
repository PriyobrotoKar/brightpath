import { cookies } from 'next/headers';
import { getSession } from '@/lib/session';

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(url: string, options?: RequestInit): Promise<T> {
    const session = await getSession();
    const headers = {
      ...(session && { Authorization: `Bearer ${session.accessToken}` }),
      ...options?.headers,
    };

    const response = await fetch(this.baseUrl + url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const message = ((await response.json()) as { message: string }).message;
      throw new ApiError(message, response.status);
    }

    const contentType = response.headers.get('Content-Type');

    if (contentType && contentType.includes('text/html')) {
      return (await response.text()) as unknown as T;
    }

    return (await response.json()) as Promise<T>;
  }

  get<T>(url: string): Promise<T> {
    return this.request<T>(url, {
      method: 'GET',
      headers: {
        Cookie: cookies().toString(),
      },
    });
  }

  post<T>(
    url: string,
    data: Record<string, unknown>,
    headers?: Record<string, string>,
  ): Promise<T> {
    return this.request<T>(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        Cookie: cookies().toString(),
        ...headers,
      },
      body: JSON.stringify(data),
    });
  }

  patch<T>(url: string, data: Record<string, unknown>): Promise<T> {
    return this.request<T>(url, {
      method: 'PATCH',
      headers: {
        'Content-type': 'application/json',
        Cookie: cookies().toString(),
      },
      body: JSON.stringify(data),
    });
  }
}

const apiClient = new ApiClient('http://localhost:8000/api');

export default apiClient;

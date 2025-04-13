import { cookies } from 'next/headers';
import { getSession } from '@/lib/session';

export class ApiError extends Error {
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

    if (contentType && contentType.includes('application/json')) {
      return (await response.json()) as Promise<T>;
    }

    return (await response.text()) as unknown as T;
  }

  get<T>(url: string, queryParams?: Record<string, string>): Promise<T> {
    return this.request<T>(
      `${url}?${new URLSearchParams(queryParams).toString()}`,
      {
        method: 'GET',
        headers: {
          Cookie: cookies().toString(),
        },
      },
    );
  }

  post<T>(
    url: string,
    data?: Record<string, unknown>,
    headers?: Record<string, string>,
  ): Promise<T> {
    return this.request<T>(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        Cookie: cookies().toString(),
        ...headers,
      },
      ...(data && { body: JSON.stringify(data) }),
    });
  }

  patch<T>(url: string, data?: Record<string, unknown>): Promise<T> {
    return this.request<T>(url, {
      method: 'PATCH',
      headers: {
        'Content-type': 'application/json',
        Cookie: cookies().toString(),
      },
      body: JSON.stringify(data),
    });
  }

  delete<T>(url: string, data?: Record<string, unknown>): Promise<T> {
    return this.request<T>(url, {
      method: 'DELETE',
      headers: {
        'Content-type': 'application/json',
        Cookie: cookies().toString(),
      },
      body: JSON.stringify(data),
    });
  }
}

const apiClient = new ApiClient(`${process.env.NEXT_PUBLIC_API_URL}/api`);

export default apiClient;

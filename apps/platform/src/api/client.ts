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
    const response = await fetch(this.baseUrl + url, options);
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
    return this.request<T>(url);
  }

  post<T>(url: string, data: Record<string, unknown>): Promise<T> {
    return this.request<T>(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  patch<T>(url: string, data: Record<string, unknown>): Promise<T> {
    return this.request<T>(url, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }
}

const apiClient = new ApiClient('http://localhost:8000/api');

export default apiClient;

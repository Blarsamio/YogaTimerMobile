import { Session, Timer, Asana, ApiResponse } from '../types';
import Constants from 'expo-constants';

// Configuration for API endpoints
// Development: Dynamically get IP from Expo config
const getLocalIp = () => {
  const debuggerHost = Constants.expoConfig?.hostUri;
  const localhost = '192.168.100.77'; // Fallback to last known good IP

  if (debuggerHost) {
    return debuggerHost.split(':')[0];
  }

  return localhost;
};

const LOCAL_IP = getLocalIp();

const ENV = {
  dev: `http://${LOCAL_IP}:3000`,
  prod: 'https://your-production-api.com', // TODO: Replace with your actual production API URL before deployment
};

export const API_URL = __DEV__ ? ENV.dev : ENV.prod;

export const endpoints = {
  sessions: `${API_URL}/sessions`,
  asanas: `${API_URL}/asanas`,
  timer: (sessionId: number | string) => `${API_URL}/sessions/${sessionId}/timers`,
  deleteTimer: (timerId: number | string) => `${API_URL}/timers/${timerId}`,
};

// API Service Class
export class ApiService {
  private static readonly TIMEOUT_MS = 30000;

  private static async fetchWithTimeout(url: string, options?: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  private static async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const jsonResponse = await response.json();

      if (!response.ok) {
        return {
          data: null,
          error: jsonResponse.error || `HTTP Error: ${response.status}`,
        };
      }

      const data = jsonResponse.data !== undefined ? jsonResponse.data : jsonResponse;

      return { data };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  static async getSessions(): Promise<ApiResponse<Session[]>> {
    try {
      const response = await this.fetchWithTimeout(endpoints.sessions);
      return this.handleResponse<Session[]>(response);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  static async getSession(id: number | string): Promise<ApiResponse<Session>> {
    try {
      const response = await this.fetchWithTimeout(`${endpoints.sessions}/${id}`);
      return this.handleResponse<Session>(response);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  static async createSession(sessionData: { name: string; description?: string, timers?: any[] }): Promise<ApiResponse<Session>> {
    try {
      const payload = {
        ...sessionData,
        timers_attributes: sessionData.timers,
      };
      delete payload.timers;

      const response = await this.fetchWithTimeout(endpoints.sessions, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session: payload }),
      });
      return this.handleResponse<Session>(response);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  static async updateSession(id: number | string, sessionData: { name?: string; description?: string }): Promise<ApiResponse<Session>> {
    try {
      const response = await this.fetchWithTimeout(`${endpoints.sessions}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });
      return this.handleResponse<Session>(response);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  static async deleteSession(id: number | string): Promise<ApiResponse<null>> {
    try {
      const response = await this.fetchWithTimeout(`${endpoints.sessions}/${id}`, {
        method: 'DELETE',
      });

      if (response.status === 204) {
        return { data: null };
      }

      return this.handleResponse<null>(response);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  static async createTimer(sessionId: number | string, timerData: { duration: number; title?: string }): Promise<ApiResponse<Timer>> {
    try {
      const response = await this.fetchWithTimeout(endpoints.timer(sessionId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(timerData),
      });
      return this.handleResponse<Timer>(response);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  static async deleteTimer(timerId: number | string): Promise<ApiResponse<null>> {
    try {
      const response = await this.fetchWithTimeout(endpoints.deleteTimer(timerId), {
        method: 'DELETE',
      });

      if (response.status === 204) {
        return { data: null };
      }

      return this.handleResponse<null>(response);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  static async getAsanas(): Promise<ApiResponse<Asana[]>> {
    try {
      const response = await this.fetchWithTimeout(endpoints.asanas);
      return this.handleResponse<Asana[]>(response);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  static async getAsana(id: number): Promise<ApiResponse<Asana>> {
    try {
      const response = await this.fetchWithTimeout(`${endpoints.asanas}/${id}`);
      return this.handleResponse<Asana>(response);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  static formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }

  static convertMinutesToSeconds(minutes: number): number {
    return minutes * 60;
  }

  static convertSecondsToMinutes(seconds: number): number {
    return Math.round(seconds / 60);
  }
}

export default ApiService;

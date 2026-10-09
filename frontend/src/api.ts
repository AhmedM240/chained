import { getSessionId } from "./session";
import type { GameState, GuessResponse, StatsResponse, User } from "./types";

const API_BASE = "";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function errorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail) && body.detail[0]?.msg) return body.detail[0].msg;
  } catch {
    // the error response wasn't JSON
  }
  return `Request failed (${res.status})`;
}

function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("X-Session-Id", getSessionId());
  return fetch(`${API_BASE}${path}`, { ...init, headers });
}

async function getJson<T>(path: string): Promise<T> {
  const res = await apiFetch(path);
  if (!res.ok) throw new ApiError(res.status, await errorMessage(res));
  return res.json();
}

async function postJson<T>(path: string, data?: unknown): Promise<T> {
  const res = await apiFetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: data === undefined ? undefined : JSON.stringify(data),
  });
  if (!res.ok) throw new ApiError(res.status, await errorMessage(res));
  return res.json();
}

// ---------- game ----------

export function createGame(): Promise<GameState> {
  return postJson<GameState>("/api/games");
}

export function submitGuess(gameId: number, guess: string): Promise<GuessResponse> {
  return postJson<GuessResponse>(`/api/games/${gameId}/guess`, { guess });
}

export function getStats(): Promise<StatsResponse> {
  return getJson<StatsResponse>("/api/stats");
}

// ---------- auth ----------

export function register(email: string, password: string): Promise<User> {
  return postJson<User>("/api/auth/register", { email, password });
}

export function login(email: string, password: string): Promise<User> {
  return postJson<User>("/api/auth/login", { email, password });
}

export async function logout(): Promise<void> {
  await apiFetch("/api/auth/logout", { method: "POST" });
}

export async function getMe(): Promise<User | null> {
  const res = await apiFetch("/api/auth/me");
  if (res.status === 401) return null;
  if (!res.ok) throw new ApiError(res.status, await errorMessage(res));
  return res.json();
}
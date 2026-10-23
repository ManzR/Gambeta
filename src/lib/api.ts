import "server-only";
import { REFRESH_LIVE_MATCH_SECONDS, REFRESH_TODAY_SECONDS, TIMEZONE } from "./config";
import { todayYmd } from "./format";
import { mockFixtureDetail, mockFixturesByDate, mockStandings } from "./mock";
import type { DataResult, Fixture, StandingsResponse } from "./types";

const BASE = "https://v3.football.api-sports.io";

export function hasKey() {
  return !!process.env.API_FOOTBALL_KEY;
}

interface ApiEnvelope<T> {
  errors: unknown;
  results: number;
  response: T;
}

function hasErrors(errors: unknown) {
  if (!errors) return false;
  if (Array.isArray(errors)) return errors.length > 0;
  if (typeof errors === "object") return Object.keys(errors as object).length > 0;
  return false;
}

// Pedido a API-Football con caché del servidor (Next.js data cache).
// La clave nunca llega al navegador: solo se usa acá, en el servidor.
async function call<T>(path: string, params: Record<string, string | number>, revalidate: number): Promise<T> {
  const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]));
  const res = await fetch(`${BASE}${path}?${qs}`, {
    headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY as string },
    next: { revalidate, tags: ["api-football"] },
  });
  if (!res.ok) throw new Error(`API-Football respondió ${res.status}`);
  const json = (await res.json()) as ApiEnvelope<T>;
  if (hasErrors(json.errors)) {
    throw new Error(`API-Football: ${JSON.stringify(json.errors)}`);
  }
  return json.response;
}

function fail<T>(data: T, e: unknown): DataResult<T> {
  const msg = e instanceof Error ? e.message : String(e);
  console.error("[api-football]", msg);
  return { data, demo: false, error: msg };
}

export async function getFixturesByDate(date: string): Promise<DataResult<Fixture[]>> {
  if (!hasKey()) return { data: mockFixturesByDate(date), demo: true };
  const today = todayYmd();
  const revalidate = date === today ? REFRESH_TODAY_SECONDS : date < today ? 6 * 3600 : 3 * 3600;
  try {
    const data = await call<Fixture[]>("/fixtures", { date, timezone: TIMEZONE }, revalidate);
    return { data, demo: false };
  } catch (e) {
    return fail([], e);
  }
}

// Un solo pedido trae el partido con eventos, alineaciones y estadísticas.
export async function getFixture(id: number): Promise<DataResult<Fixture | null>> {
  if (!hasKey()) return { data: mockFixtureDetail(id), demo: true };
  try {
    const data = await call<Fixture[]>("/fixtures", { id, timezone: TIMEZONE }, REFRESH_LIVE_MATCH_SECONDS);
    return { data: data[0] ?? null, demo: false };
  } catch (e) {
    return fail(null, e);
  }
}

export async function getStandings(league: number, season: number): Promise<DataResult<StandingsResponse | null>> {
  if (!hasKey()) return { data: mockStandings(league), demo: true };
  try {
    const data = await call<StandingsResponse[]>("/standings", { league, season }, 6 * 3600);
    return { data: data[0] ?? null, demo: false };
  } catch (e) {
    return fail(null, e);
  }
}

export async function getCurrentSeason(league: number): Promise<number> {
  if (!hasKey()) return 2026;
  try {
    const data = await call<{ seasons: { year: number; current: boolean }[] }[]>(
      "/leagues",
      { id: league, current: "true" },
      24 * 3600,
    );
    const s = data[0]?.seasons?.find((x) => x.current) ?? data[0]?.seasons?.[0];
    return s?.year ?? new Date().getFullYear();
  } catch {
    return new Date().getFullYear();
  }
}

export async function getHeadToHead(home: number, away: number): Promise<DataResult<Fixture[]>> {
  if (!hasKey()) return { data: [], demo: true };
  try {
    const data = await call<Fixture[]>(
      "/fixtures/headtohead",
      { h2h: `${home}-${away}`, last: 5, timezone: TIMEZONE },
      24 * 3600,
    );
    return { data, demo: false };
  } catch (e) {
    return fail([], e);
  }
}

import { TIMEZONE } from "./config";
import type { Fixture } from "./types";

const LIVE = new Set(["1H", "HT", "2H", "ET", "BT", "P", "LIVE", "INT", "SUSP"]);
const FINISHED = new Set(["FT", "AET", "PEN", "AWD", "WO"]);
const OFF = new Set(["PST", "CANC", "ABD"]);

export type MatchState = "live" | "pre" | "finished" | "off";

export function matchState(f: Fixture): MatchState {
  const s = f.fixture.status.short;
  if (LIVE.has(s)) return "live";
  if (FINISHED.has(s)) return "finished";
  if (OFF.has(s)) return "off";
  return "pre";
}

export function statusLabel(f: Fixture): string {
  const s = f.fixture.status;
  switch (s.short) {
    case "HT":
      return "Entretiempo";
    case "BT":
      return "Descanso";
    case "P":
      return "Penales";
    case "FT":
      return "Final";
    case "AET":
      return "Final (alargue)";
    case "PEN":
      return "Final (penales)";
    case "PST":
      return "Postergado";
    case "CANC":
      return "Cancelado";
    case "ABD":
      return "Suspendido";
    case "SUSP":
      return "Interrumpido";
    case "INT":
      return "Interrumpido";
    case "TBD":
      return "A confirmar";
  }
  if (s.elapsed != null && LIVE.has(s.short)) {
    return s.extra ? `${s.elapsed}+${s.extra}'` : `${s.elapsed}'`;
  }
  return kickoff(f.fixture.date);
}

export function kickoff(iso: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TIMEZONE,
  }).format(new Date(iso));
}

export function longDate(iso: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: TIMEZONE,
  }).format(new Date(iso));
}

// Fecha YYYY-MM-DD en hora argentina.
export function ymd(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: TIMEZONE,
  }).format(d);
  return parts; // en-CA ya devuelve YYYY-MM-DD
}

export function todayYmd(): string {
  return ymd(new Date());
}

export function addDays(dateYmd: string, n: number): string {
  const [y, m, d] = dateYmd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n, 12));
  return dt.toISOString().slice(0, 10);
}

export function isValidYmd(s: string | undefined): s is string {
  return !!s && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
}

export function dayChip(dateYmd: string, today: string): { dow: string; n: string } {
  if (dateYmd === today) return { dow: "Hoy", n: dateYmd.slice(8) };
  const [y, m, d] = dateYmd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  const dow = new Intl.DateTimeFormat("es-AR", { weekday: "short", timeZone: "UTC" })
    .format(dt)
    .replace(".", "");
  return { dow: dow.charAt(0).toUpperCase() + dow.slice(1), n: String(d).padStart(2, "0") };
}

const STAT_LABELS: Record<string, string> = {
  "Ball Possession": "Posesión",
  expected_goals: "Goles esperados (xG)",
  "Total Shots": "Tiros",
  "Shots on Goal": "Tiros al arco",
  "Shots off Goal": "Tiros afuera",
  "Blocked Shots": "Tiros bloqueados",
  "Corner Kicks": "Córners",
  Offsides: "Offsides",
  Fouls: "Faltas",
  "Yellow Cards": "Amarillas",
  "Red Cards": "Rojas",
  "Goalkeeper Saves": "Atajadas",
  "Total passes": "Pases",
  "Passes %": "Precisión de pases",
};

export const STAT_ORDER = [
  "Ball Possession",
  "expected_goals",
  "Total Shots",
  "Shots on Goal",
  "Corner Kicks",
  "Fouls",
  "Yellow Cards",
  "Red Cards",
  "Offsides",
  "Goalkeeper Saves",
  "Total passes",
  "Passes %",
];

export function statLabel(type: string) {
  return STAT_LABELS[type] ?? type;
}

export function statNumber(v: number | string | null): number {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  const n = parseFloat(v.replace("%", ""));
  return Number.isNaN(n) ? 0 : n;
}

export function slug(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

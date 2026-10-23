// Datos de ejemplo con la misma forma que API-Football.
// Se usan cuando no hay API_FOOTBALL_KEY configurada. Marcadores, minutos y jugadores son ficticios.

import { TIMEZONE } from "./config";
import { addDays, todayYmd } from "./format";
import type { Fixture, League, MatchEvent, StandingRow, StandingsResponse, Team } from "./types";

let teamSeq = 1000;
const teams: Record<string, Team> = {};
function T(name: string): Team {
  if (!teams[name]) teams[name] = { id: ++teamSeq, name, logo: "" };
  return teams[name];
}

const L = (id: number, name: string, country: string, round: string): League => ({
  id,
  name,
  country,
  logo: "",
  flag: null,
  season: 2026,
  round,
});

const LPF = L(128, "Liga Profesional Argentina", "Argentina", "Clausura - 14");
const PN = L(129, "Primera Nacional", "Argentina", "Reducido - Cuartos");
const BMET = L(131, "Primera B Metropolitana", "Argentina", "Clausura - 12");
const FEDA = L(134, "Torneo Federal A", "Argentina", "Fase final - 3");
const PL = L(39, "Premier League", "England", "Regular Season - 9");
const BL = L(78, "Bundesliga", "Germany", "Regular Season - 8");
const LL = L(140, "La Liga", "Spain", "Regular Season - 10");
const SPL = L(307, "Pro League", "Saudi-Arabia", "Regular Season - 7");
const URU = L(268, "Primera División - Clausura", "Uruguay", "Clausura - 11");

// Hora local argentina → ISO.
function at(dateYmd: string, hhmm: string) {
  return new Date(`${dateYmd}T${hhmm}:00-03:00`).toISOString();
}

let fxSeq = 9000;
function fx(
  league: League,
  date: string,
  hhmm: string,
  home: string,
  away: string,
  state: { short: string; elapsed?: number | null; gh?: number | null; ga?: number | null } = { short: "NS" },
  venue = "Estadio",
): Fixture {
  return {
    fixture: {
      id: ++fxSeq,
      referee: "Árbitro de ejemplo",
      timezone: TIMEZONE,
      date: at(date, hhmm),
      timestamp: Math.floor(Date.parse(at(date, hhmm)) / 1000),
      venue: { id: null, name: venue, city: null },
      status: { long: state.short, short: state.short, elapsed: state.elapsed ?? null },
    },
    league,
    teams: { home: T(home), away: T(away) },
    goals: { home: state.gh ?? null, away: state.ga ?? null },
  };
}

let cache: { day: string; list: Fixture[] } | null = null;

function build(): Fixture[] {
  const t = todayYmd();
  const y = addDays(t, -1);
  const m = addDays(t, 1);
  fxSeq = 9000;
  return [
    // Ayer
    fx(LPF, y, "19:00", "River Plate", "Estudiantes L.P.", { short: "FT", gh: 2, ga: 1 }, "Estadio Monumental"),
    fx(LPF, y, "21:30", "Boca Juniors", "Independiente", { short: "FT", gh: 0, ga: 0 }, "La Bombonera"),
    fx(PN, y, "17:00", "San Martín Tucumán", "Atlanta", { short: "FT", gh: 1, ga: 1 }),
    fx(PL, y, "16:00", "Arsenal", "Chelsea", { short: "FT", gh: 3, ga: 1 }),
    // Hoy
    fx(LPF, t, "18:00", "Gimnasia L.P.", "Sarmiento Junin", { short: "2H", elapsed: 63, gh: 1, ga: 1 }, "Estadio Juan Carmelo Zerillo"),
    fx(LPF, t, "18:30", "Gimnasia M.", "Platense", { short: "NS" }, "Estadio Víctor Legrotaglie"),
    fx(LPF, t, "21:15", "Tigre", "Atletico Tucuman", { short: "NS" }, "Estadio José Dellagiovanna"),
    fx(PN, t, "15:30", "San Martín San Juan", "Chacarita Juniors", { short: "1H", elapsed: 34, gh: 1, ga: 0 }),
    fx(PN, t, "17:00", "Quilmes", "All Boys", { short: "NS" }, "Estadio Centenario"),
    fx(BMET, t, "15:30", "Deportivo Armenio", "Comunicaciones", { short: "HT", elapsed: 45, gh: 0, ga: 0 }),
    fx(BMET, t, "16:00", "Acassuso", "Excursionistas", { short: "NS" }),
    fx(FEDA, t, "20:00", "Sansinena", "Olimpo", { short: "NS" }),
    fx(PL, t, "16:00", "Ipswich", "Nottingham Forest", { short: "2H", elapsed: 67, gh: 1, ga: 0 }, "Portman Road"),
    fx(BL, t, "15:30", "VfB Stuttgart", "Borussia Mönchengladbach", { short: "2H", elapsed: 78, gh: 2, ga: 2 }),
    fx(LL, t, "16:00", "Alaves", "Malaga", { short: "NS" }),
    fx(SPL, t, "10:30", "Al-Faisaly", "Al-Nassr", { short: "FT", gh: 0, ga: 2 }),
    fx(SPL, t, "12:30", "Al-Ittihad", "Al Diraiyah", { short: "FT", gh: 3, ga: 1 }),
    fx(URU, t, "20:00", "Juventud", "Peñarol", { short: "NS" }),
    // Mañana
    fx(LPF, m, "17:00", "Racing Club", "Lanus", { short: "NS" }, "Cilindro de Avellaneda"),
    fx(LPF, m, "19:15", "San Lorenzo", "Huracan", { short: "NS" }, "Nuevo Gasómetro"),
    fx(PN, m, "15:00", "Colón", "Ferro Carril Oeste", { short: "NS" }),
    fx(PL, m, "11:00", "Liverpool", "Manchester City", { short: "NS" }),
  ];
}

export function mockAll(): Fixture[] {
  const t = todayYmd();
  if (!cache || cache.day !== t) cache = { day: t, list: build() };
  return cache.list;
}

export function mockFixturesByDate(date: string): Fixture[] {
  return mockAll().filter((f) => f.fixture.date && toLocalYmd(f.fixture.date) === date);
}

function toLocalYmd(iso: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(new Date(iso));
}

export function mockFixtureDetail(id: number): Fixture | null {
  const base = mockAll().find((f) => f.fixture.id === id);
  if (!base) return null;
  const f: Fixture = JSON.parse(JSON.stringify(base));
  const st = f.fixture.status.short;
  if (st === "NS") return f;
  const h = f.teams.home;
  const a = f.teams.away;
  const ev = (min: number, team: Team, type: string, detail: string, player: string, assist: string | null = null): MatchEvent => ({
    time: { elapsed: min, extra: null },
    team: { id: team.id, name: team.name, logo: team.logo },
    player: { id: null, name: player },
    assist: { id: null, name: assist },
    type,
    detail,
    comments: null,
  });
  const events: MatchEvent[] = [];
  const gh = f.goals.home ?? 0;
  const ga = f.goals.away ?? 0;
  const maxMin = f.fixture.status.elapsed ?? 90;
  for (let i = 0; i < gh; i++) events.push(ev(Math.min(12 + i * 23, maxMin), h, "Goal", "Normal Goal", `Jugador ${9 + i}`, "Jugador 10"));
  for (let i = 0; i < ga; i++) events.push(ev(Math.min(31 + i * 20, maxMin), a, "Goal", "Normal Goal", `Jugador ${11 - i}`));
  if (maxMin > 30) events.push(ev(28, a, "Card", "Yellow Card", "Jugador 5"));
  if (maxMin > 55) events.push(ev(56, h, "subst", "Substitution 1", "Jugador 20", "Jugador 7"));
  events.sort((x, y) => x.time.elapsed - y.time.elapsed);
  f.events = events;
  const s = (type: string, hv: number | string, av: number | string) => ({ type, hv, av });
  const rows = [
    s("Ball Possession", "54%", "46%"),
    s("expected_goals", "1.12", "0.84"),
    s("Total Shots", 9, 7),
    s("Shots on Goal", 4, 3),
    s("Corner Kicks", 5, 2),
    s("Fouls", 8, 11),
    s("Yellow Cards", 0, 1),
    s("Offsides", 1, 2),
  ];
  f.statistics = [
    { team: { id: h.id, name: h.name, logo: h.logo }, statistics: rows.map((r) => ({ type: r.type, value: r.hv })) },
    { team: { id: a.id, name: a.name, logo: a.logo }, statistics: rows.map((r) => ({ type: r.type, value: r.av })) },
  ];
  const xi = (prefix: string) =>
    Array.from({ length: 11 }, (_, i) => ({
      player: { id: i, name: `${prefix} ${i + 1}`, number: i + 1, pos: i === 0 ? "G" : i < 5 ? "D" : i < 9 ? "M" : "F" },
    }));
  f.lineups = [
    { team: { id: h.id, name: h.name, logo: h.logo }, formation: "4-4-2", coach: { id: null, name: "DT local" }, startXI: xi("Jugador"), substitutes: [] },
    { team: { id: a.id, name: a.name, logo: a.logo }, formation: "4-3-3", coach: { id: null, name: "DT visitante" }, startXI: xi("Jugador"), substitutes: [] },
  ];
  return f;
}

export function mockStandings(leagueId: number): StandingsResponse | null {
  const lg = [LPF, PN, BMET, FEDA, PL, BL, LL, SPL, URU].find((l) => l.id === leagueId);
  if (!lg) return null;
  const names = Array.from(new Set(mockAll().filter((f) => f.league.id === leagueId).flatMap((f) => [f.teams.home.name, f.teams.away.name])));
  while (names.length < 14) names.push(`Equipo ${names.length + 1}`);
  const rows: StandingRow[] = names.map((n, i) => {
    const played = 13;
    const win = Math.max(0, 8 - Math.floor(i / 2));
    const draw = (i % 4) + 1;
    const lose = Math.max(0, played - win - draw);
    const gf = 20 - i;
    const gc = 10 + Math.floor(i / 2);
    return {
      rank: i + 1,
      team: { id: T(n).id, name: n, logo: "" },
      points: win * 3 + draw,
      goalsDiff: gf - gc,
      group: lg.name,
      form: ["WDWLD", "DWWDL", "LDWWW", "DDLWD"][i % 4],
      description: i < 4 ? "Clasifica a playoffs" : null,
      all: { played, win, draw, lose, goals: { for: gf, against: gc } },
    };
  });
  rows.sort((a, b) => b.points - a.points || b.goalsDiff - a.goalsDiff);
  rows.forEach((r, i) => (r.rank = i + 1));
  return { league: { ...lg, standings: [rows] } };
}

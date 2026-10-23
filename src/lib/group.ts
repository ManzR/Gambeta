import { FEATURED_LEAGUES, ONLY_FEATURED, isArgentina, isAscenso } from "./config";
import { matchState, statusLabel, kickoff, type MatchState } from "./format";
import type { Fixture } from "./types";

// Versión liviana y serializable de un partido para mandar al navegador.
export interface MatchLite {
  id: number;
  state: MatchState;
  label: string;
  time: string;
  ts: number;
  home: { id: number; name: string; logo: string; goals: number | null };
  away: { id: number; name: string; logo: string; goals: number | null };
  leagueId: number;
}

export interface LeagueGroup {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string | null;
  round: string;
  season: number;
  ascenso: boolean;
  matches: MatchLite[];
}

export function toLite(f: Fixture): MatchLite {
  return {
    id: f.fixture.id,
    state: matchState(f),
    label: statusLabel(f),
    time: kickoff(f.fixture.date),
    ts: f.fixture.timestamp,
    home: { id: f.teams.home.id, name: f.teams.home.name, logo: f.teams.home.logo, goals: f.goals.home },
    away: { id: f.teams.away.id, name: f.teams.away.name, logo: f.teams.away.logo, goals: f.goals.away },
    leagueId: f.league.id,
  };
}

export function roundLabel(round: string | undefined) {
  if (!round) return "";
  return round
    .replace("Regular Season", "Fecha")
    .replace("Group Stage", "Fase de grupos")
    .replace("Round of 16", "Octavos")
    .replace("Quarter-finals", "Cuartos")
    .replace("Semi-finals", "Semifinal")
    .replace(" - ", " · ");
}

const COUNTRY_ES: Record<string, string> = {
  Argentina: "Argentina",
  England: "Inglaterra",
  Spain: "España",
  Italy: "Italia",
  Germany: "Alemania",
  France: "Francia",
  Brazil: "Brasil",
  Mexico: "México",
  Uruguay: "Uruguay",
  "Saudi-Arabia": "Arabia Saudita",
  Portugal: "Portugal",
  Netherlands: "Países Bajos",
  Chile: "Chile",
  Colombia: "Colombia",
  Paraguay: "Paraguay",
  Peru: "Perú",
  Ecuador: "Ecuador",
  World: "Internacional",
  USA: "Estados Unidos",
};

export function countryEs(c: string) {
  return COUNTRY_ES[c] ?? c;
}

export function groupByLeague(fixtures: Fixture[], opts: { onlyFeatured?: boolean } = {}): LeagueGroup[] {
  const onlyFeatured = opts.onlyFeatured ?? ONLY_FEATURED;
  const map = new Map<number, LeagueGroup>();
  for (const f of fixtures) {
    const lg = f.league;
    if (onlyFeatured && !FEATURED_LEAGUES.includes(lg.id) && !isArgentina(lg.country)) continue;
    let g = map.get(lg.id);
    if (!g) {
      g = {
        id: lg.id,
        name: lg.name,
        country: lg.country,
        logo: lg.logo,
        flag: lg.flag ?? null,
        round: roundLabel(lg.round),
        season: lg.season,
        ascenso: isAscenso(lg.id, lg.country),
        matches: [],
      };
      map.set(lg.id, g);
    }
    g.matches.push(toLite(f));
  }
  const rank = (g: LeagueGroup) => {
    const i = FEATURED_LEAGUES.indexOf(g.id);
    if (i >= 0) return i;
    if (isArgentina(g.country)) return 50;
    return 100;
  };
  const groups = Array.from(map.values());
  groups.forEach((g) => g.matches.sort((a, b) => a.ts - b.ts));
  groups.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
  return groups;
}

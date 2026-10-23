// Subconjunto de las respuestas de API-Football v3 que usa el sitio.

export interface Team {
  id: number;
  name: string;
  logo: string;
  winner?: boolean | null;
}

export interface League {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag?: string | null;
  season: number;
  round?: string;
}

export interface FixtureStatus {
  long: string;
  short: string;
  elapsed: number | null;
  extra?: number | null;
}

export interface MatchEvent {
  time: { elapsed: number; extra: number | null };
  team: { id: number; name: string; logo: string };
  player: { id: number | null; name: string | null };
  assist: { id: number | null; name: string | null };
  type: string; // Goal | Card | subst | Var
  detail: string;
  comments: string | null;
}

export interface TeamStatistics {
  team: { id: number; name: string; logo: string };
  statistics: { type: string; value: number | string | null }[];
}

export interface Lineup {
  team: { id: number; name: string; logo: string };
  formation: string | null;
  coach: { id: number | null; name: string | null };
  startXI: { player: { id: number; name: string; number: number | null; pos: string | null } }[];
  substitutes: { player: { id: number; name: string; number: number | null; pos: string | null } }[];
}

export interface Fixture {
  fixture: {
    id: number;
    referee: string | null;
    timezone: string;
    date: string;
    timestamp: number;
    venue: { id: number | null; name: string | null; city: string | null };
    status: FixtureStatus;
  };
  league: League;
  teams: { home: Team; away: Team };
  goals: { home: number | null; away: number | null };
  score?: {
    penalty?: { home: number | null; away: number | null };
  };
  events?: MatchEvent[];
  lineups?: Lineup[];
  statistics?: TeamStatistics[];
}

export interface StandingRow {
  rank: number;
  team: { id: number; name: string; logo: string };
  points: number;
  goalsDiff: number;
  group: string;
  form: string | null;
  description: string | null;
  all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
}

export interface StandingsResponse {
  league: League & { standings: StandingRow[][] };
}

export interface DataResult<T> {
  data: T;
  demo: boolean;
  error?: string;
}

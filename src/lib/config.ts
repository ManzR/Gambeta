// Configuración editable del sitio.

export const SITE_NAME = "Gambeta";
export const TIMEZONE = "America/Argentina/Buenos_Aires";

// ID de la Liga Profesional en API-Football. Lo demás que juegue Argentina se considera Ascenso / copas.
export const LIGA_PROFESIONAL_ID = 128;

// Ligas que aparecen primero en la agenda, en este orden.
// IDs de API-Football. Revisá el listado completo en el dashboard (endpoint /leagues).
export const FEATURED_LEAGUES: number[] = [
  128, // Liga Profesional Argentina
  129, // Primera Nacional
  130, // Copa Argentina
  13, // Copa Libertadores
  11, // Copa Sudamericana
  2, // UEFA Champions League
  39, // Premier League
  140, // La Liga
  135, // Serie A
  78, // Bundesliga
  61, // Ligue 1
  71, // Brasileirão Serie A
  262, // Liga MX
  268, // Uruguay Primera División
  307, // Saudi Pro League
];

// Si es true, en la agenda solo se muestran las ligas de FEATURED_LEAGUES y las argentinas.
// Si es false, se muestran todas las ligas del día (pueden ser cientos).
export const ONLY_FEATURED = true;

export function isArgentina(country: string | undefined | null) {
  return country === "Argentina";
}

// Torneos argentinos que NO son ascenso (primera división y copas nacionales).
const NOT_ASCENSO = new Set([LIGA_PROFESIONAL_ID, 130, 1032, 517, 810]);

export function isAscenso(leagueId: number, country: string) {
  return isArgentina(country) && !NOT_ASCENSO.has(leagueId);
}

export const REFRESH_TODAY_SECONDS = Number(process.env.REFRESH_TODAY_SECONDS || 900);
export const REFRESH_LIVE_MATCH_SECONDS = Number(process.env.REFRESH_LIVE_MATCH_SECONDS || 300);

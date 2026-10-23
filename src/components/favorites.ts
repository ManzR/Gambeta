"use client";

import { useCallback, useEffect, useState } from "react";

export interface FavTeam {
  id: number;
  name: string;
  logo: string;
}

const TEAMS_KEY = "gambeta:favTeams";
const LEAGUES_KEY = "gambeta:favLeagues";
const EVT = "gambeta:favs";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* almacenamiento no disponible: los favoritos duran solo esta visita */
  }
  window.dispatchEvent(new Event(EVT));
}

// Favoritos guardados en el navegador de cada visitante (sin cuentas por ahora).
export function useFavorites() {
  const [teams, setTeams] = useState<FavTeam[]>([]);
  const [leagues, setLeagues] = useState<number[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setTeams(read<FavTeam[]>(TEAMS_KEY, []));
      setLeagues(read<number[]>(LEAGUES_KEY, []));
      setReady(true);
    };
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggleTeam = useCallback((t: FavTeam) => {
    const cur = read<FavTeam[]>(TEAMS_KEY, []);
    const next = cur.some((x) => x.id === t.id) ? cur.filter((x) => x.id !== t.id) : [...cur, t];
    write(TEAMS_KEY, next);
  }, []);

  const toggleLeague = useCallback((id: number) => {
    const cur = read<number[]>(LEAGUES_KEY, []);
    write(LEAGUES_KEY, cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
  }, []);

  return {
    ready,
    teams,
    leagues,
    isTeam: (id: number) => teams.some((t) => t.id === id),
    isLeague: (id: number) => leagues.includes(id),
    toggleTeam,
    toggleLeague,
  };
}

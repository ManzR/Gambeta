"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Crest from "./Crest";
import LeagueBlock from "./LeagueBlock";
import { useFavorites } from "./favorites";
import type { LeagueGroup, MatchLite } from "@/lib/group";

type Filter = "all" | "live" | "pre" | "finished";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "live", label: "En vivo" },
  { id: "pre", label: "Próximos" },
  { id: "finished", label: "Finalizados" },
];

export default function HomeBoard({ groups, showLive }: { groups: LeagueGroup[]; showLive: boolean }) {
  const [filter, setFilter] = useState<Filter>("all");
  const favs = useFavorites();

  const all = useMemo(() => groups.flatMap((g) => g.matches.map((m) => ({ m, g }))), [groups]);
  const counts = useMemo(() => {
    const c = { all: all.length, live: 0, pre: 0, finished: 0 };
    for (const { m } of all) {
      if (m.state === "live") c.live++;
      else if (m.state === "finished") c.finished++;
      else if (m.state === "pre") c.pre++;
    }
    return c;
  }, [all]);

  const visible = useMemo(() => {
    const filtered = groups
      .map((g) => ({ ...g, matches: g.matches.filter((m) => filter === "all" || m.state === filter) }))
      .filter((g) => g.matches.length > 0);
    // Ligas destacadas por el usuario, primero.
    return [...filtered].sort((a, b) => Number(favs.isLeague(b.id)) - Number(favs.isLeague(a.id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups, filter, favs.leagues]);

  const liveNow = all.filter(({ m }) => m.state === "live").slice(0, 8);

  const myMatches = favs.teams.map((t) => {
    const found = all.find(({ m }) => m.home.id === t.id || m.away.id === t.id);
    return { t, found: found?.m as MatchLite | undefined };
  });

  return (
    <div className="stack-lg">
      <div className="chips" role="group" aria-label="Filtrar partidos">
        {FILTERS.map((f) => (
          <button key={f.id} type="button" className="chip" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.id === "live" && counts.live > 0 && <span className="live-dot" aria-hidden="true" />}
            {f.label}
            <span className="count">{counts[f.id]}</span>
          </button>
        ))}
      </div>

      {favs.ready && favs.teams.length > 0 && filter === "all" && (
        <section className="stack" aria-labelledby="mis-equipos">
          <div className="row-between">
            <h2 className="h-section" id="mis-equipos">
              Mis equipos
            </h2>
            <Link href="/mis-equipos" className="link-info">
              Ver todos
            </Link>
          </div>
          <div className="hscroll">
            {myMatches.map(({ t, found }) => (
              <Link key={t.id} href={found ? `/partido/${found.id}` : "/mis-equipos"} className="card fav-card">
                <Crest name={t.name} logo={t.logo} size={34} />
                <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</span>
                  <span className="sub" style={{ fontSize: 12 }}>
                    {found
                      ? found.state === "live"
                        ? `En vivo ${found.home.goals}-${found.away.goals}`
                        : found.state === "finished"
                          ? `Final ${found.home.goals}-${found.away.goals}`
                          : `Juega ${found.time}`
                      : "No juega este día"}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {showLive && liveNow.length > 0 && filter === "all" && (
        <section className="stack" aria-labelledby="en-vivo">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="live-dot" aria-hidden="true" />
            <h2 className="h-section" id="en-vivo">
              En vivo ahora
            </h2>
          </div>
          <div className="hscroll">
            {liveNow.map(({ m, g }) => (
              <Link key={m.id} href={`/partido/${m.id}`} className="card live-card">
                <div className="row-between">
                  <span className="sub" style={{ fontSize: 12, fontWeight: 600 }}>
                    {g.name}
                  </span>
                  <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: 13 }}>{m.label}</span>
                </div>
                <div className="vs">
                  <div className="side">
                    <Crest name={m.home.name} logo={m.home.logo} size={40} />
                    {m.home.name}
                  </div>
                  <span className="score">
                    {m.home.goals} - {m.away.goals}
                  </span>
                  <div className="side">
                    <Crest name={m.away.name} logo={m.away.logo} size={40} />
                    {m.away.name}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="stack" aria-label="Partidos por liga">
        {visible.length === 0 ? (
          <div className="card empty">No hay partidos para este filtro.</div>
        ) : (
          visible.map((g) => (
            <LeagueBlock key={g.id} g={g} starred={favs.isLeague(g.id)} onStar={() => favs.toggleLeague(g.id)} />
          ))
        )}
      </section>
    </div>
  );
}

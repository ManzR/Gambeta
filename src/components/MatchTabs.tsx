"use client";

import Link from "next/link";
import { useState } from "react";
import Crest from "./Crest";
import { STAT_ORDER, statLabel, statNumber } from "@/lib/format";
import type { Fixture, MatchEvent, StandingRow } from "@/lib/types";

type Tab = "resumen" | "stats" | "lineups" | "tabla";

function eventIcon(e: MatchEvent, homeId: number) {
  if (e.type === "Goal") {
    if (e.detail === "Missed Penalty") return { cls: "var", txt: "×" };
    return { cls: e.team.id === homeId ? "goal-h" : "goal-a", txt: "GOL" };
  }
  if (e.type === "Card") return e.detail.includes("Yellow") && !e.detail.includes("Second") ? { cls: "yellow", txt: "" } : { cls: "red", txt: "" };
  if (e.type === "subst") return { cls: "sub", txt: "⇄" };
  return { cls: "var", txt: "VAR" };
}

function eventTitle(e: MatchEvent) {
  if (e.type === "Goal") {
    if (e.detail === "Own Goal") return `Gol en contra · ${e.team.name}`;
    if (e.detail === "Penalty") return `Gol de penal · ${e.team.name}`;
    if (e.detail === "Missed Penalty") return `Penal errado · ${e.team.name}`;
    return `Gol de ${e.team.name}`;
  }
  if (e.type === "Card") {
    if (e.detail === "Yellow Card") return `Amarilla · ${e.team.name}`;
    if (e.detail === "Second Yellow card") return `Doble amarilla · ${e.team.name}`;
    return `Roja · ${e.team.name}`;
  }
  if (e.type === "subst") return `Cambio · ${e.team.name}`;
  return `VAR · ${e.team.name}`;
}

function eventDetail(e: MatchEvent) {
  if (e.type === "subst") return [e.player.name, e.assist.name].filter(Boolean).join(" ⇄ ");
  if (e.type === "Goal" && e.assist.name) return `${e.player.name ?? ""} · asistencia de ${e.assist.name}`;
  if (e.type === "Var") return `${e.detail}${e.player.name ? ` · ${e.player.name}` : ""}`;
  return e.player.name ?? "";
}

export default function MatchTabs({ f, table }: { f: Fixture; table: StandingRow[] | null }) {
  const hasStats = !!f.statistics && f.statistics.length === 2 && f.statistics[0].statistics.length > 0;
  const hasLineups = !!f.lineups && f.lineups.length === 2;
  const tabs: { id: Tab; label: string; show: boolean }[] = [
    { id: "resumen", label: "Resumen", show: true },
    { id: "stats", label: "Estadísticas", show: hasStats },
    { id: "lineups", label: "Alineaciones", show: hasLineups },
    { id: "tabla", label: "Tabla", show: !!table && table.length > 0 },
  ];
  const [tab, setTab] = useState<Tab>("resumen");
  const homeId = f.teams.home.id;
  const events = [...(f.events ?? [])].sort(
    (a, b) => b.time.elapsed + (b.time.extra ?? 0) / 100 - (a.time.elapsed + (a.time.extra ?? 0) / 100),
  );

  return (
    <div className="stack">
      <div className="tabs" role="tablist" aria-label="Secciones del partido">
        {tabs
          .filter((t) => t.show)
          .map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "resumen" && (
          <div className="card card-pad">
            <h2 className="h-section" style={{ marginBottom: 8 }}>
              Minuto a minuto
            </h2>
            {events.length === 0 ? (
              <p className="sub" style={{ margin: "8px 0 0" }}>
                {f.fixture.status.short === "NS" ? "El partido todavía no empezó." : "Sin incidencias registradas por ahora."}
              </p>
            ) : (
              <div>
                {events.map((e, i) => {
                  const ic = eventIcon(e, homeId);
                  return (
                    <div className="event" key={i}>
                      <span className="min">
                        {e.time.elapsed}
                        {e.time.extra ? `+${e.time.extra}` : ""}&apos;
                      </span>
                      <span className={`ic ${ic.cls}`} aria-hidden="true">
                        {ic.txt}
                      </span>
                      <div style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
                        <span className="ttl">{eventTitle(e)}</span>
                        <span className="sub" style={{ fontSize: 12 }}>
                          {eventDetail(e)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "stats" && hasStats && <Stats f={f} />}

        {tab === "lineups" && hasLineups && (
          <div className="lineups">
            {f.lineups!.map((l) => (
              <div className="card card-pad lineup" key={l.team.id}>
                <div className="row-between" style={{ marginBottom: 10 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
                    <Crest name={l.team.name} logo={l.team.logo} size={24} />
                    {l.team.name}
                  </span>
                  <span className="sub">{l.formation}</span>
                </div>
                <ul>
                  {l.startXI.map(({ player: p }) => (
                    <li key={p.id + p.name}>
                      <span className="num">{p.number}</span>
                      <span>{p.name}</span>
                      <span className="pos">{p.pos}</span>
                    </li>
                  ))}
                </ul>
                {l.substitutes.length > 0 && (
                  <>
                    <div className="sub" style={{ margin: "12px 0 4px", fontWeight: 600 }}>
                      Suplentes
                    </div>
                    <ul>
                      {l.substitutes.map(({ player: p }) => (
                        <li key={p.id + p.name}>
                          <span className="num">{p.number}</span>
                          <span>{p.name}</span>
                          <span className="pos">{p.pos}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {l.coach.name && (
                  <div className="sub" style={{ marginTop: 10 }}>
                    DT: {l.coach.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "tabla" && table && (
          <div className="card">
            <div className="table-wrap">
              <table className="standings">
                <thead>
                  <tr>
                    <th>#</th>
                    <th className="l">Equipo</th>
                    <th>PJ</th>
                    <th>DG</th>
                    <th>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {table.map((r) => (
                    <tr key={r.team.id} className={r.team.id === homeId || r.team.id === f.teams.away.id ? "hl" : undefined}>
                      <td className="pos">{r.rank}</td>
                      <td className="l">
                        <span className="team-cell">
                          <Crest name={r.team.name} logo={r.team.logo} size={20} />
                          {r.team.name}
                        </span>
                      </td>
                      <td>{r.all.played}</td>
                      <td>{r.goalsDiff > 0 ? `+${r.goalsDiff}` : r.goalsDiff}</td>
                      <td className="pts">{r.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: "10px 14px", borderTop: "1px solid var(--line)" }}>
              <Link className="link-info" href={`/liga/${f.league.id}?season=${f.league.season}`}>
                Ver tabla completa
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stats({ f }: { f: Fixture }) {
  const [h, a] = f.statistics!;
  const types = STAT_ORDER.filter((t) => h.statistics.some((s) => s.type === t));
  return (
    <div className="card card-pad stack">
      <div className="row-between">
        <h2 className="h-section">Estadísticas</h2>
        <span style={{ display: "flex", gap: 12, fontSize: 12, fontWeight: 700 }}>
          <span style={{ color: "var(--accent)" }}>{f.teams.home.name}</span>
          <span style={{ color: "var(--info)" }}>{f.teams.away.name}</span>
        </span>
      </div>
      {types.map((t) => {
        const hv = h.statistics.find((s) => s.type === t)?.value ?? 0;
        const av = a.statistics.find((s) => s.type === t)?.value ?? 0;
        const hn = statNumber(hv);
        const an = statNumber(av);
        const max = Math.max(hn, an) || 1;
        return (
          <div className="stat" key={t}>
            <div className="labels">
              <span>{hv ?? 0}</span>
              <span className="lbl">{statLabel(t)}</span>
              <span>{av ?? 0}</span>
            </div>
            <div className="bars" aria-hidden="true">
              <div className="bar h">
                <span style={{ width: `${(hn / max) * 100}%` }} />
              </div>
              <div className="bar a">
                <span style={{ width: `${(an / max) * 100}%` }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

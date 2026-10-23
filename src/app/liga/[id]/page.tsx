import type { Metadata } from "next";
import Link from "next/link";
import Crest from "@/components/Crest";
import { DemoNotice, ErrorNotice } from "@/components/Notices";
import { getCurrentSeason, getStandings } from "@/lib/api";
import { countryEs } from "@/lib/group";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ season?: string }> };

export const metadata: Metadata = { title: "Tabla de posiciones" };

const FORM: Record<string, string> = { W: "G", D: "E", L: "P" };

export default async function LeaguePage({ params, searchParams }: Props) {
  const { id: idRaw } = await params;
  const sp = await searchParams;
  const id = Number(idRaw);
  if (!Number.isInteger(id) || id <= 0) {
    return (
      <main className="page">
        <div className="container">
          <div className="card empty">Liga no encontrada.</div>
        </div>
      </main>
    );
  }
  const season = sp.season && /^\d{4}$/.test(sp.season) ? Number(sp.season) : await getCurrentSeason(id);
  const res = await getStandings(id, season);
  const lg = res.data?.league;

  return (
    <main className="page">
      <div className="container stack-lg" style={{ maxWidth: 900 }}>
        <nav className="crumbs" aria-label="Ruta">
          <Link href="/">Partidos</Link>
          <span aria-hidden="true">/</span>
          <span>Tablas</span>
        </nav>
        {res.demo && <DemoNotice />}
        {res.error && <ErrorNotice message={res.error} />}
        {!lg ? (
          <div className="card empty">No hay tabla disponible para esta liga y temporada.</div>
        ) : (
          <>
            <header style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {lg.logo ? <Crest name={lg.name} logo={lg.logo} size={48} /> : null}
              <div>
                <h1 className="h-page">{lg.name}</h1>
                <div className="sub">
                  {countryEs(lg.country)} · Temporada {lg.season}
                </div>
              </div>
            </header>
            {lg.standings.map((rows, gi) => (
              <section className="card" key={gi} aria-label={rows[0]?.group ?? lg.name}>
                {lg.standings.length > 1 && (
                  <h2 className="h-section" style={{ padding: "14px 14px 0" }}>
                    {rows[0]?.group}
                  </h2>
                )}
                <div className="table-wrap">
                  <table className="standings">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th className="l">Equipo</th>
                        <th>PJ</th>
                        <th className="hide-sm">G</th>
                        <th className="hide-sm">E</th>
                        <th className="hide-sm">P</th>
                        <th className="hide-sm">GF:GC</th>
                        <th>DG</th>
                        <th>Pts</th>
                        <th className="hide-sm l">Últimos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.team.id}>
                          <td className={`pos${r.description ? " q" : ""}`} title={r.description ?? undefined}>
                            <span>{r.rank}</span>
                          </td>
                          <td className="l">
                            <span className="team-cell">
                              <Crest name={r.team.name} logo={r.team.logo} size={20} />
                              {r.team.name}
                            </span>
                          </td>
                          <td>{r.all.played}</td>
                          <td className="hide-sm">{r.all.win}</td>
                          <td className="hide-sm">{r.all.draw}</td>
                          <td className="hide-sm">{r.all.lose}</td>
                          <td className="hide-sm">
                            {r.all.goals.for}:{r.all.goals.against}
                          </td>
                          <td>{r.goalsDiff > 0 ? `+${r.goalsDiff}` : r.goalsDiff}</td>
                          <td className="pts">{r.points}</td>
                          <td className="hide-sm l">
                            <span className="form" aria-label={`Últimos partidos: ${r.form ?? "sin datos"}`}>
                              {(r.form ?? "")
                                .slice(-5)
                                .split("")
                                .map((c, i) => (
                                  <span key={i} className={c}>
                                    {FORM[c] ?? c}
                                  </span>
                                ))}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
            <p className="sub" style={{ margin: 0 }}>
              Las posiciones marcadas en celeste tienen una clasificación o zona especial; pasá el mouse para ver cuál.
            </p>
          </>
        )}
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AutoRefresh from "@/components/AutoRefresh";
import Crest from "@/components/Crest";
import FollowButtons from "@/components/FollowButtons";
import MatchTabs from "@/components/MatchTabs";
import { DemoNotice, ErrorNotice } from "@/components/Notices";
import { getFixture, getHeadToHead, getStandings } from "@/lib/api";
import { kickoff, longDate, matchState, statusLabel } from "@/lib/format";
import { roundLabel } from "@/lib/group";
import type { Fixture } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

async function load(idRaw: string) {
  const id = Number(idRaw);
  if (!Number.isInteger(id) || id <= 0) return null;
  return getFixture(id);
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const res = await load(id);
  const f = res?.data;
  if (!f) return { title: "Partido" };
  return {
    title: `${f.teams.home.name} vs ${f.teams.away.name} en vivo`,
    description: `${f.league.name}: ${f.teams.home.name} vs ${f.teams.away.name}. Resultado, minuto a minuto, estadísticas y alineaciones.`,
  };
}

function scorers(f: Fixture, teamId: number) {
  return (f.events ?? [])
    .filter((e) => e.type === "Goal" && e.detail !== "Missed Penalty" && e.team.id === teamId)
    .map((e) => `${e.player.name ?? "Gol"} ${e.time.elapsed}'${e.detail === "Penalty" ? " (p)" : e.detail === "Own Goal" ? " (e.c.)" : ""}`);
}

export default async function MatchPage({ params }: Params) {
  const { id } = await params;
  const res = await load(id);
  if (!res) notFound();
  if (!res.data) {
    if (res.error)
      return (
        <main className="page">
          <div className="container">
            <ErrorNotice message={res.error} />
          </div>
        </main>
      );
    notFound();
  }
  const f = res.data;
  const state = matchState(f);
  const [standings, h2h] = await Promise.all([
    getStandings(f.league.id, f.league.season),
    getHeadToHead(f.teams.home.id, f.teams.away.id),
  ]);
  const table = standings.data?.league.standings.find((g) => g.some((r) => r.team.id === f.teams.home.id)) ?? standings.data?.league.standings[0] ?? null;
  const hg = f.goals.home;
  const ag = f.goals.away;
  const started = state === "live" || state === "finished";
  const pen = f.score?.penalty;
  const pastH2h = h2h.data.filter((x) => matchState(x) === "finished" && x.fixture.id !== f.fixture.id).slice(0, 5);

  return (
    <main className="page">
      <AutoRefresh active={state === "live"} seconds={60} />
      <div className="container stack-lg" style={{ maxWidth: 860 }}>
        <nav className="crumbs" aria-label="Ruta">
          <Link href="/">Partidos</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/liga/${f.league.id}?season=${f.league.season}`}>{f.league.name}</Link>
          {f.league.round && (
            <>
              <span aria-hidden="true">/</span>
              <span>{roundLabel(f.league.round)}</span>
            </>
          )}
        </nav>

        {res.demo && <DemoNotice />}

        <section className="card scoreboard" aria-label="Marcador">
          <h1 className="sr-only">
            {f.teams.home.name} vs {f.teams.away.name}
          </h1>
          <div className="vs">
            <div className="side">
              <Crest name={f.teams.home.name} logo={f.teams.home.logo} size={64} />
              {f.teams.home.name}
            </div>
            <div className="mid">
              <span className="big">{started ? `${hg ?? 0} - ${ag ?? 0}` : kickoff(f.fixture.date)}</span>
              {pen && pen.home != null && pen.away != null && (
                <span className="sub">
                  Penales {pen.home} - {pen.away}
                </span>
              )}
              <span className={`state ${state === "live" ? "live" : "idle"}`}>
                {state === "live" && <span className="live-dot" aria-hidden="true" />}
                {state === "pre" ? longDate(f.fixture.date) : statusLabel(f)}
              </span>
            </div>
            <div className="side">
              <Crest name={f.teams.away.name} logo={f.teams.away.logo} size={64} />
              {f.teams.away.name}
            </div>
          </div>
          {started && (
            <div className="scorers">
              <div>
                {scorers(f, f.teams.home.id).map((s, i) => (
                  <span key={i}>{s}</span>
                ))}
              </div>
              <div>
                {scorers(f, f.teams.away.id).map((s, i) => (
                  <span key={i}>{s}</span>
                ))}
              </div>
            </div>
          )}
        </section>

        <FollowButtons
          teams={[
            { id: f.teams.home.id, name: f.teams.home.name, logo: f.teams.home.logo },
            { id: f.teams.away.id, name: f.teams.away.name, logo: f.teams.away.logo },
          ]}
        />

        <MatchTabs f={f} table={table} />

        {pastH2h.length > 0 && (
          <section className="card" aria-labelledby="h2h">
            <h2 className="h-section" id="h2h" style={{ padding: "14px 14px 6px" }}>
              Últimos enfrentamientos
            </h2>
            {pastH2h.map((x) => (
              <Link key={x.fixture.id} href={`/partido/${x.fixture.id}`} className="match">
                <div className="when">
                  <span className="ft">{new Date(x.fixture.date).getFullYear()}</span>
                </div>
                <div className="teams">
                  <div className="team">
                    <Crest name={x.teams.home.name} logo={x.teams.home.logo} />
                    <span className="nm">{x.teams.home.name}</span>
                    <span className="sc">{x.goals.home}</span>
                  </div>
                  <div className="team">
                    <Crest name={x.teams.away.name} logo={x.teams.away.logo} />
                    <span className="nm">{x.teams.away.name}</span>
                    <span className="sc">{x.goals.away}</span>
                  </div>
                </div>
                <span />
              </Link>
            ))}
          </section>
        )}

        <section className="card card-pad info-grid" aria-label="Información del partido">
          <div>
            <div className="k">Estadio</div>
            <div className="v">{f.fixture.venue.name ?? "A confirmar"}</div>
          </div>
          <div>
            <div className="k">Árbitro</div>
            <div className="v">{f.fixture.referee ?? "A confirmar"}</div>
          </div>
          <div>
            <div className="k">Torneo</div>
            <div className="v">{f.league.name}</div>
          </div>
          <div>
            <div className="k">Fecha</div>
            <div className="v">
              {longDate(f.fixture.date)}, {kickoff(f.fixture.date)} h
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

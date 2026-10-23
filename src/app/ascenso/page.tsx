import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import AutoRefresh from "@/components/AutoRefresh";
import HomeBoard from "@/components/HomeBoard";
import { IconChevron } from "@/components/Icons";
import { DemoNotice, ErrorNotice } from "@/components/Notices";
import { getFixturesByDate } from "@/lib/api";
import { isAscenso } from "@/lib/config";
import { todayYmd } from "@/lib/format";
import { groupByLeague } from "@/lib/group";

export const metadata: Metadata = {
  title: "Ascenso argentino en vivo",
  description: "Primera Nacional, Primera B Metropolitana, Federal A y más: resultados en vivo y tablas del ascenso.",
};

// IDs de API-Football de los torneos de ascenso con tabla. Verificalos en el dashboard (/leagues?country=Argentina).
const TORNEOS = [
  { id: 129, name: "Primera Nacional" },
  { id: 131, name: "Primera B Metropolitana" },
  { id: 134, name: "Torneo Federal A" },
];

export default async function AscensoPage() {
  // Se arma en cada visita porque "hoy" cambia; los datos salen de la caché del servidor.
  await connection();
  const res = await getFixturesByDate(todayYmd());
  const groups = groupByLeague(
    res.data.filter((f) => isAscenso(f.league.id, f.league.country)),
    { onlyFeatured: false },
  );
  const anyLive = groups.some((g) => g.matches.some((m) => m.state === "live"));

  return (
    <main className="page">
      <AutoRefresh active={anyLive} seconds={60} />
      <div className="container grid-home">
        <div className="stack-lg">
          <header className="stack" style={{ gap: 6 }}>
            <h1 className="h-page">Ascenso</h1>
            <span className="sub">Todo el fútbol del ascenso argentino, hoy.</span>
          </header>
          {res.demo && <DemoNotice />}
          {res.error && <ErrorNotice message={res.error} />}
          {groups.length === 0 ? (
            <div className="card empty">Hoy no hay partidos del ascenso.</div>
          ) : (
            <HomeBoard groups={groups} showLive />
          )}
        </div>
        <aside className="sidebar stack">
          <h2 className="h-section">Tablas</h2>
          <div className="card">
            {TORNEOS.map((t, i) => (
              <Link
                key={t.id}
                href={`/liga/${t.id}`}
                className="row-between"
                style={{ padding: "14px 16px", borderTop: i ? "1px solid var(--line)" : undefined, fontWeight: 600 }}
              >
                {t.name}
                <IconChevron />
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}

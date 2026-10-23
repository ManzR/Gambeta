import type { Metadata } from "next";
import { connection } from "next/server";
import MyTeams from "@/components/MyTeams";
import { getFixturesByDate } from "@/lib/api";
import { addDays, todayYmd } from "@/lib/format";
import { toLite } from "@/lib/group";

export const metadata: Metadata = { title: "Mis equipos" };

export default async function MyTeamsPage() {
  // Se arma en cada visita porque "hoy" cambia; los datos salen de la caché del servidor.
  await connection();
  const today = todayYmd();
  const [a, b] = await Promise.all([getFixturesByDate(today), getFixturesByDate(addDays(today, 1))]);
  const matches = [...a.data, ...b.data].map((f) => ({ ...toLite(f), league: f.league.name }));
  return (
    <main className="page">
      <div className="container stack-lg" style={{ maxWidth: 860 }}>
        <header className="stack" style={{ gap: 6 }}>
          <h1 className="h-page">Mis equipos</h1>
          <span className="sub">Los partidos de hoy y mañana de los equipos que seguís. Se guardan en este navegador.</span>
        </header>
        <MyTeams matches={matches} />
      </div>
    </main>
  );
}

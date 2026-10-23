import Link from "next/link";
import AutoRefresh from "@/components/AutoRefresh";
import HomeBoard from "@/components/HomeBoard";
import { IconBack, IconChevron, IconTable, IconTrend } from "@/components/Icons";
import { DemoNotice, ErrorNotice } from "@/components/Notices";
import { getFixturesByDate } from "@/lib/api";
import { addDays, dayChip, isValidYmd, longDate, todayYmd } from "@/lib/format";
import { groupByLeague } from "@/lib/group";

export default async function Home({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const sp = await searchParams;
  const today = todayYmd();
  const date = isValidYmd(sp.date) ? sp.date : today;
  const res = await getFixturesByDate(date);
  const groups = groupByLeague(res.data);
  const anyLive = groups.some((g) => g.matches.some((m) => m.state === "live"));
  const days = [-2, -1, 0, 1, 2].map((n) => addDays(date, n));

  return (
    <main className="page">
      <AutoRefresh active={anyLive} seconds={60} />
      <div className="container grid-home">
        <div className="stack-lg">
          <div className="stack">
            <h1 className="sr-only">Partidos de fútbol del {longDate(`${date}T15:00:00Z`)}</h1>
            <nav className="date-strip" aria-label="Elegir fecha">
              <Link href={`/?date=${addDays(date, -5)}`} className="arrow" aria-label="Días anteriores">
                <IconBack />
              </Link>
              {days.map((d) => {
                const c = dayChip(d, today);
                return (
                  <Link key={d} href={d === today ? "/" : `/?date=${d}`} aria-current={d === date ? "date" : undefined}>
                    <span className="dow">{c.dow}</span>
                    <span className="n">{c.n}</span>
                  </Link>
                );
              })}
              <Link href={`/?date=${addDays(date, 5)}`} className="arrow" aria-label="Días siguientes">
                <IconChevron />
              </Link>
            </nav>
            {res.demo && <DemoNotice />}
            {res.error && <ErrorNotice message={res.error} />}
          </div>
          <HomeBoard groups={groups} showLive={date === today} />
        </div>

        <aside className="sidebar stack">
          <Link href="/ascenso" className="card promo">
            <span className="ico">
              <IconTrend size={26} />
            </span>
            <span style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
              <span className="ttl">Todo el Ascenso</span>
              <span className="sub">Primera Nacional, B Metro, Federal A y más, con tablas.</span>
            </span>
            <IconChevron />
          </Link>
          <Link href="/liga/128" className="card promo" style={{ background: "var(--s1)" }}>
            <span className="ico" style={{ background: "var(--info)" }}>
              <IconTable size={24} />
            </span>
            <span style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
              <span className="ttl">Tabla de la Liga</span>
              <span className="sub">Posiciones de la Liga Profesional.</span>
            </span>
            <IconChevron />
          </Link>
          <div className="card card-pad sub" style={{ lineHeight: 1.55 }}>
            Tocá la estrella de una liga para que aparezca primero, y seguí a tus equipos desde la ficha de cada partido.
          </div>
        </aside>
      </div>
    </main>
  );
}

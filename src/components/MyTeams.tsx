"use client";

import Link from "next/link";
import Crest from "./Crest";
import MatchRow from "./MatchRow";
import { useFavorites } from "./favorites";
import type { MatchLite } from "@/lib/group";

export default function MyTeams({ matches }: { matches: (MatchLite & { league: string })[] }) {
  const favs = useFavorites();
  if (!favs.ready) return null;
  if (favs.teams.length === 0) {
    return (
      <div className="card card-pad stack" style={{ alignItems: "flex-start" }}>
        <p style={{ margin: 0 }}>Todavía no seguís a ningún equipo.</p>
        <p className="sub" style={{ margin: 0 }}>
          Entrá a cualquier partido y tocá “Seguir a…” para tenerlo acá y arriba de todo en el inicio.
        </p>
        <Link href="/" className="chip" style={{ marginTop: 4 }}>
          Ir a los partidos
        </Link>
      </div>
    );
  }
  return (
    <div className="stack">
      {favs.teams.map((t) => {
        const list = matches.filter((m) => m.home.id === t.id || m.away.id === t.id);
        return (
          <section className="card league" key={t.id} aria-label={t.name}>
            <div className="league-head">
              <Crest name={t.name} logo={t.logo} size={30} />
              <div className="lg-meta">
                <span className="lg-name">{t.name}</span>
                <span className="sub" style={{ fontSize: 11 }}>
                  {list.length ? list.map((m) => m.league).filter((v, i, arr) => arr.indexOf(v) === i).join(" · ") : "Sin partidos hoy ni mañana"}
                </span>
              </div>
              <button type="button" className="chip" onClick={() => favs.toggleTeam(t)} style={{ marginRight: 8 }}>
                Dejar de seguir
              </button>
            </div>
            {list.map((m) => (
              <MatchRow key={m.id} m={m} />
            ))}
          </section>
        );
      })}
    </div>
  );
}

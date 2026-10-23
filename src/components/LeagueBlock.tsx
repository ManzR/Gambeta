"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import MatchRow from "./MatchRow";
import { IconStar } from "./Icons";
import { countryEs, type LeagueGroup } from "@/lib/group";

export default function LeagueBlock({
  g,
  starred,
  onStar,
}: {
  g: LeagueGroup;
  starred: boolean;
  onStar: () => void;
}) {
  return (
    <section className="card league" aria-label={g.name}>
      <div className="league-head">
        {g.logo ? (
          <span className="lg-logo">
            <img src={g.logo} alt="" width={22} height={22} loading="lazy" />
          </span>
        ) : (
          <span className="lg-logo ph" aria-hidden="true">
            {g.name.slice(0, 3).toUpperCase()}
          </span>
        )}
        <div className="lg-meta">
          <Link href={`/liga/${g.id}?season=${g.season}`} className="lg-name">
            {g.name}
          </Link>
          <span className="sub" style={{ fontSize: 11 }}>
            {countryEs(g.country)}
            {g.round ? ` · ${g.round}` : ""}
          </span>
        </div>
        {g.ascenso && <span className="badge badge-info">Ascenso</span>}
        <button
          type="button"
          className="star"
          aria-pressed={starred}
          aria-label={starred ? `Quitar ${g.name} de destacadas` : `Destacar ${g.name}`}
          onClick={onStar}
        >
          <IconStar filled={starred} />
        </button>
      </div>
      {g.matches.map((m) => (
        <MatchRow key={m.id} m={m} />
      ))}
    </section>
  );
}

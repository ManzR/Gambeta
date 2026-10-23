import Link from "next/link";
import Crest from "./Crest";
import { IconChevron } from "./Icons";
import type { MatchLite } from "@/lib/group";

export default function MatchRow({ m }: { m: MatchLite }) {
  const live = m.state === "live";
  const done = m.state === "finished";
  const hg = m.home.goals;
  const ag = m.away.goals;
  const showScore = live || done || (hg != null && ag != null);
  const homeWin = done && hg != null && ag != null && hg > ag;
  const awayWin = done && hg != null && ag != null && ag > hg;
  const aria = `${m.home.name} ${showScore ? hg : ""} contra ${m.away.name} ${showScore ? ag : ""}, ${m.label}`;

  return (
    <Link href={`/partido/${m.id}`} className={`match${live ? " is-live" : ""}`} aria-label={aria}>
      <div className="when">
        {live ? (
          <>
            <span className="live">{m.label === "Entretiempo" ? "ET" : m.label}</span>
            <span className="live-tag">EN VIVO</span>
          </>
        ) : done ? (
          <span className="ft">{m.label}</span>
        ) : m.state === "off" ? (
          <span className="ft">{m.label}</span>
        ) : (
          <span className="t">{m.time}</span>
        )}
      </div>
      <div className="teams">
        <div className={`team${homeWin ? " win" : ""}`}>
          <Crest name={m.home.name} logo={m.home.logo} />
          <span className="nm">{m.home.name}</span>
          <span className="sc">{showScore ? hg : ""}</span>
        </div>
        <div className={`team${awayWin ? " win" : ""}`}>
          <Crest name={m.away.name} logo={m.away.logo} />
          <span className="nm">{m.away.name}</span>
          <span className="sc">{showScore ? ag : ""}</span>
        </div>
      </div>
      <span className="chev">
        <IconChevron />
      </span>
    </Link>
  );
}

"use client";

import { IconStar } from "./Icons";
import { useFavorites, type FavTeam } from "./favorites";

export default function FollowButtons({ teams }: { teams: FavTeam[] }) {
  const favs = useFavorites();
  return (
    <div className="chips" role="group" aria-label="Seguir equipos">
      {teams.map((t) => {
        const on = favs.isTeam(t.id);
        return (
          <button key={t.id} type="button" className="chip" aria-pressed={on} onClick={() => favs.toggleTeam(t)}>
            <IconStar size={15} filled={on} />
            {on ? `Siguiendo a ${t.name}` : `Seguir a ${t.name}`}
          </button>
        );
      })}
    </div>
  );
}

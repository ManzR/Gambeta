import { IconInfo } from "./Icons";

export function DemoNotice() {
  return (
    <div className="notice" role="note">
      <IconInfo />
      <span>
        Estás viendo <strong>datos de ejemplo</strong>. Para ver partidos reales, cargá tu clave de API-Football en la variable{" "}
        <code>API_FOOTBALL_KEY</code> (ver README).
      </span>
    </div>
  );
}

export function ErrorNotice({ message }: { message: string }) {
  return (
    <div className="notice err" role="alert">
      <IconInfo />
      <span>
        No pudimos traer los datos de API-Football. {message.includes("limit") || message.includes("requests") ? "Puede que se haya agotado la cuota diaria. " : ""}
        <span className="sub">Detalle: {message}</span>
      </span>
    </div>
  );
}

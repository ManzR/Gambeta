# Gambeta — fútbol en vivo

Sitio de resultados en vivo, agenda del día, fichas de partido, tablas y una sección propia del Ascenso argentino.
Hecho con Next.js y datos de [API-Football](https://www.api-football.com/).

Sin clave de API el sitio funciona igual, con **datos de ejemplo**, para que puedas verlo y probarlo.

## Qué tiene

- **Inicio**: partidos por fecha (ayer, hoy, mañana…), filtros En vivo / Próximos / Finalizados, carrusel "En vivo ahora" y estrella para destacar ligas.
- **Ficha de partido**: marcador, goleadores, minuto a minuto, estadísticas (posesión, xG, tiros…), alineaciones, tabla, últimos enfrentamientos y botón para seguir equipos.
- **Ascenso**: todos los partidos argentinos de hoy fuera de la Liga Profesional, con acceso a las tablas.
- **Tablas**: posiciones completas con forma reciente.
- **Mis equipos**: los equipos que seguís (se guardan en el navegador, sin crear cuenta).
- Se actualiza solo cada 60 segundos mientras haya partidos en vivo.

## 1. Conseguir la clave de API-Football

1. Creá una cuenta en https://dashboard.api-football.com/register
2. En el panel, copiá tu **API key**.
3. El plan gratis da **100 pedidos por día**. Alcanza para probar, pero no para un sitio con público y partidos en vivo. Para eso conviene el plan **Pro** (7.500 por día).

## 2. Probarlo en tu computadora

Necesitás [Node.js](https://nodejs.org/) 20 o más nuevo.

```bash
npm install
cp .env.example .env.local   # en Windows: copy .env.example .env.local
# Abrí .env.local y pegá tu clave en API_FOOTBALL_KEY=
npm run dev
```

Abrí http://localhost:3000

## 3. Publicarlo en internet (Vercel, gratis para empezar)

1. Subí esta carpeta a un repositorio de GitHub.
2. Entrá a https://vercel.com, "Add New → Project" e importá el repositorio.
3. En **Environment Variables** agregá `API_FOOTBALL_KEY` con tu clave (y, si querés, las otras de `.env.example`).
4. Deploy. Después podés conectar tu dominio (por ejemplo `gambeta.com.ar`, que se registra en nic.ar).

La clave queda en el servidor: nunca llega al navegador de los visitantes.

## Cómo se cuida la cuota de pedidos

Cada respuesta de la API se guarda en la caché del servidor y se reutiliza para todos los visitantes:

| Dato | Se vuelve a pedir cada |
|---|---|
| Partidos de hoy | `REFRESH_TODAY_SECONDS` (900 s por defecto = 15 min) |
| Ficha de un partido | `REFRESH_LIVE_MATCH_SECONDS` (300 s por defecto) |
| Partidos de otros días | 3 a 6 horas |
| Tablas | 6 horas |
| Enfrentamientos previos | 24 horas |

Con el plan gratis dejá los valores por defecto. Con el plan Pro podés bajar `REFRESH_TODAY_SECONDS` a 60 y `REFRESH_LIVE_MATCH_SECONDS` a 30 para tener el en vivo casi al instante.

## Ajustes rápidos

- **Qué ligas aparecen y en qué orden**: `src/lib/config.ts` → `FEATURED_LEAGUES` (IDs de API-Football). Las ligas argentinas siempre aparecen.
- **Torneos del Ascenso con tabla**: `src/app/ascenso/page.tsx` → `TORNEOS`. Verificá los IDs en el dashboard (endpoint `/leagues?country=Argentina`).
- **Colores y tipografías**: `src/app/globals.css` (variables al principio del archivo).
- **Nombre del sitio**: `src/app/layout.tsx` y `src/components/SiteChrome.tsx`.

## Próximos pasos sugeridos

- Cuentas de usuario + base de datos (por ejemplo Supabase) para el **prode con amigos**, comentarios y favoritos sincronizados entre dispositivos.
- Notificaciones push de goles para los equipos que seguís.
- Páginas de equipo y de jugador (buenas para aparecer en Google).
- Publicidad o sponsors. Si pensás en casas de apuestas, consultá antes la regulación de cada provincia.

/* eslint-disable @next/next/no-img-element */

const PALETTE = ["#0B2D6B", "#1E7A3A", "#7A1020", "#1B3A8C", "#5A3A22", "#2B4C7E", "#7A1F2B", "#3F4B8C", "#215E5A", "#6B3A7A"];

function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function initials(name: string) {
  const words = name
    .replace(/^Al[- ]/i, "")
    .replace(/[.()-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words
    .slice(0, 3)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function Crest({ name, logo, size = 22 }: { name: string; logo?: string; size?: number }) {
  if (logo) {
    return (
      <span className="crest has-img" style={{ width: size, height: size }}>
        <img src={logo} alt="" width={size} height={size} loading="lazy" />
      </span>
    );
  }
  return (
    <span
      className="crest"
      aria-hidden="true"
      style={{ width: size, height: size, background: colorFor(name), fontSize: Math.max(8, Math.round(size * 0.32)) }}
    >
      {initials(name)}
    </span>
  );
}

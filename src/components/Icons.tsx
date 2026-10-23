type P = { size?: number };
const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const IconBall = ({ size = 22 }: P) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7l4 3-1.5 4.5h-5L8 10z" />
  </svg>
);
export const IconTrend = ({ size = 22 }: P) => (
  <svg {...base(size)}>
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M15 7h6v6" />
  </svg>
);
export const IconTable = ({ size = 22 }: P) => (
  <svg {...base(size)}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 10h18M9 4v16" />
  </svg>
);
export const IconStar = ({ size = 18, filled = false }: P & { filled?: boolean }) => (
  <svg {...base(size)} fill={filled ? "currentColor" : "none"}>
    <path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z" />
  </svg>
);
export const IconChevron = ({ size = 16 }: P) => (
  <svg {...base(size)}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);
export const IconBack = ({ size = 16 }: P) => (
  <svg {...base(size)}>
    <path d="M15 6l-6 6 6 6" />
  </svg>
);
export const IconShield = ({ size = 22 }: P) => (
  <svg {...base(size)}>
    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
  </svg>
);
export const IconInfo = ({ size = 18 }: P) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v6M12 7.5v.5" />
  </svg>
);

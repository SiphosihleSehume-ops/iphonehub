import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = (p: P): P => ({
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  ...p,
});

export const LogoPhone = (p: P) => (
  <svg {...base({ width: 26, height: 34, viewBox: "0 0 26 34", strokeWidth: 2.2, ...p })}>
    <rect x="2" y="2" width="22" height="30" rx="5" />
    <path d="M10 5.5h6" />
  </svg>
);

export const HomeIcon = (p: P) => (
  <svg {...base({ fill: "currentColor", stroke: "none", ...p })}>
    <path d="M12 3 2.5 11.2a1 1 0 0 0 .7 1.8H5v7a1 1 0 0 0 1 1h4v-5h4v5h4a1 1 0 0 0 1-1v-7h1.8a1 1 0 0 0 .7-1.8L12 3Z" />
  </svg>
);

export const BoxIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m12 2.8 8.2 4.4v9.6L12 21.2l-8.2-4.4V7.2L12 2.8Z" />
    <path d="m3.8 7.2 8.2 4.4 8.2-4.4M12 11.6v9.6" />
  </svg>
);

export const CartIcon2 = (p: P) => (
  <svg {...base(p)}>
    <path d="M2.5 3.5h3l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2" />
    <circle cx="9.8" cy="20" r="1.4" />
    <circle cx="17.2" cy="20" r="1.4" />
  </svg>
);

export const LogoutIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M9 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H9" />
    <path d="M16 8l4 4-4 4M20 12H9" />
  </svg>
);

export const BellIcon = (p: P) => (
  <svg {...base({ width: 24, height: 24, ...p })}>
    <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6.5 2 6.5H4S6 14 6 9Z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </svg>
);

export const PlusIcon = (p: P) => (
  <svg {...base({ width: 18, height: 18, strokeWidth: 2.4, ...p })}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const PencilIcon = (p: P) => (
  <svg {...base({ width: 17, height: 17, strokeWidth: 1.9, ...p })}>
    <path d="M4 20h4L19 9a2.1 2.1 0 0 0-4-4L4 16v4Z" />
    <path d="m13.5 6.5 4 4" />
  </svg>
);

export const TrashIcon = (p: P) => (
  <svg {...base({ width: 17, height: 17, strokeWidth: 1.9, ...p })}>
    <path d="M4 7h16M9 7V4.5h6V7M6.5 7l.8 12.5h9.4L17.5 7M10 11v5M14 11v5" />
  </svg>
);

export const UploadCloud = (p: P) => (
  <svg {...base({ width: 30, height: 30, strokeWidth: 1.8, ...p })}>
    <path d="M7 18a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 8.5a4.8 4.8 0 0 1-.5 9.5" />
    <path d="M12 21v-8m0 0-3 3m3-3 3 3" />
  </svg>
);

export const BoltIcon = (p: P) => (
  <svg {...base({ fill: "currentColor", stroke: "none", ...p })}>
    <path d="M13.5 2 5 13.5h6L10 22l9-12.5h-6L13.5 2Z" />
  </svg>
);

export const StoreIcon = (p: P) => (
  <svg {...base({ width: 26, height: 26, strokeWidth: 1.8, ...p })}>
    <path d="M3 9.5 4.5 4h15L21 9.5M3 9.5c0 1.4 1.1 2.5 2.5 2.5S8 10.9 8 9.5c0 1.4 1.1 2.5 2.5 2.5S13 10.9 13 9.5c0 1.4 1.1 2.5 2.5 2.5S18 10.9 18 9.5c0 1.4 1.1 2.5 2.5 2.5M5 12v8h14v-8M10 20v-4.5h4V20" />
  </svg>
);

export const ExternalIcon = (p: P) => (
  <svg {...base({ width: 18, height: 18, ...p })}>
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </svg>
);

export const UsersIcon = (p: P) => (
  <svg {...base({ fill: "currentColor", stroke: "none", ...p })}>
    <circle cx="9" cy="8" r="3.6" />
    <path d="M2.5 19.5c.4-3.6 3-5.6 6.5-5.6s6.1 2 6.5 5.6H2.5Z" />
    <circle cx="17.2" cy="9" r="2.8" opacity=".75" />
    <path d="M16.6 14.2c3 .1 4.7 1.8 5 4.6h-4.2c-.1-1.8-.4-3.3-.8-4.6Z" opacity=".75" />
  </svg>
);

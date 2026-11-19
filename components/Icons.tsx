import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = (p: IconProps): IconProps => ({
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

export const ShieldCheckSolid = (p: IconProps) => (
  <svg {...base({ fill: "currentColor", stroke: "none", ...p })}>
    <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Zm-1.2 14.2-3.5-3.5 1.4-1.4 2.1 2.1 4.9-4.9 1.4 1.4-6.3 6.3Z" />
  </svg>
);

export const TruckSolid = (p: IconProps) => (
  <svg {...base({ fill: "currentColor", stroke: "none", ...p })}>
    <path d="M2 6a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v2h3.2a1 1 0 0 1 .8.4l3 3.9a1 1 0 0 1 .2.6V17a1 1 0 0 1-1 1h-1.1a3 3 0 0 1-5.8 0H9.9a3 3 0 0 1-5.8 0H3a1 1 0 0 1-1-1V6Zm12 4v3h5.5L17.7 10H14ZM7 16a1.3 1.3 0 1 0 0 2.6A1.3 1.3 0 0 0 7 16Zm10 0a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6Z" />
  </svg>
);

export const HeadsetSolid = (p: IconProps) => (
  <svg {...base({ fill: "currentColor", stroke: "none", ...p })}>
    <path d="M12 2a9 9 0 0 0-9 9v5a3 3 0 0 0 3 3h1a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1H5v-1a7 7 0 0 1 14 0v1h-2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h.2c-.4 1-1.4 1.6-2.7 1.8l-1.5.2a1.5 1.5 0 1 0 .3 2l1.4-.2c2.6-.4 4.2-1.8 4.7-4A3 3 0 0 0 21 16v-5a9 9 0 0 0-9-9Z" />
  </svg>
);

export const SearchIcon = (p: IconProps) => (
  <svg {...base({ width: 24, height: 24, strokeWidth: 2.2, ...p })}>
    <circle cx="11" cy="11" r="7.2" />
    <path d="m20.5 20.5-4.4-4.4" />
  </svg>
);

export const UserIcon = (p: IconProps) => (
  <svg {...base({ width: 30, height: 30, strokeWidth: 1.9, ...p })}>
    <circle cx="12" cy="8" r="4.2" />
    <path d="M4 21c.6-4.2 3.7-6.4 8-6.4s7.4 2.2 8 6.4" />
  </svg>
);

export const CartIcon = (p: IconProps) => (
  <svg {...base({ width: 30, height: 30, strokeWidth: 1.9, ...p })}>
    <path d="M2.5 3.5h3l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2" />
    <circle cx="9.8" cy="20" r="1.4" />
    <circle cx="17.2" cy="20" r="1.4" />
  </svg>
);

export const CartSmall = (p: IconProps) => (
  <svg {...base({ width: 20, height: 20, strokeWidth: 2, ...p })}>
    <path d="M2.5 3.5h3l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2" />
    <circle cx="9.8" cy="20" r="1.4" />
    <circle cx="17.2" cy="20" r="1.4" />
  </svg>
);

export const ChevronDown = (p: IconProps) => (
  <svg {...base({ width: 16, height: 16, strokeWidth: 2.6, ...p })}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const ChevronUp = (p: IconProps) => (
  <svg {...base({ width: 16, height: 16, strokeWidth: 2.6, ...p })}>
    <path d="m6 15 6-6 6 6" />
  </svg>
);

export const ArrowRight = (p: IconProps) => (
  <svg {...base({ width: 20, height: 20, strokeWidth: 2.4, ...p })}>
    <path d="M4 12h16M14 6l6 6-6 6" />
  </svg>
);

export const WarrantyIcon = (p: IconProps) => (
  <svg {...base({ width: 34, height: 34, strokeWidth: 1.8, ...p })}>
    <path d="M12 2.8 4.5 5.8v5.6c0 4.7 3.1 8.6 7.5 10 4.4-1.4 7.5-5.3 7.5-10V5.8L12 2.8Z" />
    <path d="m8.6 12 2.5 2.5 4.4-4.8" />
  </svg>
);

export const RefurbIcon = (p: IconProps) => (
  <svg {...base({ width: 38, height: 38, strokeWidth: 2.2, ...p })}>
    <path d="M20.5 11A8.5 8.5 0 0 0 5.4 7.6L3.5 9.6" />
    <path d="M3.5 4.5v5.1h5.1" />
    <path d="M3.5 13a8.5 8.5 0 0 0 15.1 3.4l1.9-2" />
    <path d="M20.5 19.5v-5.1h-5.1" />
  </svg>
);

export const DeliveryIcon = (p: IconProps) => (
  <svg {...base({ width: 40, height: 40, strokeWidth: 1.7, ...p })}>
    <path d="M2.5 6.5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1V17h-12V6.5Z" />
    <path d="M14.5 9h3.6l3.4 3.8V17h-7" />
    <circle cx="7" cy="17.6" r="2" fill="#f4f3f0" />
    <circle cx="17.5" cy="17.6" r="2" fill="#f4f3f0" />
    <path d="M6 9.5h5M6 12.5h3" />
  </svg>
);

export const GridIcon = (p: IconProps) => (
  <svg {...base({ fill: "currentColor", stroke: "none", ...p })}>
    <rect x="3" y="3" width="8" height="8" rx="1.6" />
    <rect x="13" y="3" width="8" height="8" rx="1.6" />
    <rect x="3" y="13" width="8" height="8" rx="1.6" />
    <rect x="13" y="13" width="8" height="8" rx="1.6" />
  </svg>
);

export const ListIcon = (p: IconProps) => (
  <svg {...base({ strokeWidth: 2.2, ...p })}>
    <path d="M8.5 6.5H21M8.5 12H21M8.5 17.5H21" />
    <circle cx="3.8" cy="6.5" r="1" fill="currentColor" />
    <circle cx="3.8" cy="12" r="1" fill="currentColor" />
    <circle cx="3.8" cy="17.5" r="1" fill="currentColor" />
  </svg>
);

export const CloseIcon = (p: IconProps) => (
  <svg {...base({ width: 20, height: 20, strokeWidth: 2.4, ...p })}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const CheckCircle = (p: IconProps) => (
  <svg {...base({ width: 56, height: 56, strokeWidth: 2, ...p })}>
    <circle cx="12" cy="12" r="10" />
    <path d="m7.8 12.4 2.8 2.8 5.6-6" />
  </svg>
);

export const MenuIcon = (p: IconProps) => (
  <svg {...base({ width: 26, height: 26, strokeWidth: 2.2, ...p })}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

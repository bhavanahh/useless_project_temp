import type { SVGProps } from 'react';

// Representation of a Parippuvada (lentil fritter)
export function ParippuvadaIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <circle cx="12" cy="12" r="10" opacity="0.8" />
      <circle cx="10" cy="10" r="1" opacity="0.6" />
      <circle cx="15" cy="14" r="0.75" opacity="0.6" />
      <circle cx="14" cy="9" r="0.5" opacity="0.6" />
      <circle cx="11" cy="16" r="0.5" opacity="0.6" />
    </svg>
  );
}

// Representation of a Vazhaikkapam (banana fritter)
export function VazhaikkapamIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="32"
      height="24"
      viewBox="0 0 32 24"
      fill="currentColor"
      {...props}
    >
      <ellipse cx="16" cy="12" rx="15" ry="10" opacity="0.8" />
      <ellipse cx="16" cy="12" rx="10" ry="6" opacity="0.4" />
    </svg>
  );
}

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

// Representation of a Samoosa (triangular pastry)
export function SamoosaIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            {...props}
        >
            <path d="M2.35,21.65 21.65,2.35 12,21.65Z" opacity="0.8" />
            <path d="M4.5,19.5 19.5,4.5 12,19.5Z" opacity="0.4" />
        </svg>
    );
}

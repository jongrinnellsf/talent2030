/** Minimal transcript mark — geometric, no AI sparkle motif */
export function CoachMark({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect x="2" y="2" width="12" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.25" />
      <rect x="4.5" y="5" width="7" height="1" rx="0.5" fill="currentColor" opacity="0.9" />
      <rect x="4.5" y="7.25" width="5" height="1" rx="0.5" fill="currentColor" opacity="0.55" />
      <rect x="4.5" y="9.5" width="6" height="1" rx="0.5" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

export function BrandMark({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect width="16" height="16" rx="4" fill="currentColor" />
      <path
        d="M4.5 5.5h7M4.5 8h5M4.5 10.5h6"
        stroke="white"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

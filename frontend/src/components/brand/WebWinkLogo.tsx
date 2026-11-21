import React from 'react';

interface WebWinkLogoProps {
  variant?: 'horizontal' | 'stacked' | 'mark-only';
  className?: string;
  iconClassName?: string;
}

export const WebWinkLogo: React.FC<WebWinkLogoProps> = ({
  variant = 'horizontal',
  className = '',
  iconClassName = 'h-10 w-auto',
}) => {
  // Exact Isometric Hexagonal Cube Mark with Periwinkle (#B4B0F5), Ochre Gold (#E2C870),
  // Deep Charcoal (#18181B), and 4px Technical Ink Outlines (#111111) — NO BACKGROUND
  const CubeMark = (
    <svg
      viewBox="0 0 200 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${iconClassName} shrink-0 overflow-visible`}
      aria-label="WebWink Isometric Cube Mark"
    >
      {/* Top Left Outer Periwinkle Rim */}
      <polygon
        points="100,10 18,58 46,74 100,42 128,58 156,42"
        fill="#B4B0F5"
        stroke="#111111"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* Left Vertical Periwinkle Pillar */}
      <polygon
        points="18,58 18,154 100,202 100,170 46,138 46,74"
        fill="#B4B0F5"
        stroke="#111111"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* Inner Top Gold Step */}
      <polygon
        points="46,74 100,42 100,90 72,106 46,90"
        fill="#E2C870"
        stroke="#111111"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* Upper Right Periwinkle Face with Gold Wink Triangle */}
      <polygon
        points="100,42 182,90 128,122 72,90 100,74"
        fill="#B4B0F5"
        stroke="#111111"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* The "Wink" Inner Gold Triangle Cutout */}
      <polygon
        points="112,72 142,56 142,76"
        fill="#E2C870"
        stroke="#111111"
        strokeWidth="4.5"
        strokeLinejoin="round"
      />
      {/* Inner Left Charcoal Recess */}
      <polygon
        points="46,74 72,90 72,138 46,138"
        fill="#18181B"
        stroke="#111111"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* Center Gold Core L-Block */}
      <polygon
        points="72,90 100,106 100,170 46,138 72,122"
        fill="#E2C870"
        stroke="#111111"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* Right Gold Inner Facet */}
      <polygon
        points="100,106 154,74 154,138 100,170"
        fill="#E2C870"
        stroke="#111111"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* Right Outer Charcoal Shadow Wall */}
      <polygon
        points="182,58 182,154 100,202 100,170 154,138 154,74"
        fill="#18181B"
        stroke="#111111"
        strokeWidth="5"
        strokeLinejoin="round"
      />
    </svg>
  );

  if (variant === 'mark-only') return CubeMark;

  return (
    <div
      className={`inline-flex items-center gap-3 select-none bg-transparent ${
        variant === 'stacked' ? 'flex-col text-center' : 'flex-row'
      } ${className}`}
    >
      {CubeMark}
      <span className="font-black tracking-tighter text-xl md:text-2xl text-[var(--ink-primary)] leading-none">
        WebWink
      </span>
    </div>
  );
};

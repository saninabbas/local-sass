import React from 'react';

interface AnthropicLogoProps {
  className?: string;
  size?: number;
  color?: string;
  showWordmark?: boolean;
  wordmarkColor?: string;
  brandName?: string;
}

export const AnthropicLogo: React.FC<AnthropicLogoProps> = ({
  className = '',
  size = 20,
  color = '#141413',
  showWordmark = true,
  wordmarkColor = '#141413',
  brandName = 'Claude'
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Signature Anthropic 4-Spoke Radial Spike Mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:rotate-45"
      >
        <path
          d="M12 2L13.8 8.5L20.3 10.3L13.8 12L12 18.5L10.2 12L3.7 10.3L10.2 8.5L12 2Z"
          fill={color}
        />
        <path
          d="M18.5 5.5L16.2 9.2L19.9 11.5L16.2 13.8L18.5 17.5L14.8 15.2L12.5 18.9L10.2 15.2L6.5 17.5L8.8 13.8L5.1 11.5L8.8 9.2L6.5 5.5L10.2 7.8L12.5 4.1L14.8 7.8L18.5 5.5Z"
          fill={color}
          opacity="0.25"
        />
      </svg>

      {showWordmark && (
        <span
          className="font-serif tracking-tight font-normal text-[20px] leading-none"
          style={{ color: wordmarkColor }}
        >
          {brandName}
        </span>
      )}
    </div>
  );
};

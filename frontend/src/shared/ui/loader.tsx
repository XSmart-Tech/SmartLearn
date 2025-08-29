import React from "react";
import { useTranslation } from "react-i18next";

export type LoaderProps = {
  size?: number;
  color?: string;
  className?: string;
  label?: string;
  fullScreen?: boolean;
};

const Loader: React.FC<LoaderProps> = ({
  size = 120,
  color = "hsl(var(--primary))",
  className = "",
  label,
  fullScreen = false,
}) => {
  const { t } = useTranslation();
  const defaultLabel = label ?? t('common.loading');
  const rootClass = fullScreen
    ? `fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xl ${className}`
    : `flex items-center justify-center w-full h-full ${className}`;

  return (
    <div
      className={rootClass}
      role="status"
      aria-label={defaultLabel}
      style={{ color }}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Modern pulsing loader */}
        <div className="relative" style={{ width: size, height: size }}>
          {/* Outer ring */}
          <div
            className="absolute inset-0 rounded-full border-4 border-current opacity-20 animate-spin"
            style={{
              borderTopColor: 'transparent',
              animationDuration: '1.5s'
            }}
          />

          {/* Middle ring */}
          <div
            className="absolute inset-2 rounded-full border-4 border-current opacity-40 animate-spin"
            style={{
              borderTopColor: 'transparent',
              borderRightColor: 'transparent',
              animationDuration: '1s',
              animationDirection: 'reverse'
            }}
          />

          {/* Inner ring */}
          <div
            className="absolute inset-4 rounded-full border-4 border-current opacity-60 animate-spin"
            style={{
              borderTopColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: 'transparent',
              animationDuration: '0.8s'
            }}
          />

          {/* Center dot with pulse */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-3 h-3 rounded-full bg-current animate-pulse"
              style={{
                animationDuration: '1.2s'
              }}
            />
          </div>

          {/* Floating particles */}
          <div className="absolute inset-0">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-current opacity-60 animate-ping"
                style={{
                  top: `${20 + Math.sin(i * 60 * Math.PI / 180) * 35}%`,
                  left: `${20 + Math.cos(i * 60 * Math.PI / 180) * 35}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1.5s'
                }}
              />
            ))}
          </div>
        </div>

        {/* Loading text with gradient */}
        <div className="text-center">
          <p className="text-sm font-medium bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent animate-pulse">
            {defaultLabel}
          </p>
          <div className="flex justify-center gap-1 mt-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary animate-bounce"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;

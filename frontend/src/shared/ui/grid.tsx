import * as React from "react";
import { cn } from "@/shared/lib/utils";

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  columns?: number | string;
  gap?: number | string;
  autoFit?: boolean;
  autoFill?: boolean;
  minWidth?: string;
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({
    children,
    className,
    columns = 1,
    gap = 0,
    autoFit = false,
    autoFill = false,
    minWidth,
    style,
    ...props
  }, ref) => {
    const gridStyle = React.useMemo(() => {
      const baseStyle: React.CSSProperties = {
        display: 'grid',
        gap: typeof gap === 'number' ? `${gap}px` : gap,
        ...style,
      };

      if (autoFit && minWidth) {
        baseStyle.gridTemplateColumns = `repeat(auto-fit, minmax(${minWidth}, 1fr))`;
      } else if (autoFill && minWidth) {
        baseStyle.gridTemplateColumns = `repeat(auto-fill, minmax(${minWidth}, 1fr))`;
      } else if (typeof columns === 'number') {
        baseStyle.gridTemplateColumns = `repeat(${columns}, 1fr)`;
      } else {
        baseStyle.gridTemplateColumns = columns;
      }

      return baseStyle;
    }, [columns, gap, autoFit, autoFill, minWidth, style]);

    return (
      <div
        ref={ref}
        className={cn(className)}
        style={gridStyle}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = "Grid";

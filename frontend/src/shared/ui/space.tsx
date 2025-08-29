import * as React from "react";
import { cn } from "@/shared/lib/utils";

interface SpaceProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  direction?: "horizontal" | "vertical";
  size?: "small" | "middle" | "large" | number;
  align?: "start" | "center" | "end" | "baseline";
  wrap?: boolean;
  split?: React.ReactNode;
}

const directionClasses = {
  horizontal: "flex-row",
  vertical: "flex-col",
};

const alignClasses = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  baseline: "items-baseline",
};

const sizeMap = {
  small: 8,
  middle: 16,
  large: 24,
};

export const Space = React.forwardRef<HTMLDivElement, SpaceProps>(
  ({
    children,
    className,
    direction = "horizontal",
    size = "small",
    align,
    wrap = false,
    split,
    ...props
  }, ref) => {
    const sizeValue = typeof size === 'number' ? size : sizeMap[size];

    const childrenArray = React.Children.toArray(children).filter(Boolean);

    return (
      <div
        ref={ref}
        className={cn(
          "flex",
          directionClasses[direction],
          align && alignClasses[align],
          wrap && "flex-wrap",
          className
        )}
        {...props}
      >
        {childrenArray.map((child, index) => (
          <React.Fragment key={index}>
            <div
              style={{
                marginRight: direction === 'horizontal' && index < childrenArray.length - 1 ? sizeValue : 0,
                marginBottom: direction === 'vertical' && index < childrenArray.length - 1 ? sizeValue : 0,
              }}
            >
              {child}
            </div>
            {split && index < childrenArray.length - 1 && (
              <div
                style={{
                  marginRight: direction === 'horizontal' ? sizeValue : 0,
                  marginBottom: direction === 'vertical' ? sizeValue : 0,
                }}
              >
                {split}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }
);

Space.displayName = "Space";

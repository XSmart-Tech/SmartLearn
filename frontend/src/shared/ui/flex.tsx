import * as React from "react";
import { cn } from "@/shared/lib/utils";

interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  wrap?: "nowrap" | "wrap" | "wrap-reverse";
  gap?: number | string;
  inline?: boolean;
}

const directionClasses = {
  row: "flex-row",
  column: "flex-col",
  "row-reverse": "flex-row-reverse",
  "column-reverse": "flex-col-reverse",
};

const alignClasses = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
};

const justifyClasses = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
};

const wrapClasses = {
  nowrap: "flex-nowrap",
  wrap: "flex-wrap",
  "wrap-reverse": "flex-wrap-reverse",
};

export const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  ({
    children,
    className,
    direction = "row",
    align = "center",
    justify = "start",
    wrap = "nowrap",
    gap,
    inline = false,
    style,
    ...props
  }, ref) => {
    const gapStyle = React.useMemo(() => {
      if (gap) {
        return {
          gap: typeof gap === 'number' ? `${gap}px` : gap,
          ...style,
        };
      }
      return style;
    }, [gap, style]);

    return (
      <div
        ref={ref}
        className={cn(
          inline ? "inline-flex" : "flex",
          directionClasses[direction],
          alignClasses[align],
          justifyClasses[justify],
          wrapClasses[wrap],
          className
        )}
        style={gapStyle}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Flex.displayName = "Flex";

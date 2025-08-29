import * as React from "react";
import { cn } from "@/shared/lib/utils";

interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  gutter?: number | [number, number]; // [horizontal, vertical] or single value
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  wrap?: boolean;
}

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

export const Row = React.forwardRef<HTMLDivElement, RowProps>(
  ({
    children,
    className,
    gutter = 0,
    align = "center",
    justify = "start",
    wrap = true,
    style,
    ...props
  }, ref) => {
    const gutterStyle = React.useMemo(() => {
      if (Array.isArray(gutter)) {
        const [horizontal, vertical] = gutter;
        return {
          marginLeft: -horizontal / 2,
          marginRight: -horizontal / 2,
          marginTop: -vertical / 2,
          marginBottom: -vertical / 2,
          ...style,
        };
      }
      return {
        marginLeft: -gutter / 2,
        marginRight: -gutter / 2,
        ...style,
      };
    }, [gutter, style]);

    const getChildStyle = React.useCallback(() => {
      if (Array.isArray(gutter)) {
        const [horizontal, vertical] = gutter;
        return {
          paddingLeft: horizontal / 2,
          paddingRight: horizontal / 2,
          paddingTop: vertical / 2,
          paddingBottom: vertical / 2,
        };
      }
      return {
        paddingLeft: gutter / 2,
        paddingRight: gutter / 2,
      };
    }, [gutter]);

    return (
      <div
        ref={ref}
        className={cn(
          "flex w-full",
          alignClasses[align],
          justifyClasses[justify],
          wrap ? "flex-wrap" : "flex-nowrap",
          className
        )}
        style={gutterStyle}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            const childStyle = getChildStyle();
            const existingStyle = (child.props as React.HTMLAttributes<HTMLElement>).style || {};
            return React.cloneElement(child, {
              style: {
                ...childStyle,
                ...existingStyle,
              },
            } as React.HTMLAttributes<HTMLElement>);
          }
          return child;
        })}
      </div>
    );
  }
);

Row.displayName = "Row";

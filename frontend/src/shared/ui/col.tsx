import * as React from "react";
import { cn } from "@/shared/lib/utils";

interface ColProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  span?: number; // 1-24 for 24-column grid
  offset?: number; // offset columns
  xs?: number | { span?: number; offset?: number };
  sm?: number | { span?: number; offset?: number };
  md?: number | { span?: number; offset?: number };
  lg?: number | { span?: number; offset?: number };
  xl?: number | { span?: number; offset?: number };
  xxl?: number | { span?: number; offset?: number };
}

const getColClasses = (props: Omit<ColProps, 'children' | keyof React.HTMLAttributes<HTMLDivElement>>) => {
  const classes: string[] = [];

  // Default span
  if (props.span) {
    classes.push(`col-span-${props.span}`);
  }

  // Offset
  if (props.offset) {
    classes.push(`col-start-${props.offset + 1}`);
  }

  // Responsive breakpoints
  const breakpoints = [
    { key: 'xs' as const, prefix: 'col' },
    { key: 'sm' as const, prefix: 'sm:col' },
    { key: 'md' as const, prefix: 'md:col' },
    { key: 'lg' as const, prefix: 'lg:col' },
    { key: 'xl' as const, prefix: 'xl:col' },
    { key: 'xxl' as const, prefix: '2xl:col' },
  ];

  breakpoints.forEach(({ key, prefix }) => {
    const value = props[key];
    if (value) {
      if (typeof value === 'number') {
        classes.push(`${prefix}-span-${value}`);
      } else if (typeof value === 'object' && value !== null) {
        if (value.span) {
          classes.push(`${prefix}-span-${value.span}`);
        }
        if (value.offset) {
          classes.push(`${prefix}-start-${value.offset + 1}`);
        }
      }
    }
  });

  return classes;
};

export const Col = React.forwardRef<HTMLDivElement, ColProps>(
  ({ children, className, span, offset, xs, sm, md, lg, xl, xxl, ...props }, ref) => {
    const colClasses = getColClasses({
      span,
      offset,
      xs,
      sm,
      md,
      lg,
      xl,
      xxl
    });

    return (
      <div
        ref={ref}
        className={cn(colClasses, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Col.displayName = "Col";

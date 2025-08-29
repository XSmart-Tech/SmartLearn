import * as React from "react";
import { cn } from "@/shared/lib/utils";

interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  as?: React.ElementType;
  padding?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  margin?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  background?: "none" | "muted" | "card" | "popover";
  border?: boolean;
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "full";
  shadow?: "none" | "sm" | "md" | "lg" | "xl";
}

const paddingClasses = {
  none: "",
  xs: "p-1",
  sm: "p-2",
  md: "p-4",
  lg: "p-6",
  xl: "p-8",
};

const marginClasses = {
  none: "",
  xs: "m-1",
  sm: "m-2",
  md: "m-4",
  lg: "m-6",
  xl: "m-8",
};

const backgroundClasses = {
  none: "",
  muted: "bg-muted",
  card: "bg-card",
  popover: "bg-popover",
};

const roundedClasses = {
  none: "",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
};

const shadowClasses = {
  none: "",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
};

export const Box = React.forwardRef<HTMLElement, BoxProps>(
  ({
    children,
    className,
    as: Component = "div",
    padding = "none",
    margin = "none",
    background = "none",
    border = false,
    rounded = "none",
    shadow = "none",
    ...props
  }, ref) => {
    const ComponentElement = Component as React.ElementType;

    return (
      <ComponentElement
        ref={ref}
        className={cn(
          paddingClasses[padding],
          marginClasses[margin],
          backgroundClasses[background],
          border && "border",
          roundedClasses[rounded],
          shadowClasses[shadow],
          className
        )}
        {...props}
      >
        {children}
      </ComponentElement>
    );
  }
);

Box.displayName = "Box";

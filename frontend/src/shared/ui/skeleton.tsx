import { cn } from "@/shared/lib/utils"

type SkeletonProps = React.ComponentProps<"div"> & {
  rounded?: "sm" | "md" | "lg" | "xl" | "full"
  shimmer?: boolean
}

export function Skeleton({
  className,
  rounded = "md",
  shimmer = true,
  ...props
}: SkeletonProps) {
  const roundedMap = {
    sm: "rounded",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
  } as const

  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-accent",
        shimmer && "animate-pulse",
        roundedMap[rounded],
        className
      )}
      {...props}
    />
  )
}

/** Tiện ích nhanh: thanh dài, chấm tròn */
export function SkeletonLine({ className }: { className?: string }) {
  return <Skeleton className={cn("h-4 w-full", className)} />
}
export function SkeletonCircle({ size = 40 }: { size?: number }) {
  return <Skeleton rounded="full" className="shrink-0" style={{ width: size, height: size }} />
}

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import type { ToasterProps } from "sonner"
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground hover:group-[.toast]:bg-muted/80",
        },
        style: {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "hsl(142.1 76.2% 36.3%)",
          "--success-border": "hsl(143.8 61.2% 20.2%)",
          "--success-text": "hsl(355.7 100% 97.3%)",
          "--error-bg": "hsl(0 84.2% 60.2%)",
          "--error-border": "hsl(0 62.8% 30.6%)",
          "--error-text": "hsl(210 40% 98%)",
          "--warning-bg": "hsl(38 92% 50%)",
          "--warning-border": "hsl(32 81% 29%)",
          "--warning-text": "hsl(48 96% 89%)",
          "--info-bg": "hsl(199 89% 48%)",
          "--info-border": "hsl(199 89% 30%)",
          "--info-text": "hsl(210 40% 98%)",
          "--loading-bg": "hsl(215 25% 27%)",
          "--loading-border": "hsl(215 25% 20%)",
          "--loading-text": "hsl(210 40% 98%)",
        } as React.CSSProperties,
      }}
      icons={{
        success: <CheckCircle className="h-4 w-4" />,
        error: <XCircle className="h-4 w-4" />,
        warning: <AlertCircle className="h-4 w-4" />,
        info: <Info className="h-4 w-4" />,
        close: <X className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}

export { Toaster }

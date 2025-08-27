import {
  AudioWaveform,
  BookOpen,
  Command,
  Frame,
  GalleryVerticalEnd,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

export const navMain = [
  {
    title: "Dashboard",
    url: "/app",
    icon: SquareTerminal,
    items: [],
  },
  {
    title: "Libraries",
    url: "/app/libraries",
    matchPrefix: true,
    icon: BookOpen,
    items: [],
  },
  // Study and Quiz are intentionally removed from the global sidebar; they are reachable
  // from a library detail page instead.
  {
    title: "Settings",
  url: "/app/settings",
    icon: Settings2,
    items: [],
  },
]

export const projects = [
  { name: "Design Engineering", url: "/app", icon: Frame },
  { name: "Sales & Marketing", url: "/app/libraries", icon: PieChart },
  // project shortcuts to Study/Quiz removed
]

export const teams = [
  {
    name: "Acme Inc",
    logo: GalleryVerticalEnd,
    plan: "Enterprise",
  },
  {
    name: "Acme Corp.",
    logo: AudioWaveform,
    plan: "Startup",
  },
  {
    name: "Evil Corp.",
    logo: Command,
    plan: "Free",
  },
]

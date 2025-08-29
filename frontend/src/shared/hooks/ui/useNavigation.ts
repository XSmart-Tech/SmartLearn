import { useTranslation } from 'react-i18next';
import {
  AudioWaveform,
  BookOpen,
  Command,
  Frame,
  GalleryVerticalEnd,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";

export function useNavigation() {
  const { t } = useTranslation();

  const navMain = [
    {
      title: t('navigation.dashboard'),
      url: "/app",
      icon: SquareTerminal,
      items: [],
    },
    {
      title: t('navigation.libraries'),
      url: "/app/libraries",
      matchPrefix: true,
      icon: BookOpen,
      items: [],
    },
    {
      title: t('navigation.settings'),
      url: "/app/settings",
      icon: Settings2,
      items: [],
    },
  ];

  const projects = [
    { name: "Design Engineering", url: "/app", icon: Frame },
    { name: "Sales & Marketing", url: "/app/libraries", icon: PieChart },
  ];

  const teams = [
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
  ];

  return {
    navMain,
    projects,
    teams,
  };
}

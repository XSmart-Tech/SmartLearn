import * as React from "react"

import { NavMain, NavUser, TeamSwitcher } from "@/shared/components"
import { useNavigation } from "@/shared/hooks"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/shared/ui"
import { useAuth } from "@/features/auth/hooks/useAuth"


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const { navMain, teams } = useNavigation();
  const userData = {
    uid: user?.uid ?? "",
    displayName: user?.displayName ?? "User",
    email: user?.email ?? "user@example.com",
    photoURL: user?.photoURL ?? null,
  }

  return (
    <Sidebar
      collapsible="icon"
      className="border-r-0 shadow-2xl bg-gradient-to-b from-card via-card to-card/95 backdrop-blur-xl supports-[backdrop-filter]:bg-card/90"
      {...props}
    >
      <SidebarHeader className="px-3 py-4 border-b border-border/50">
        <div className="animate-in fade-in-0 slide-in-from-left-4 duration-500">
          <TeamSwitcher teams={teams} />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <div className="animate-in fade-in-0 slide-in-from-left-4 duration-500 delay-100">
          <NavMain items={navMain} />
        </div>
      </SidebarContent>

      <SidebarFooter className="px-3 py-3 border-t border-border/50">
        <div className="animate-in fade-in-0 slide-in-from-left-4 duration-500 delay-200">
          <NavUser user={userData} />
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

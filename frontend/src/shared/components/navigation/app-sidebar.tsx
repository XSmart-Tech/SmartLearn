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
      className="border-r-0 shadow-2xl"
      {...props}
    >
      <SidebarHeader className="px-4 py-6">
        <TeamSwitcher teams={teams} />
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <NavMain items={navMain} />
      </SidebarContent>

      <SidebarFooter className="px-4 py-4">
        <NavUser user={userData} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

import * as React from "react"

import { NavMain } from "@/shared/components/nav-main"
import { NavUser } from "@/shared/components/nav-user"
import { TeamSwitcher } from "@/shared/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/shared/ui"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { navMain, teams } from "@/shared/lib/nav"


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const userData = {
    uid: user?.uid ?? "",
    displayName: user?.displayName ?? "User",
    email: user?.email ?? "user@example.com",
    photoURL: user?.photoURL ?? null,
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="px-3 py-4">
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent className="space-y-2 px-2 py-3">
        <NavMain items={navMain} />
        {/* <NavProjects projects={navProjects} /> */}
      </SidebarContent>
      <SidebarFooter className="px-3 py-3">
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

"use client"

import { type LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui"
import { Link, useLocation } from "react-router-dom"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
  isActive?: boolean
  matchPrefix?: boolean
  items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const location = useLocation()

  const normalizePath = (p: string) => {
    if (!p) return p
    // Remove trailing slash except for root
    return p.endsWith("/") && p !== "/" ? p.slice(0, -1) : p
  }

  const currentPath = normalizePath(location.pathname)

  const isPathExact = (url?: string) => {
    if (!url) return false
    return currentPath === normalizePath(url)
  }

  const isPathPrefix = (url?: string) => {
    if (!url) return false
    const u = normalizePath(url)
    return currentPath === u || (u !== "/" && currentPath.startsWith(u + "/"))
  }

  // (removed prefix matching helper; parent activation now only relies on exact matches or child exact matches)

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            {/* If the item has a url, render the button as a Link so clicks navigate */}
            {(() => {
              const anyChildActive =
                item.items && item.items.some((si) => isPathExact(si.url))
              // Parent is active when exact match, or any child exact match, or when
              // the nav item requests prefix matching (e.g. Libraries should be active
              // on /app/libraries/:id)
              const active =
                isPathExact(item.url) ||
                !!anyChildActive ||
                item.matchPrefix === true && isPathPrefix(item.url)

              if (item.url) {
                return (
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={active}
                  >
                    <Link to={item.url} className="flex items-center gap-2">
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )
              }

              return (
                <SidebarMenuButton tooltip={item.title} isActive={active}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              )
            })()}

            {item.items && item.items.length > 0 && (
              <SidebarMenuSub>
                {item.items.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton asChild isActive={isPathExact(subItem.url)}>
                      <Link to={subItem.url} className="block">
                        <span>{subItem.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/ui"
import { Button } from '@/shared/ui'
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSelector } from 'react-redux'
import type { RootState } from '@/shared/store'
import { useEffect } from 'react'
import { fetchNotifications } from '@/shared/store/notificationsSlice'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/shared/store'
import NotificationsDialog from './NotificationsDialog'
import { useRealtimeNotifications } from '@/shared/hooks/useRealtime'

export function NavUser({ user }: { user: { uid: string; displayName: string; email: string; photoURL: string | null } | null }) {
  const { signInGoogle, signOutApp } = useAuth();
  const { isMobile } = useSidebar()
  const dispatch = useDispatch<AppDispatch>()
  const notifications = useSelector((state: RootState) => state.notifications.items)
  const pendingCount = notifications.filter(n => n.status === 'pending' && n.recipientId === user?.uid).length

  console.log('[DEBUG] NavUser - User UID:', user?.uid)
  console.log('[DEBUG] NavUser - All notifications:', notifications.length, notifications.map(n => ({ id: n.id, recipientId: n.recipientId, senderId: n.senderId, status: n.status })))
  console.log('[DEBUG] NavUser - Pending count:', pendingCount)

  // Use real-time notifications instead of one-time fetch
  useRealtimeNotifications(user?.uid || null)

  useEffect(() => {
    if (user) {
      // Initial fetch as fallback, real-time will handle updates
      dispatch(fetchNotifications(user.uid))
    }
  }, [user, dispatch])

  if (!user) {
    return (
  <Button onClick={signInGoogle}>Đăng nhập</Button>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.displayName}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.displayName}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NotificationsDialog
                  trigger={
                    <div className="flex items-center w-full">
                      <Bell />
                      Notifications
                      {pendingCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                          {pendingCount}
                        </span>
                      )}
                    </div>
                  }
                />
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOutApp}>
              <LogOut />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

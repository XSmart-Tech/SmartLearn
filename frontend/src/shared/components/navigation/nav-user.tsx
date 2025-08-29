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
import { NotificationsDialog } from '@/shared/components/dialogs'
import { useRealtimeNotifications } from '@/shared/hooks'
import { useTranslation } from 'react-i18next'

export function NavUser({ user }: { user: { uid: string; displayName: string; email: string; photoURL: string | null } | null }) {
  const { signInGoogle, signOutApp } = useAuth();
  const { isMobile } = useSidebar()
  const dispatch = useDispatch<AppDispatch>()
  const notifications = useSelector((state: RootState) => state.notifications.items)
  const pendingCount = notifications.filter(n => n.status === 'pending' && n.recipientId === user?.uid).length
  const { t } = useTranslation()

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
  <Button onClick={signInGoogle}>{t('navigation.login')}</Button>
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
              <div className="grid flex-1 text-left text-sm leading-tight ml-3">
                <span className="truncate font-medium">{user.displayName}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />

              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
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
                <Sparkles className="h-4 w-4" />
                {t('navigation.upgradeToPro')}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck className="h-4 w-4" />
                {t('navigation.account')}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="h-4 w-4" />
                {t('navigation.billing')}
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NotificationsDialog
                  trigger={
                    <div className="flex items-center w-full hover:bg-accent hover:text-accent-foreground cursor-pointer px-2 py-1.5 rounded-md">
                      <Bell className="h-4 w-4" />
                      <span className="ml-2 text-sm">{t('navigation.notifications')}</span>
                      {pendingCount > 0 && (
                        <span className="ml-auto bg-destructive text-destructive-foreground text-xs rounded-full px-2 py-1">
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
              <LogOut className="h-4 w-4" />
              {t('navigation.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

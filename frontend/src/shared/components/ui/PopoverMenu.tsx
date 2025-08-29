import React from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui'
import { Button } from '@/shared/ui'
import { MoreHorizontal } from 'lucide-react'
import { Separator } from '@/shared/ui'

interface PopoverMenuProps {
  children: React.ReactNode
  trigger?: React.ReactNode
}

export function PopoverMenu({ children, trigger }: PopoverMenuProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
            <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline ml-1">Thao tác</span>
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end">
        <div className="space-y-1">
          {children}
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface PopoverMenuItemProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'default' | 'destructive'
}

export function PopoverMenuItem({ children, onClick, disabled, variant = 'default' }: PopoverMenuItemProps) {
  return (
    <Button
      variant={variant === 'destructive' ? 'destructive' : 'ghost'}
      size="sm"
      className="w-full justify-start h-8 px-2 text-xs"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  )
}

export function PopoverMenuSeparator() {
  return <Separator className="my-1" />
}

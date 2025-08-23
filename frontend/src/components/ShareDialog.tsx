import { useState } from 'react'
import { Dialog, Button, H3, Small } from '@/components/ui'
import UserAutocomplete from './UserAutocomplete'
import type { PublicUser } from '@/lib/types'

export default function ShareDialog({ open, onClose, onShare }: { open: boolean; onClose: () => void; onShare?: (uid: string) => void }) {
  const [target, setTarget] = useState<PublicUser | null>(null)
  const canSave = !!target
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <H3 className="mb-2">Chia sẻ thư viện</H3>
      <div className="space-y-3">
        <UserAutocomplete onSelect={(u) => setTarget(u)} />
        {target && (
          <Small className="text-sm text-gray-600">Chọn: <b>{target.displayName || target.email}</b> ({target.email})</Small>
        )}
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Hủy</Button>
          <Button disabled={!canSave} onClick={() => { if (target && onShare) onShare(target.uid); onClose() }} className="bg-gray-900 text-white disabled:opacity-50">Lưu</Button>
        </div>
      </div>
    </Dialog>
  )
}
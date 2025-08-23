import { useState } from 'react'
import { Dialog } from './ui/dialog'
import { Button } from './ui/button'
import UserAutocomplete from './UserAutocomplete'
import type { PublicUser } from '@/lib/types'

export default function ShareDialog({ open, onClose, onSetRole }: { open: boolean; onClose: () => void; onSetRole?: (uid: string, role: 'viewer') => void }) {
  const [target, setTarget] = useState<PublicUser | null>(null)
  const role = 'viewer' as const
  const canSave = !!target
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <h3 className="text-lg font-semibold mb-2">Chia sẻ thư viện</h3>
      <div className="space-y-3">
        <UserAutocomplete onSelect={(u) => setTarget(u)} />
        {target && (
          <div className="text-sm text-gray-600">Chọn: <b>{target.displayName || target.email}</b> ({target.email})</div>
        )}
        <div className="flex gap-2">
          <Button className={'bg-gray-900 text-white'}>Viewer</Button>
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Hủy</Button>
          <Button disabled={!canSave} onClick={() => { if (target && onSetRole) onSetRole(target.uid, role); onClose() }} className="bg-gray-900 text-white disabled:opacity-50">Lưu</Button>
        </div>
      </div>
    </Dialog>
  )
}
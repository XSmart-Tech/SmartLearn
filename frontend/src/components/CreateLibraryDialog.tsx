import { useCallback, useState } from 'react'
import { Button, Input } from '@/components/ui'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'

export default function CreateLibraryDialog({
  onCreate,
  disabled,
}: {
  onCreate: (name: string) => Promise<void> | void
  disabled?: boolean
}) {
  const [name, setName] = useState('')
  const handleCreate = useCallback(async () => {
    const n = name.trim()
    if (!n) return
    await onCreate(n)
    setName('')
  }, [name, onCreate])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={disabled}>Tạo thư viện</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo thư viện mới</DialogTitle>
          <DialogDescription>Nhập tên thư viện và mô tả (tùy chọn).</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Tên thư viện"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Hủy</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={handleCreate}>Tạo</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

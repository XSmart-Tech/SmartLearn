import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/store'
import type { Flashcard } from '@/lib/types'
import { fetchCards, createCard, removeCard, updateCard } from '@/store/cardsSlice'
import { fetchLibraryById } from '@/store/librariesSlice'
import ShareDialog from '@/components/ShareDialog'
import ShareList from '@/components/ShareList'
import ImportExport from '@/components/ImportExport'
import { Button, Input, Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter, DialogClose } from '@/components/ui'
import { useParams, useSearchParams } from 'react-router-dom'

export default function LibraryDetailPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const realtime = params.get('realtime') === '1'

  const dispatch = useDispatch<AppDispatch>()
  const lib = useSelector((s: RootState) => (id ? s.libraries.items[id] : undefined))
  const cards = useSelector((s: RootState) => (id ? (s.cards.byLib[id] ?? []) : []))
  const user = useSelector((s: RootState) => s.auth.user)

  const isOwner = Boolean(lib && user && lib.ownerId === user.uid)

  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [shareOpen, setShareOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => { if (id) dispatch(fetchCards(id)) }, [dispatch, id])
  useEffect(() => { if (id && !lib) dispatch(fetchLibraryById(id)) }, [dispatch, id, lib])

  const openAdd = () => {
    setFront('')
    setBack('')
    setEditingId(null)
    setDialogMode('add')
  }

  const openEdit = (c: Flashcard) => {
    setFront(c.front)
    setBack(c.back)
    setEditingId(c.id)
    setDialogMode('edit')
  }

  const closeDialog = () => {
    setDialogMode(null)
    setEditingId(null)
    setFront('')
    setBack('')
  }

  const onSubmitDialog = () => {
    if (!id) return
    if (dialogMode === 'add') {
      const cardPayload: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'> = { front, back, libraryId: id }
      dispatch(createCard({ libraryId: id, card: cardPayload }))
    } else if (dialogMode === 'edit' && editingId) {
      dispatch(updateCard({ id: editingId, patch: { front, back } }))
    }
    closeDialog()
  }

  if (!id) return null

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{lib?.name ?? 'Thư viện'}</h2>
        <div className="flex gap-2">
          {isOwner && <Button onClick={() => setShareOpen(true)}>Chia sẻ</Button>}
          {isOwner && (
            <ImportExport cards={cards} onImport={(list) => {
              for (const c of list) {
                const cardPayload: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'> = { front: c.front, back: c.back, hint: c.hint, tags: c.tags, libraryId: id }
                dispatch(createCard({ libraryId: id, card: cardPayload }))
              }
            }} />
          )}
        </div>
      </div>

      {lib && (
        <ShareList ownerId={lib.ownerId} share={lib.share} realtime={realtime} />
      )}

      {isOwner ? (
        <div className="flex gap-2">
          <Button onClick={openAdd}>Thêm</Button>
        </div>
      ) : (
        <div className="text-sm text-gray-500">Bạn không có quyền chỉnh sửa thư viện này.</div>
      )}

      <ul className="space-y-2">
        {cards.map((c) => (
          <li key={c.id} className="flex items-center gap-2 rounded-xl border p-3">
            <div className="flex-1"><b>{c.front}</b> — {c.back}</div>
            {isOwner && (
              <>
                <Button onClick={() => openEdit(c)}>Sửa</Button>
                <Button onClick={() => dispatch(removeCard(c.id))}>Xóa</Button>
              </>
            )}
          </li>
        ))}
      </ul>

      <Dialog open={dialogMode !== null} onOpenChange={(open) => { if (!open) closeDialog() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === 'edit' ? 'Sửa thẻ' : 'Thêm thẻ'}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-2">
            <Input placeholder="Mặt trước" value={front} onChange={(e) => setFront(e.target.value)} />
            <Input placeholder="Mặt sau" value={back} onChange={(e) => setBack(e.target.value)} />
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={closeDialog}>Hủy</Button>
            <Button onClick={onSubmitDialog}>{dialogMode === 'edit' ? 'Lưu' : 'Thêm'}</Button>
          </DialogFooter>
          <DialogClose />
        </DialogContent>
      </Dialog>

      <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} />

      <p className="text-xs text-gray-500">Realtime: {String(realtime)} (bật bằng ?realtime=1)</p>
    </section>
  )
}
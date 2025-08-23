import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/store'
import type { Flashcard } from '@/lib/types'
import { fetchCards, createCard, removeCard, updateCard } from '@/store/cardsSlice'
import { fetchLibraryById, setShareRole } from '@/store/librariesSlice'
import ShareDialog from '@/components/ShareDialog'
import ShareList from '@/components/ShareList'
import ImportExport from '@/components/ImportExport'
import { Button, Input, Dialog, DialogContent, DialogDescription, DialogTitle, DialogHeader, DialogFooter, DialogClose, H2, P, Small, Large } from '@/components/ui'
import { useParams, useSearchParams } from 'react-router-dom'

export default function LibraryDetailPage() {
  const EMPTY_CARDS: Flashcard[] = []
  const { id } = useParams()
  const [params] = useSearchParams()
  const realtime = params.get('realtime') === '1'

  const dispatch = useDispatch<AppDispatch>()
  const lib = useSelector((s: RootState) => (id ? s.libraries.items[id] : undefined))
  const cards = useSelector((s: RootState) => (id ? (s.cards.byLib[id] ?? EMPTY_CARDS) : EMPTY_CARDS))
  const user = useSelector((s: RootState) => s.auth.user)

  const isOwner = Boolean(lib && user && lib.ownerId === user.uid)

  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [hint, setHint] = useState('')
  const [tagsText, setTagsText] = useState('')
  const [query, setQuery] = useState('')
  const [shareOpen, setShareOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => { if (id) dispatch(fetchCards(id)) }, [dispatch, id])
  useEffect(() => { if (id && !lib) dispatch(fetchLibraryById(id)) }, [dispatch, id, lib])

  const openAdd = () => {
    setFront('')
    setBack('')
    setEditingId(null)
    setHint('')
    setTagsText('')
    setDialogMode('add')
  }

  const openEdit = (c: Flashcard) => {
    setFront(c.front)
    setBack(c.back)
    setEditingId(c.id)
    setHint(c.hint ?? '')
    setTagsText((c.tags ?? []).join(', '))
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
    const tags = tagsText.split(',').map(t => t.trim()).filter(Boolean)
    if (dialogMode === 'add') {
      const cardPayload: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'> = { front, back, hint: hint || undefined, tags: tags.length ? tags : undefined, libraryId: id }
      dispatch(createCard({ libraryId: id, card: cardPayload }))
    } else if (dialogMode === 'edit' && editingId) {
      dispatch(updateCard({ id: editingId, patch: { front, back, hint: hint || undefined, tags: tags.length ? tags : undefined } }))
    }
    closeDialog()
  }

  const onRequestDelete = (cardId: string) => {
    setDeleteId(cardId)
    setConfirmOpen(true)
  }

  const confirmDelete = () => {
    if (deleteId) dispatch(removeCard(deleteId))
    setDeleteId(null)
    setConfirmOpen(false)
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return cards
    return cards.filter(c => {
      const t = `${c.front} ${c.back} ${c.hint ?? ''} ${(c.tags ?? []).join(' ')}`.toLowerCase()
      return t.includes(q)
    })
  }, [cards, query])

  if (!id) return null

  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <H2 className="mb-1">{lib?.name ?? 'Thư viện'}</H2>
          <Small className="text-gray-500">{cards.length} thẻ • Realtime: {String(realtime)}</Small>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
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
            {isOwner && <Button onClick={openAdd}>Thêm thẻ</Button>}
          </div>
        </div>
      </div>

      {lib && (
        <ShareList ownerId={lib.ownerId} share={lib.share} realtime={realtime} />
      )}

      <div className="flex items-center gap-2">
        <Input placeholder="Tìm kiếm thẻ (mặt trước/sau, hint, tag)" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {!isOwner && <Small>Bạn không có quyền chỉnh sửa thư viện này.</Small>}

      {filtered.length === 0 ? (
        <div className="rounded-xl border-dashed border p-6 text-center text-gray-600">
          <P>Không tìm thấy thẻ nào.</P>
          {isOwner && <Button className="mt-3" onClick={openAdd}>Tạo thẻ đầu tiên</Button>}
        </div>
      ) : (
        <ul className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <li key={c.id} className="rounded-xl border p-4 shadow-sm bg-white">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <Large className="break-words">{c.front}</Large>
                  <P className="mt-2 text-sm text-gray-700">{c.back}</P>
                  {c.hint && <Small className="mt-2 text-gray-500">Gợi ý: {c.hint}</Small>}
                  {(c.tags ?? []).length > 0 && <div className="mt-2 text-xs text-gray-500">{(c.tags ?? []).map(t => `#${t}`).join(' ')}</div>}
                </div>
                {isOwner && (
                  <div className="flex flex-col gap-2 ml-3">
                    <Button variant="secondary" onClick={() => openEdit(c)}>Sửa</Button>
                    <Button variant="destructive" onClick={() => onRequestDelete(c.id)}>Xóa</Button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={dialogMode !== null} onOpenChange={(open) => { if (!open) closeDialog() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === 'edit' ? 'Sửa thẻ' : 'Thêm thẻ'}</DialogTitle>
            <DialogDescription className="sr-only">{dialogMode === 'edit' ? 'Form to edit a flashcard' : 'Form to add a new flashcard'}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Input placeholder="Mặt trước" value={front} onChange={(e) => setFront(e.target.value)} />
            <Input placeholder="Mặt sau" value={back} onChange={(e) => setBack(e.target.value)} />
            <Input placeholder="Gợi ý (hint)" value={hint} onChange={(e) => setHint(e.target.value)} />
            <Input placeholder="Tags (phân tách bằng dấu phẩy)" value={tagsText} onChange={(e) => setTagsText(e.target.value)} />
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={closeDialog}>Hủy</Button>
            <Button onClick={onSubmitDialog}>{dialogMode === 'edit' ? 'Lưu' : 'Thêm'}</Button>
          </DialogFooter>
          <DialogClose />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={confirmOpen} onOpenChange={(open) => { if (!open) setConfirmOpen(false) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>Bạn có chắc muốn xóa thẻ này? Hành động này không thể hoàn tác.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>Hủy</Button>
            <Button variant="destructive" onClick={confirmDelete}>Xóa</Button>
          </DialogFooter>
          <DialogClose />
        </DialogContent>
      </Dialog>

  <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} onShare={(uid) => { if (id) dispatch(setShareRole({ id, uid })) }} />

  <Small className="text-xs text-gray-500">Realtime: {String(realtime)} (bật bằng ?realtime=1)</Small>
    </section>
  )
}
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/store'
import type { Flashcard } from '@/lib/types'
import { fetchCards, createCard, removeCard, updateCard } from '@/store/cardsSlice'
import { fetchLibraryById } from '@/store/librariesSlice'
import ShareManager from '@/components/ShareManager'
import ImportExport from '@/components/ImportExport'
import {
  Button, Input, Dialog, DialogContent, DialogDescription, DialogTitle,
  DialogHeader, DialogFooter, DialogClose, H2, P, Small, Large,
  SkeletonLine,
  Skeleton, Textarea
} from '@/components/ui'
import { useParams, useNavigate } from 'react-router-dom'
import FlipDeck from '@/components/FlipDeck'
import { Share2, Plus, X, Search, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { addRecentLibrary } from '@/lib/recent'

export default function LibraryDetailPage() {
  const EMPTY_CARDS: Flashcard[] = []
  const { id } = useParams()

  const dispatch = useDispatch<AppDispatch>()
  const lib = useSelector((s: RootState) => (id ? s.libraries.items[id] : undefined))
  const cards = useSelector((s: RootState) => (id ? (s.cards.byLib[id] ?? EMPTY_CARDS) : EMPTY_CARDS))
  const cardsStatus = useSelector((s: RootState) => (id ? (s.cards.byLibStatus[id] ?? 'idle') : 'idle'))
  const cardsError = useSelector((s: RootState) => (id ? (s.cards.byLibError[id] ?? null) : null))
  const user = useSelector((s: RootState) => s.auth.user)

  const isOwner = Boolean(lib && user && lib.ownerId === user.uid)

  const navigate = useNavigate()

  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [description, setDescription] = useState('')
  const [query, setQuery] = useState('')
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Load thẻ cho thư viện hiện tại
  useEffect(() => {
    if (id && (cardsStatus === 'idle' || cardsStatus === 'error')) {
      dispatch(fetchCards(id))
    }
  }, [dispatch, id, cardsStatus])

  // Đảm bảo lib detail có sẵn (khi vào trực tiếp)
  useEffect(() => { if (id && !lib) dispatch(fetchLibraryById(id)) }, [dispatch, id, lib])

  // Ghi recent vào IndexedDB khi xem thư viện
  useEffect(() => {
    if (id && lib) {
      void addRecentLibrary(id)
    }
  }, [id, lib])

  const openAdd = () => {
    setFront(''); setBack(''); setEditingId(null); setDescription(''); setDialogMode('add')
  }

  const openEdit = (c: Flashcard) => {
    setFront(c.front); setBack(c.back); setEditingId(c.id)
    setDescription(c.description ?? ''); setDialogMode('edit')
  }

  const closeDialog = () => {
    setDialogMode(null); setEditingId(null); setFront(''); setBack(''); setDescription('')
  }

  const onSubmitDialog = () => {
    if (!id) return
    if (dialogMode === 'add') {
      const cardPayload: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'> = {
        front, back, description: description, libraryId: id
      }
      dispatch(createCard({ libraryId: id, card: cardPayload }))
    } else if (dialogMode === 'edit' && editingId) {
      dispatch(updateCard({
        id: editingId,
        patch: { front, back, description: description }
      }))
    }
    closeDialog()
  }

  const onRequestDelete = (cardId: string) => { setDeleteId(cardId); setConfirmOpen(true) }
  const confirmDelete = () => { if (deleteId) dispatch(removeCard(deleteId)); setDeleteId(null); setConfirmOpen(false) }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return cards
    return cards.filter(c => {
      const t = `${c.front} ${c.back} ${c.description ?? ''}`.toLowerCase()
      return t.includes(q)
    })
  }, [cards, query])

  const hasCards = cards.length > 0
  const hasFilter = query.trim().length > 0

  if (!id) return null

  const renderHeader = () => (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <H2 className="mb-1 truncate">{lib?.name ?? 'Thư viện'}</H2>
        {lib?.description ? (
          <P className="text-muted-foreground truncate">{lib.description}</P>
        ) : (
          <Small className="text-muted-foreground">Bộ thẻ ghi nhớ để luyện tập nhanh.</Small>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex gap-2">
          {/* Study / Quiz buttons */}
          {lib && (
            <>
              <Button
                variant="ghost"
                onClick={async () => {
                  try { await addRecentLibrary(lib.id) } catch { /* ignore */ };
                  navigate('/app/study')
                }}
              >
                Học
              </Button>
              <Button
                variant="ghost"
                onClick={async () => {
                  try { await addRecentLibrary(lib.id) } catch { /* ignore */ };
                  navigate('/app/study/quiz')
                }}
              >
                Kiểm tra
              </Button>
            </>
          )}
          {isOwner && (
            <ImportExport
              cards={cards}
              onImport={(list) => {
                if (!id) return
                for (const c of list) {
                  const cardPayload: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'> = {
                    front: c.front, back: c.back, description: c.description, libraryId: id
                  }
                  dispatch(createCard({ libraryId: id, card: cardPayload }))
                }
              }}
            />
          )}
          {isOwner && (
            <Button onClick={openAdd}>
              <Plus className="mr-2 h-4 w-4" /> Thêm thẻ
            </Button>
          )}
          {isOwner && lib && (
            <ShareManager
              libraryId={lib.id}
              ownerId={lib.ownerId}
              share={lib.share}
              isOwner={isOwner}
              trigger={<Button variant="secondary"><Share2 className="h-4 w-4" /></Button>}
            />
          )}
        </div>
      </div>
    </div>
  )

  const renderHeaderSkeleton = () => (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <SkeletonLine className="h-6 w-48" />
        <SkeletonLine className="mt-2 w-64" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-10" />
      </div>
    </div>
  )

  const SearchBox = () => (
    <div className="flex items-center gap-2 mt-3">
      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          aria-label="Tìm kiếm thẻ"
          className="pl-9 pr-9"
          placeholder="Tìm kiếm thẻ (mặt trước/sau, description)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            type="button"
            aria-label="Xóa từ khóa"
            className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground hover:bg-accent"
            onClick={() => setQuery('')}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {hasFilter && (
        <Small className="text-muted-foreground whitespace-nowrap">
          {filtered.length}/{cards.length} kết quả
        </Small>
      )}
    </div>
  )

  const CardItem = ({ c }: { c: Flashcard }) => (
    <li className="rounded-xl border p-4 shadow-sm bg-card text-card-foreground border-border">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <Large className="break-words">{c.front}</Large>
          <P className="mt-2 text-sm text-muted-foreground break-words">{c.back}</P>
          {c.description && <Small className="mt-2 text-muted-foreground">Mô tả: {c.description}</Small>}
        </div>
        {isOwner && (
          <div className="flex flex-col gap-2 ml-3 shrink-0">
            <Button variant="secondary" onClick={() => openEdit(c)}>Sửa</Button>
            <Button variant="destructive" onClick={() => onRequestDelete(c.id)}>Xóa</Button>
          </div>
        )}
      </div>
    </li>
  )

  const CardItemSkeleton = () => (
  <li className="rounded-xl border p-4 shadow-sm bg-card border-border">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <SkeletonLine className="h-5 w-2/3" />
          <SkeletonLine className="mt-2 w-5/6" />
          <SkeletonLine className="mt-1 w-3/5" />
          <SkeletonLine className="mt-3 h-3 w-1/3" />
        </div>
        <div className="flex flex-col gap-2 ml-3">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </li>
  )

  const renderLoading = () => (
    <>
      {renderHeaderSkeleton()}
      <div className="mt-4 space-y-4">
        <Skeleton className="h-52 w-full rounded-xl" /> {/* FlipDeck placeholder */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-full sm:w-96" />
          <Skeleton className="h-4 w-24" />
        </div>
        <ul className="flex flex-col gap-3">
          <CardItemSkeleton />
          <CardItemSkeleton />
          <CardItemSkeleton />
        </ul>
      </div>
    </>
  )

  const renderError = () => (
    <div className="rounded-xl border p-4 bg-red-50">
      <P className="text-red-600">{cardsError ?? 'Lỗi tải thẻ.'}</P>
      <Button size="sm" className="mt-2" onClick={() => dispatch(fetchCards(id))}>
        <RefreshCw className="mr-2 h-4 w-4" /> Thử lại
      </Button>
    </div>
  )

  const renderEmptyNoCards = () => (
    <div className="rounded-xl border-dashed border p-8 text-center text-gray-600 bg-white/50">
      <P className="text-base">Chưa có thẻ nào trong thư viện này.</P>
      {isOwner && <Button className="mt-3" onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Tạo thẻ đầu tiên</Button>}
    </div>
  )

  const renderEmptyNoResult = () => (
    <div className="rounded-xl border-dashed border p-8 text-center text-gray-600 bg-white/50">
      <P>Không có thẻ khớp với từ khóa tìm kiếm.</P>
    </div>
  )

  const renderCardsSection = () => {
    if (cardsStatus === 'idle' || cardsStatus === 'loading') {
      return renderLoading()
    }
    if (cardsStatus === 'error') {
      return renderError()
    }

    // ready
    return (
      <>
        {renderHeader()}

        <div className="mt-4 space-y-4">
          {/* ✅ FlipDeck luôn nhận full cards */}
          {hasCards ? <FlipDeck cards={cards} /> : null}

          <SearchBox />

          {!isOwner && <Small className="text-muted-foreground">Bạn không có quyền chỉnh sửa thư viện này.</Small>}

          {!hasCards ? (
            renderEmptyNoCards()
          ) : filtered.length === 0 ? (
            renderEmptyNoResult()
          ) : (
            <ul className="flex flex-col gap-3">
              {filtered.map((c) => <CardItem key={c.id} c={c} />)}
            </ul>
          )}
        </div>
      </>
    )
  }

  return (
    <section className={cn("space-y-4", "pb-8")}>
      {renderCardsSection()}

      {/* Add/Edit dialog */}
      <Dialog open={dialogMode !== null} onOpenChange={(open) => { if (!open) closeDialog() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === 'edit' ? 'Sửa thẻ' : 'Thêm thẻ'}</DialogTitle>
            <DialogDescription className="sr-only">
              {dialogMode === 'edit' ? 'Form to edit a flashcard' : 'Form to add a new flashcard'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Input placeholder="Mặt trước" value={front} onChange={(e) => setFront(e.target.value)} />
            <Input placeholder="Mặt sau" value={back} onChange={(e) => setBack(e.target.value)} />
            <Textarea placeholder="Mô tả (description)" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={closeDialog}>Hủy</Button>
            <Button onClick={onSubmitDialog} disabled={!front.trim() || !back.trim()}>{dialogMode === 'edit' ? 'Lưu' : 'Thêm'}</Button>
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
    </section>
  )
}

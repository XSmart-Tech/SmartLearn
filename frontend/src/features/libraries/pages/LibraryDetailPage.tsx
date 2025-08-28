import { useEffect, useMemo, useState, Suspense, lazy } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/shared/store'
import type { Flashcard } from '@/shared/lib/types'
import { fetchCards, createCard, removeCard, updateCard } from '@/shared/store/cardsSlice'
import { createNotification } from '@/shared/store/notificationsSlice'
import { toast } from 'sonner'
import { fetchLibraryById, updateLibrary } from '@/shared/store/librariesSlice'
const ShareManager = lazy(() => import('@/features/libraries/components/ShareManager'))
const ImportExport = lazy(() => import('@/shared/components/ImportExport'))
const BulkAddCardsDialog = lazy(() => import('@/features/libraries/components/BulkAddCardsDialog'))
import LibraryDialog from '@/features/libraries/components/LibraryDialog'
import { useSearch } from '@/shared/hooks/useSearch'
import { sortCards } from '@/shared/lib/cardUtils'
import { useRealtimeCards } from '@/shared/hooks/useRealtime'
import EmptyState from '@/shared/components/EmptyState'
import {
  Button, Input, Dialog, DialogContent, DialogDescription, DialogTitle,
  DialogHeader, DialogFooter, DialogClose,
  SkeletonLine,
  Skeleton, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Large,
  Small,
  P,
  Container,
  ConfirmationDialog,
} from '@/shared/ui'
import { useParams, useNavigate } from 'react-router-dom'
import FlipDeck from '@/features/study/components/FlipDeck'
import { Share2, Plus, X, Search, RefreshCw, ArrowUpDown, Grid3X3, List, BookOpen, CheckCircle, Edit } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { addRecentLibrary } from '@/shared/lib/recent'
import PageHeader from '@/shared/components/PageHeader'

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
  const userRole: 'owner' | 'contributor' | 'viewer' = useMemo(() => {
    if (!lib || !user) return 'viewer'
    if (lib.ownerId === user.uid) return 'owner'
    if (lib.shareRoles && lib.shareRoles[user.uid]) return lib.shareRoles[user.uid]
    return 'viewer'
  }, [lib, user])
  const canAddCards = userRole === 'owner' || userRole === 'contributor'

  const navigate = useNavigate()

  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [description, setDescription] = useState('')
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [sortBy, setSortBy] = useState<'front' | 'back' | 'createdAt' | 'updatedAt'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  // Load thẻ cho thư viện hiện tại
  useEffect(() => {
    if (id && (cardsStatus === 'idle' || cardsStatus === 'error')) {
      dispatch(fetchCards(id))
    }
  }, [dispatch, id, cardsStatus])

  // Realtime updates cho thẻ
  useRealtimeCards(id ?? null)

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
    if (!id || !lib || !user) return
    if (dialogMode === 'add') {
      const cardPayload: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'> = {
        front, back, description: description, libraryId: id
      }
      
      if (isOwner) {
        // Owner có thể thêm trực tiếp
        dispatch(createCard({ libraryId: id, card: cardPayload }))
      } else if (userRole === 'contributor') {
        // Contributor gửi request
        dispatch(createNotification({
          type: 'card_request',
          recipientId: lib.ownerId,
          senderId: user.uid,
          libraryId: id,
          status: 'pending',
          data: {
            cards: [cardPayload],
            message: 'Yêu cầu thêm 1 thẻ vào thư viện'
          }
        }))
        toast.success('Đã gửi yêu cầu thêm thẻ đến chủ thư viện')
      }
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

  const { query, setQuery, filtered: searchFiltered, hasFilter } = useSearch(cards, {
    searchFields: ['front', 'back', 'description']
  })

  const filtered = useMemo(() => {
    return sortCards(searchFiltered, sortBy, sortOrder)
  }, [searchFiltered, sortBy, sortOrder])

  const hasCards = cards.length > 0

  if (!id) return null

  const headerActions = (
    <>
      {/* Study Actions */}
      {lib && (
        <>
          <Button
            variant="default"
            onClick={async () => {
              try { await addRecentLibrary(lib.id) } catch { /* ignore */ };
              navigate('/app/study')
            }}
            className="bg-primary hover:bg-primary/90"
            aria-label="Bắt đầu học thư viện này"
          >
            <BookOpen className="mr-2 h-4 w-4" /> Học
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              try { await addRecentLibrary(lib.id) } catch { /* ignore */ };
              navigate('/app/study/quiz')
            }}
            aria-label="Làm bài kiểm tra"
          >
            <CheckCircle className="mr-2 h-4 w-4" /> Kiểm tra
          </Button>
        </>
      )}

      {/* Management Actions - For Owner and Contributor */}
      {canAddCards && (
        <>
          <Button onClick={openAdd} className="bg-success hover:bg-success/90" aria-label="Thêm thẻ mới vào thư viện">
            <Plus className="mr-2 h-4 w-4" /> Thêm thẻ
          </Button>
          <Suspense fallback={<Button variant="outline" disabled>Thêm nhiều thẻ</Button>}>
            <BulkAddCardsDialog libraryId={id} />
          </Suspense>
        </>
      )}

      {/* Owner-only Actions */}
      {isOwner && (
        <>
          <Suspense fallback={<Button variant="outline" disabled>Import/Export</Button>}>
            <ImportExport
              cards={cards}
              onImport={(list) => {
                if (!id || !lib || !user) return
                
                if (isOwner) {
                  // Owner có thể import trực tiếp
                  for (const c of list) {
                    const cardPayload: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'> = {
                      front: c.front, back: c.back, description: c.description, libraryId: id
                    }
                    dispatch(createCard({ libraryId: id, card: cardPayload }))
                  }
                } else if (userRole === 'contributor') {
                  // Contributor gửi request
                  const cardPayloads: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'>[] = list.map(c => ({
                    front: c.front, back: c.back, description: c.description, libraryId: id
                  }))
                  
                  dispatch(createNotification({
                    type: 'card_request',
                    recipientId: lib.ownerId,
                    senderId: user.uid,
                    libraryId: id,
                    status: 'pending',
                    data: {
                      cards: cardPayloads,
                      message: `Yêu cầu import ${list.length} thẻ vào thư viện`
                    }
                  }))
                  toast.success(`Đã gửi yêu cầu import ${list.length} thẻ đến chủ thư viện`)
                }
              }}
            />
          </Suspense>
          {lib && (
            <LibraryDialog
              mode="edit"
              library={lib}
              onUpdate={async (id: string, name: string, description: string) => {
                await dispatch(updateLibrary({ id, patch: { name, description } }))
              }}
            >
              <Button variant="outline" aria-label="Chỉnh sửa thư viện">
                <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
              </Button>
            </LibraryDialog>
          )}
        </>
      )}

      {/* Share Action - Only for Owner */}
      {isOwner && lib && (
        <Suspense fallback={<Button variant="secondary" disabled><Share2 className="h-4 w-4" /></Button>}>
          <ShareManager
            libraryId={lib.id}
            ownerId={lib.ownerId}
            share={lib.share}
            shareRoles={lib.shareRoles}
            isOwner={isOwner}
            trigger={<Button variant="secondary" aria-label="Chia sẻ thư viện"><Share2 className="h-4 w-4" /></Button>}
          />
        </Suspense>
      )}
    </>
  )

  const renderHeader = () => (
    <PageHeader
      title={lib?.name ?? 'Thư viện'}
      description={lib?.description || 'Bộ thẻ ghi nhớ để luyện tập nhanh.'}
      actions={headerActions}
      wrapperClassName="rounded-xl p-4 space-y-4"
      titleComponent="H2"
      descriptionComponent={lib?.description ? 'P' : 'Small'}
    />
  )





  const SearchBox = () => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-2">
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

      <div className="flex items-center gap-2 flex-wrap">
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'front' | 'back' | 'createdAt' | 'updatedAt')}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Sắp xếp theo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Ngày tạo</SelectItem>
            <SelectItem value="updatedAt">Ngày sửa</SelectItem>
            <SelectItem value="front">Mặt trước</SelectItem>
            <SelectItem value="back">Mặt sau</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          <ArrowUpDown className="h-4 w-4" />
        </Button>

        <div className="flex border rounded-md">
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="rounded-r-none"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="rounded-l-none"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>

        {hasFilter && (
          <Small className="text-muted-foreground whitespace-nowrap">
            {filtered.length}/{cards.length} kết quả
          </Small>
        )}
      </div>
    </div>
  )

  const CardItem = ({ c }: { c: Flashcard }) => (
    <li className={cn(
      "rounded-xl border p-3 shadow-sm bg-card text-card-foreground border-border transition-all hover:shadow-md",
      viewMode === 'grid' ? "flex-1 min-w-0" : ""
    )}>
      <div className={cn(
        "flex justify-between items-start gap-2",
        viewMode === 'grid' ? "flex-col" : ""
      )}>
        <div className="flex-1 min-w-0">
          <Large className="break-words font-semibold">{c.front}</Large>
          <P className="mt-2 text-sm text-muted-foreground break-words">{c.back}</P>
          {c.description && <Small className="mt-2 text-muted-foreground">Mô tả: {c.description}</Small>}
        </div>
        {isOwner && (
          <div className={cn(
            "flex gap-2 shrink-0",
            viewMode === 'grid' ? "mt-3 self-end" : "flex-col ml-3"
          )}>
            <Button variant="secondary" size="sm" onClick={() => openEdit(c)}>Sửa</Button>
            <Button variant="destructive" size="sm" onClick={() => onRequestDelete(c.id)}>Xóa</Button>
          </div>
        )}
      </div>
    </li>
  )

  const CardItemSkeleton = () => (
    <li className={cn(
      "rounded-xl border p-3 shadow-sm bg-card border-border",
      viewMode === 'grid' ? "flex-1 min-w-0" : ""
    )}>
      <div className={cn(
        "flex justify-between items-start gap-2",
        viewMode === 'grid' ? "flex-col" : ""
      )}>
        <div className="flex-1">
          <SkeletonLine className="h-5 w-2/3" />
          <SkeletonLine className="mt-2 w-5/6" />
          <SkeletonLine className="mt-1 w-3/5" />
          <SkeletonLine className="mt-3 h-3 w-1/3" />
        </div>
        <div className={cn(
          "flex gap-2",
          viewMode === 'grid' ? "mt-3 self-end" : "flex-col ml-3"
        )}>
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </li>
  )

  const renderLoading = () => (
    <>
      <div className="mt-6 space-y-6">
        <Skeleton className="h-40 w-full rounded-xl" /> {/* FlipDeck placeholder */}
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
    <EmptyState
      icon={<Plus className="h-8 w-8 text-gray-400" />}
      title="Chưa có thẻ nào trong thư viện này."
      description={isOwner 
        ? "Bắt đầu tạo bộ thẻ ghi nhớ đầu tiên của bạn!" 
        : userRole === 'contributor'
        ? "Bạn có thể gửi yêu cầu thêm thẻ đến chủ thư viện."
        : "Chỉ chủ thư viện mới có thể thêm thẻ."
      }
      action={isOwner ? <Button className="mt-3 bg-primary hover:bg-primary/90" onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Tạo thẻ đầu tiên</Button> : null}
    />
  )

  const renderEmptyNoResult = () => (
    <EmptyState
      icon={<Search className="h-8 w-8 text-gray-400" />}
      title="Không có thẻ khớp với từ khóa tìm kiếm."
      description="Hãy thử từ khóa khác hoặc xóa bộ lọc."
    />
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

        <div className="space-y-4">
          {/* ✅ FlipDeck luôn nhận full cards */}
          {hasCards ? <FlipDeck cards={cards} /> : null}

          <SearchBox />

          {!isOwner && <Small className="text-muted-foreground">
            {userRole === 'contributor' 
              ? 'Bạn có thể thêm thẻ bằng cách gửi yêu cầu đến chủ thư viện.' 
              : 'Bạn không có quyền chỉnh sửa thư viện này.'
            }
          </Small>}

          {!hasCards ? (
            renderEmptyNoCards()
          ) : filtered.length === 0 ? (
            renderEmptyNoResult()
          ) : (
            <div className={cn(
              viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 list-none" : "flex flex-col gap-3 list-none"
            )}>
              {filtered.map((c) => <CardItem key={c.id} c={c} />)}
            </div>
          )}
        </div>
      </>
    )
  }

  return (
    <Container className="space-y-4">
      {renderCardsSection()}

      {/* Add/Edit dialog */}
      <Dialog open={dialogMode !== null} onOpenChange={(open) => { if (!open) closeDialog() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === 'edit' ? 'Sửa thẻ' : (userRole === 'contributor' ? 'Yêu cầu thêm thẻ' : 'Thêm thẻ')}</DialogTitle>
            <DialogDescription className="sr-only">
              {dialogMode === 'edit' ? 'Form to edit a flashcard' : (userRole === 'contributor' ? 'Form to request adding a new flashcard' : 'Form to add a new flashcard')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Input placeholder="Mặt trước" value={front} onChange={(e) => setFront(e.target.value)} />
            <Input placeholder="Mặt sau" value={back} onChange={(e) => setBack(e.target.value)} />
            <Textarea placeholder="Mô tả (description)" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={closeDialog}>Hủy</Button>
            <Button onClick={onSubmitDialog} disabled={!front.trim() || !back.trim()}>
              {dialogMode === 'edit' ? 'Lưu' : (userRole === 'contributor' ? 'Gửi yêu cầu' : 'Thêm')}
            </Button>
          </DialogFooter>
          <DialogClose />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={(open) => { if (!open) setConfirmOpen(false) }}
        title="Xác nhận xóa"
        description="Bạn có chắc muốn xóa thẻ này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={confirmDelete}
        variant="dialog"
      />
    </Container>
  )
}

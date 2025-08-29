import { useEffect, useMemo, useState, Suspense, lazy } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/shared/store'
import type { Flashcard } from '@/shared/lib/types'
import { fetchCards, createCard, removeCard, updateCard } from '@/shared/store/cardsSlice'
import { createNotification } from '@/shared/store/notificationsSlice'
import { toast } from 'sonner'
import { fetchLibraryById, updateLibrary } from '@/shared/store/librariesSlice'
const ShareManager = lazy(() => import('@/features/libraries/components/ShareManager'))
const ImportExport = lazy(() => import('@/shared/components').then(m => ({ default: m.ImportExport })))
const BulkAddCardsDialog = lazy(() => import('@/features/libraries/components/BulkAddCardsDialog'))
import LibraryDialog from '@/features/libraries/components/LibraryDialog'
import { useRealtimeCards } from '@/shared/hooks'
import { CardListView, PageHeader } from '@/shared/components'
import type { SortOption, GridColumns } from '@/shared/components'
import {
  Button, Input, Dialog, DialogContent, DialogDescription, DialogTitle,
  DialogHeader, DialogFooter, DialogClose,
  Textarea,
  Small,
  Container,
  ConfirmationDialog,
} from '@/shared/ui'
import { useParams, useNavigate } from 'react-router-dom'
import FlipDeck from '@/features/study/components/FlipDeck'
import { Share2, Plus, BookOpen, CheckCircle, Edit } from 'lucide-react'
import { addRecentLibrary } from '@/shared/lib/recent'

export default function LibraryDetailPage() {
  const EMPTY_CARDS: Flashcard[] = []
  const { id } = useParams()

  const dispatch = useDispatch<AppDispatch>()
  const lib = useSelector((s: RootState) => (id ? s.libraries.items[id] : undefined))
  const cards = useSelector((s: RootState) => (id ? (s.cards.byLib[id] ?? EMPTY_CARDS) : EMPTY_CARDS))
  const cardsStatus = useSelector((s: RootState) => (id ? (s.cards.byLibStatus[id] ?? 'idle') : 'idle'))
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

  const hasCards = cards.length > 0

  if (!id) return null

  const sortOptions: SortOption[] = [
    { value: 'createdAt', label: 'Ngày tạo' },
    { value: 'updatedAt', label: 'Ngày sửa' },
    { value: 'front', label: 'Mặt trước' },
    { value: 'back', label: 'Mặt sau' }
  ]

  const gridColumns: GridColumns = { default: 1, md: 2, lg: 3, xl: 4 }

  const renderCardItem = (card: Flashcard, viewMode: 'list' | 'grid' = 'grid') => {
    return (
      <li className={`rounded-xl border p-3 shadow-sm bg-card text-card-foreground border-border transition-all hover:shadow-md ${
        viewMode === 'grid' ? "flex-1 min-w-0" : ""
      }`}>
        <div className={`flex justify-between items-start gap-2 ${
          viewMode === 'grid' ? "flex-col" : ""
        }`}>
          <div className="flex-1 min-w-0">
            <div className="break-words font-semibold">{card.front}</div>
            <div className="mt-2 text-sm text-muted-foreground break-words">{card.back}</div>
            {card.description && <div className="mt-2 text-muted-foreground">Mô tả: {card.description}</div>}
          </div>
          {isOwner && (
            <div className={`flex gap-2 shrink-0 ${
              viewMode === 'grid' ? "mt-3 self-end" : "flex-col ml-3"
            }`}>
              <Button variant="secondary" size="sm" onClick={() => openEdit(card)}>Sửa</Button>
              <Button variant="destructive" size="sm" onClick={() => onRequestDelete(card.id)}>Xóa</Button>
            </div>
          )}
        </div>
      </li>
    )
  }

  const renderLoading = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 list-none">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-xl border p-3 shadow-sm bg-card border-border">
          <div className="flex justify-between items-start gap-2 flex-col">
            <div className="flex-1">
              <div className="h-5 w-2/3 bg-gray-200 rounded animate-pulse" />
              <div className="mt-2 w-5/6 bg-gray-200 rounded animate-pulse" />
              <div className="mt-1 w-3/5 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex gap-2 mt-3 self-end">
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderEmpty = () => (
    <div className="text-center py-8 text-muted-foreground">
      <div>Không có thẻ nào trong thư viện này.</div>
    </div>
  )

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
            <BulkAddCardsDialog libraryId={id!} />
          </Suspense>
        </>
      )}

      {/* Owner-only Actions */}
      {isOwner && (
        <>
          <Suspense fallback={<Button variant="outline" disabled>Import/Export</Button>}>
            <ImportExport
              cards={cards}
              onImport={(list: Flashcard[]) => {
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
                  const cardPayloads: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'>[] = list.map((c: Flashcard) => ({
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







  const renderCardsSection = () => {
    // ready
    return (
      <>
        {renderHeader()}

        <div className="space-y-4">
          {/* ✅ FlipDeck luôn nhận full cards */}
          {hasCards ? <FlipDeck cards={cards} /> : null}

          {!isOwner && <Small className="text-muted-foreground">
            {userRole === 'contributor'
              ? 'Bạn có thể thêm thẻ bằng cách gửi yêu cầu đến chủ thư viện.'
              : 'Bạn không có quyền chỉnh sửa thư viện này.'
            }
          </Small>}

          <CardListView
            data={cards}
            searchFields={['front', 'back', 'description']}
            sortOptions={sortOptions}
            defaultSortBy="createdAt"
            defaultSortOrder="desc"
            viewMode="grid"
            gridColumns={gridColumns}
            renderItem={renderCardItem}
            renderEmpty={renderEmpty}
            renderLoading={renderLoading}
            searchPlaceholder="Tìm kiếm thẻ..."
            showResultCount={true}
            isLoading={cardsStatus === 'loading'}
          />
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

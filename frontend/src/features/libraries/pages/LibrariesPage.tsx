import { lazy, useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/shared/store'
import { removeLibrary, createLibrary } from '@/shared/store/librariesSlice'
import type { Library } from '@/shared/lib/types'
import { Container, ConfirmationDialog } from '@/shared/ui'
import LibraryDialog from '@/features/libraries/components/LibraryDialog'
import PageHeader from '@/shared/components/PageHeader'

const LibraryList = lazy(() => import('@/features/libraries/components/LibraryList'))
const selectUid = (s: RootState) => s.auth.user?.uid ?? null

export default function LibrariesPage() {
  const dispatch = useDispatch<AppDispatch>()
  const uid = useSelector(selectUid)
  const [libToRemove, setLibToRemove] = useState<Library | null>(null)

  const handleCreate = useCallback(
    async (name: string, description?: string) => {
      if (!uid) return
      await dispatch(createLibrary({ uid, name, description }))
    },
    [dispatch, uid]
  )

  const onAskRemove = useCallback((lib: Library) => {
    setLibToRemove(lib)
  }, [])

  const onConfirmRemove = useCallback(async () => {
    if (!libToRemove) return
    await dispatch(removeLibrary(libToRemove.id))
    setLibToRemove(null)
  }, [dispatch, libToRemove])

  return (
    <Container className="space-y-4">
      <PageHeader
        title="Thư viện"
        description="Quản lý các thư viện học tập của bạn"
        actions={<LibraryDialog mode="create" onCreate={handleCreate} disabled={!uid} />}
      />

      <LibraryList onAskRemove={onAskRemove} />

      {/* ONE global ConfirmationDialog duy nhất */}
      <ConfirmationDialog
        open={!!libToRemove}
        onOpenChange={(open) => !open && setLibToRemove(null)}
        title="Xác nhận xóa"
        description={
          libToRemove ? (
            <>Hành động này sẽ xóa vĩnh viễn “<b>{libToRemove.name}</b>”. Bạn có chắc chắn?</>
          ) : (
            'Hành động này sẽ xóa vĩnh viễn mục đã chọn. Bạn có chắc chắn?'
          )
        }
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={onConfirmRemove}
        variant="alert"
      />
    </Container>
  )
}

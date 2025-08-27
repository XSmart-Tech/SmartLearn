import { lazy, useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/store'
import { removeLibrary, createLibrary } from '@/store/librariesSlice'
import type { Library } from '@/lib/types'
import { Button, Large, Small } from '@/components/ui'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'

const LibraryList = lazy(() => import('@/components/LibraryList'))
const selectUid = (s: RootState) => s.auth.user?.uid ?? null
import CreateLibraryDialog from '@/components/CreateLibraryDialog'

export default function LibrariesPage() {
  const dispatch = useDispatch<AppDispatch>()
  const uid = useSelector(selectUid)
  const [libToRemove, setLibToRemove] = useState<Library | null>(null)

  const handleCreate = useCallback(
    async (name: string) => {
      if (!uid) return
      await dispatch(createLibrary({ uid, name }))
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
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Large>Thư viện</Large>
          <Small className="block text-muted-foreground">
            Quản lý các thư viện học tập của bạn
          </Small>
        </div>

        <CreateLibraryDialog onCreate={handleCreate} disabled={!uid} />
      </div>

      <LibraryList onAskRemove={onAskRemove} />

      {/* ONE global AlertDialog duy nhất */}
      <AlertDialog open={!!libToRemove} onOpenChange={(open) => !open && setLibToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa vĩnh viễn
              {libToRemove ? (
                <> “<b>{libToRemove.name}</b>”. Bạn có chắc chắn?</>
              ) : (
                ' mục đã chọn. Bạn có chắc chắn?'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">Hủy</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={onConfirmRemove}>
                Xóa
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}

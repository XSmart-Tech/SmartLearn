import { memo, useCallback, useEffect } from "react"
import { useDispatch, useSelector, shallowEqual } from "react-redux"
import { Link } from "react-router-dom"
import type { RootState, AppDispatch } from "@/shared/store"
import { fetchLibraries, updateLibrary } from "@/shared/store/librariesSlice"
import { Button, Small, Large } from "@/shared/ui"
import type { Library } from "@/shared/lib/types"
import { createSelector } from "@reduxjs/toolkit"
import LibraryDialog from "./LibraryDialog"
import { Folder, FolderOpen, Shield, Trash2, Edit } from "lucide-react"

/* ========= Selectors (ổn định tham chiếu) ========= */
const selectUid = (s: RootState) => s.auth.user?.uid ?? null
const selectStatus = (s: RootState) => s.libraries.status
const selectError = (s: RootState) => s.libraries.error
const selectOrder = (s: RootState) => s.libraries.order
const selectItems = (s: RootState) => s.libraries.items

const selectLibs = createSelector(
  [selectOrder, selectItems],
  (order, items) => order.map((id) => items[id]).filter(Boolean) as Library[]
)

/* ========= Subcomponents ========= */

function Badge({
  children,
  tone = "default",
  title,
}: {
  children: React.ReactNode
  tone?: "default" | "owner" | "contributor" | "viewer"
  title?: string
}) {
  const base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
  const byTone = {
    owner: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
    contributor: "bg-blue-50 text-blue-700 ring-1 ring-blue-100", 
    viewer: "bg-gray-50 text-gray-700 ring-1 ring-gray-200",
    default: "bg-gray-100 text-gray-700 ring-1 ring-gray-200"
  }
  return (
    <span className={`${base} ${byTone[tone]}`} title={title}>
      {children}
    </span>
  )
}

const LoadingSkeletons = ({ count = 6 }: { count?: number }) => (
  <ul
    className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
    aria-hidden="true"
  >
    {Array.from({ length: count }).map((_, i) => (
      <li
        key={i}
        className="rounded-2xl border bg-white/60 p-4 shadow-sm ring-1 ring-black/5"
      >
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 animate-pulse rounded-xl bg-gray-100" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-11/12 animate-pulse rounded bg-gray-100" />
          </div>
          <div className="h-8 w-20 animate-pulse rounded bg-gray-100" />
        </div>
      </li>
    ))}
  </ul>
)

const EmptyState = () => (
  <div className="rounded-2xl border border-dashed bg-gray-50 p-8 text-center">
    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
      <FolderOpen className="h-6 w-6 text-gray-700" />
    </div>
    <Large className="block">Chưa có thư viện nào</Large>
    <Small className="mt-1 block text-gray-600">
      Tạo thư viện mới để tổ chức thẻ và chia sẻ cùng mọi người.
    </Small>
  </div>
)

const LibraryItem = memo(
  function LibraryItem({
    lib,
    userRole,
    onAskRemove,
    dispatch,
  }: {
    lib: Library
    userRole: 'owner' | 'contributor' | 'viewer'
    onAskRemove: (lib: Library) => void
    dispatch: AppDispatch
  }) {
    const ask = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      onAskRemove(lib);
    }, [onAskRemove, lib])

    const isOwner = userRole === 'owner'

    return (
      <li className="group relative rounded-2xl border border-border bg-card p-4 shadow-sm ring-1 ring-sidebar-ring/10 transition hover:shadow-md focus-within:shadow-md">
        <div

          className="block outline-none"
          aria-label={`Đi tới thư viện ${lib.name}`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground/90">
              <Folder className="h-5 w-5" aria-hidden />
            </div>

            <Link to={`/app/libraries/${lib.id}`} className="min-w-0 flex-1 overflow-hidden">
              <Large className="align-middle text-card-foreground truncate block">{lib.name}</Large>

              {lib.description && (
                <Small className="mt-1 block text-muted-foreground/90 line-clamp-2">
                  {lib.description}
                </Small>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tone={userRole}>
                  {userRole === 'owner' ? (
                    <>
                      <Shield className="mr-1 h-3.5 w-3.5" /> Chủ sở hữu
                    </>
                  ) : userRole === 'contributor' ? (
                    <>
                      <Edit className="mr-1 h-3.5 w-3.5" /> Contributor
                    </>
                  ) : (
                    <>
                      <FolderOpen className="mr-1 h-3.5 w-3.5" /> Viewer
                    </>
                  )}
                </Badge>
                {/* Có thể hiển thị thêm metadata khác nếu có, ví dụ: số thẻ, cập nhật lần cuối… */}
              </div>
            </Link>

            <div className="flex shrink-0 items-center gap-2 sm:justify-end">
              {isOwner && (
                <>
                  <LibraryDialog
                    mode="edit"
                    library={lib}
                    onUpdate={async (id: string, name: string, description: string) => {
                      await dispatch(updateLibrary({ id, patch: { name, description } }))
                    }}
                  >
                    <Button
                      variant="outline"
                      className="h-9 w-9 rounded-lg p-0"
                      aria-label={`Chỉnh sửa thư viện ${lib.name}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </LibraryDialog>
                  <Button
                    variant="destructive"
                    onClick={ask}
                    className="h-9 w-9 rounded-lg p-0"
                    aria-label={`Xóa thư viện ${lib.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </li>
    )
  },
  (prev, next) =>
    prev.userRole === next.userRole &&
    prev.lib.id === next.lib.id &&
    prev.lib.name === next.lib.name &&
    prev.lib.description === next.lib.description
)

/* ========= Main component ========= */
export default function LibraryList({
  onAskRemove,
}: {
  onAskRemove: (lib: Library) => void
}) {
  const dispatch = useDispatch<AppDispatch>()
  const uid = useSelector(selectUid)
  const status = useSelector(selectStatus)
  const error = useSelector(selectError)
  const libs = useSelector(selectLibs, shallowEqual)

  // Tải dữ liệu lần đầu khi có uid và chưa ready/error
  useEffect(() => {
    if (uid && (status === "idle" || status === "error")) {
      dispatch(fetchLibraries(uid))
    }
  }, [dispatch, uid, status])

  if (!uid) {
    return (
      <section className="space-y-4">
        <Small className="text-muted-foreground">
          Hãy đăng nhập để xem và quản lý thư viện.
        </Small>
      </section>
    )
  }

  if (status === "idle" || status === "loading") {
    return (
      <section className="space-y-4">
        <LoadingSkeletons />
      </section>
    )
  }

  if (status === "error") {
    return (
      <section className="space-y-4">
        <div className="rounded-2xl border bg-red-50 p-4 text-red-700 ring-1 ring-red-200">
          <Large className="block text-red-800">Không tải được danh sách</Large>
          <Small className="block">
            {error ?? "Đã xảy ra lỗi khi tải danh sách."}
          </Small>
          <div className="mt-3">
            <Button size="sm" onClick={() => uid && dispatch(fetchLibraries(uid))}>
              Thử lại
            </Button>
          </div>
        </div>
      </section>
    )
  }

  // status === 'ready'
  return (
    <section className="space-y-4">
      {libs.length > 0 ? (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-3 xl:grid-cols-4">
          {libs.map((lib) => {
            let userRole: 'owner' | 'contributor' | 'viewer' = 'viewer'
            if (uid === lib.ownerId) {
              userRole = 'owner'
            } else if (lib.shareRoles && lib.shareRoles[uid!]) {
              userRole = lib.shareRoles[uid!]
            }
            
            return (
              <LibraryItem
                key={lib.id}
                lib={lib}
                userRole={userRole}
                onAskRemove={onAskRemove}
                dispatch={dispatch}
              />
            )
          })}
        </ul>
      ) : (
        <EmptyState />
      )}
    </section>
  )
}

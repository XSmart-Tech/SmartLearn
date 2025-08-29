import React, { useCallback, useEffect } from 'react'
import { useDispatch, useSelector, shallowEqual } from 'react-redux'
import { Link } from 'react-router-dom'
import type { RootState, AppDispatch } from '@/shared/store'
import { fetchLibraries, updateLibrary } from '@/shared/store/librariesSlice'
import { Button, Card, CardContent, CardHeader, CardTitle, Small } from '@/shared/ui'
import type { Library } from '@/shared/lib/types'
import { createSelector } from '@reduxjs/toolkit'
import LibraryDialog from './LibraryDialog'
import { CardListView } from '@/shared/components'
import type { SortOption, GridColumns } from '@/shared/components'
import { Folder, FolderOpen, Shield, Trash2, Edit, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'

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

interface LibraryCardProps {
  library: Library
  userRole: 'owner' | 'contributor' | 'viewer'
  onAskRemove: (lib: Library) => void
  dispatch: AppDispatch
}

const LibraryCard: React.FC<LibraryCardProps> = ({
  library,
  userRole,
  onAskRemove,
  dispatch
}) => {
  const isOwner = userRole === 'owner'

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onAskRemove(library)
  }, [onAskRemove, library])

  const getRoleIcon = () => {
    switch (userRole) {
      case 'owner':
        return <Shield className="w-4 h-4" />
      case 'contributor':
        return <Edit className="w-4 h-4" />
      default:
        return <FolderOpen className="w-4 h-4" />
    }
  }

  const getRoleText = () => {
    switch (userRole) {
      case 'owner':
        return 'Chủ sở hữu'
      case 'contributor':
        return 'Contributor'
      default:
        return 'Viewer'
    }
  }

  const getRoleColor = () => {
    switch (userRole) {
      case 'owner':
        return 'bg-emerald-100 text-emerald-800'
      case 'contributor':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="h-full hover:shadow-lg transition-shadow group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
              <Folder className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <Link to={`/app/libraries/${library.id}`}>
                <CardTitle className="text-lg hover:text-primary transition-colors line-clamp-1">
                  {library.name}
                </CardTitle>
              </Link>
              {library.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {library.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Role Badge */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor()}`}>
              {getRoleIcon()}
              {getRoleText()}
            </span>
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Tạo: {new Date(library.createdAt).toLocaleDateString('vi-VN')}</span>
            {library.share && (
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>Đã chia sẻ</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Link to={`/app/libraries/${library.id}`}>
              <Button size="sm" className="w-full">
                Xem chi tiết
              </Button>
            </Link>

            {isOwner && (
              <div className="flex gap-2 ml-2">
                <LibraryDialog
                  mode="edit"
                  library={library}
                  onUpdate={async (id: string, name: string, description: string) => {
                    await dispatch(updateLibrary({ id, patch: { name, description } }))
                  }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0"
                    title="Chỉnh sửa"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </LibraryDialog>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRemove}
                  className="h-9 w-9 p-0"
                  title="Xóa"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface LibraryCardListProps {
  onAskRemove: (lib: Library) => void
  gridColumns?: GridColumns
}

export default function LibraryCardList({
  onAskRemove,
  gridColumns = { default: 1, md: 2, lg: 3, xl: 4 }
}: LibraryCardListProps) {
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const uid = useSelector(selectUid)
  const status = useSelector(selectStatus)
  const error = useSelector(selectError)
  const libs = useSelector(selectLibs, shallowEqual)

  // Tải dữ liệu lần đầu khi có uid và chưa ready/error
  useEffect(() => {
    if (uid && (status === 'idle' || status === 'error')) {
      dispatch(fetchLibraries(uid))
    }
  }, [dispatch, uid, status])

  const sortOptions: SortOption[] = [
    { value: 'name', label: 'Tên thư viện' },
    { value: 'createdAt', label: 'Ngày tạo' },
    { value: 'description', label: 'Mô tả' }
  ]

  const customSort = (items: Library[], sortBy: string, sortOrder: 'asc' | 'desc') => {
    return [...items].sort((a, b) => {
      let aVal: string | number
      let bVal: string | number

      switch (sortBy) {
        case 'name':
          aVal = a.name.toLowerCase()
          bVal = b.name.toLowerCase()
          break
        case 'createdAt':
          aVal = new Date(a.createdAt).getTime()
          bVal = new Date(b.createdAt).getTime()
          break
        case 'description':
          aVal = a.description || ''
          bVal = b.description || ''
          break
        default:
          return 0
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }

  const renderLibrary = (library: Library) => {
    let userRole: 'owner' | 'contributor' | 'viewer' = 'viewer'
    if (uid === library.ownerId) {
      userRole = 'owner'
    } else if (library.shareRoles && library.shareRoles[uid!]) {
      userRole = library.shareRoles[uid!]
    }

    return (
      <LibraryCard
        key={library.id}
        library={library}
        userRole={userRole}
        onAskRemove={onAskRemove}
        dispatch={dispatch}
      />
    )
  }

  const renderLoading = () => (
    <div className={`grid gap-4 list-none`} style={{
      gridTemplateColumns: `repeat(${gridColumns.default}, minmax(0, 1fr))`
    }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="h-full">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 bg-gray-200 rounded-xl animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-2/3 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-11/12 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="flex gap-2">
                <div className="h-9 flex-1 bg-gray-200 rounded animate-pulse" />
                <div className="h-9 w-9 bg-gray-200 rounded animate-pulse" />
                <div className="h-9 w-9 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderEmpty = () => (
    <div className="text-center py-12">
      <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có thư viện nào</h3>
      <p className="text-gray-500 mb-4">
        Tạo thư viện mới để tổ chức thẻ và chia sẻ cùng mọi người.
      </p>
    </div>
  )

  const renderError = () => (
    <div className="text-center py-12">
      <div className="text-red-500 mb-4">
        <h3 className="text-lg font-medium mb-2">{t('common.failedToLoadList')}</h3>
        <p className="text-sm text-gray-500">
          {error ?? t('common.errorLoadingLibraryList')}
        </p>
      </div>
      <Button onClick={() => uid && dispatch(fetchLibraries(uid))}>
        {t('common.tryAgain')}
      </Button>
    </div>
  )

  if (!uid) {
    return (
      <div className="text-center py-8">
        <Small className="text-muted-foreground">
          Hãy đăng nhập để xem và quản lý thư viện.
        </Small>
      </div>
    )
  }

  if (status === 'error') {
    return renderError()
  }

  return (
    <CardListView
      data={libs}
      searchFields={['name', 'description']}
      sortOptions={sortOptions}
      defaultSortBy="createdAt"
      defaultSortOrder="desc"
      viewMode="grid"
      gridColumns={gridColumns}
      renderItem={renderLibrary}
      renderEmpty={renderEmpty}
      renderLoading={renderLoading}
      isLoading={status === 'loading'}
      searchPlaceholder="Tìm kiếm thư viện..."
      customSort={customSort}
    />
  )
}

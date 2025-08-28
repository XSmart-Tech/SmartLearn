import {
  useFetchLibrariesQuery,
  useFetchCardsQuery,
  useRefreshLibrariesQuery,
  cacheManager
} from '@/shared/lib/enhancedCache'
import { Button } from '@/shared/ui'

interface EnhancedLibrariesListProps {
  uid: string
}

/**
 * Enhanced Libraries List Component
 *
 * Ví dụ sử dụng Enhanced Cache System:
 * - Cache-first strategy
 * - Automatic stale check
 * - Redux integration
 * - Manual refresh capability
 */
export function EnhancedLibrariesList({ uid }: EnhancedLibrariesListProps) {
  // Sử dụng enhanced cache query
  const {
    data: libraries,
    isLoading,
    error,
    refetch
  } = useFetchLibrariesQuery(uid)

  // Hook để force refresh
  const { refetch: refreshLibraries, isLoading: isRefreshing } = useRefreshLibrariesQuery(uid)

  const handleRefresh = async () => {
    try {
      await refreshLibraries().unwrap()
      console.log('Libraries refreshed successfully!')
    } catch (error) {
      console.error('Failed to refresh libraries:', error)
    }
  }

  const handleClearCache = () => {
    // Clear cache cho libraries của user này
    cacheManager.delete(`libraries_${uid}`)
    // Refetch để load lại từ server
    refetch()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading libraries...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-red-800">
          Error loading libraries: {typeof error === 'object' && error !== null && 'message' in error
            ? (error as { message: string }).message
            : JSON.stringify(error)}
        </div>
        <Button
          onClick={refetch}
          className="mt-2"
          variant="outline"
          size="sm"
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Cache Controls */}
      <div className="flex gap-2 p-4 bg-gray-50 rounded-lg">
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
        >
          {isRefreshing ? 'Refreshing...' : 'Force Refresh'}
        </Button>

        <Button
          onClick={handleClearCache}
          variant="outline"
          size="sm"
        >
          Clear Cache
        </Button>

        <Button
          onClick={() => console.log('Cache keys:', cacheManager.keys())}
          variant="outline"
          size="sm"
        >
          Debug Cache
        </Button>
      </div>

      {/* Libraries List */}
      <div className="space-y-2">
        {libraries && libraries.length > 0 ? (
          libraries.map((library) => (
            <LibraryItem
              key={library.id}
              library={library}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No libraries found
          </div>
        )}
      </div>
    </div>
  )
}

interface LibraryItemProps {
  library: {
    id: string
    name: string
    description?: string
    updatedAt?: number
    createdAt?: number
  }
}

function LibraryItem({ library }: LibraryItemProps) {
  // Enhanced cards query cho từng library
  const { data: cards, isLoading: cardsLoading } = useFetchCardsQuery(library.id)

  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{library.name}</h3>
          {library.description && (
            <p className="text-gray-600 mt-1">{library.description}</p>
          )}

          {/* Cards count */}
          <div className="mt-2 text-sm text-gray-500">
            {cardsLoading ? (
              'Loading cards...'
            ) : (
              `${cards?.length || 0} cards`
            )}
          </div>

          {/* Timestamp info */}
          <div className="mt-1 text-xs text-gray-400">
            Updated: {library.updatedAt ? new Date(library.updatedAt).toLocaleString() : 'Unknown'}
          </div>
        </div>

        {/* Preview cards */}
        {cards && cards.length > 0 && (
          <div className="ml-4 text-right">
            <div className="text-xs text-gray-500 mb-1">Recent cards:</div>
            <div className="space-y-1">
              {cards.slice(0, 2).map((card) => (
                <div key={card.id} className="text-xs bg-blue-50 p-1 rounded">
                  <strong>{card.front}</strong>
                </div>
              ))}
              {cards.length > 2 && (
                <div className="text-xs text-gray-400">
                  +{cards.length - 2} more
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Migration Guide:
 *
 * Từ hệ thống cũ:
 * ```typescript
 * const { data: libraries } = useFetchLibrariesQuery(uid)
 * ```
 *
 * Sang hệ thống mới:
 * ```typescript
 * const { data: libraries } = useFetchLibrariesQuery(uid)
 * ```
 *
 * Hệ thống mới tự động:
 * - Cache data trong Redux
 * - So sánh timestamp với Firebase
 * - Chỉ fetch khi cần thiết
 * - Cung cấp force refresh
 */

export default EnhancedLibrariesList

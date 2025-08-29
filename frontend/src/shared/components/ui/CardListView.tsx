import React, { useState, useMemo } from 'react'
import { useSearch } from '@/shared/hooks'
import {
  Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Small
} from '@/shared/ui'
import { Search, X, ArrowUpDown, Grid3X3, List } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useTranslation } from 'react-i18next'

export interface SortOption {
  value: string
  label: string
}

export interface GridColumns {
  default: number
  md?: number
  lg?: number
  xl?: number
}

export interface CardListViewProps<T> {
  data: T[]
  searchFields?: (keyof T)[]
  sortOptions?: SortOption[]
  defaultSortBy?: string
  defaultSortOrder?: 'asc' | 'desc'
  viewMode?: 'list' | 'grid'
  gridColumns?: GridColumns
  renderItem: (item: T, viewMode?: 'list' | 'grid') => React.ReactNode
  renderEmpty?: () => React.ReactNode
  renderLoading?: () => React.ReactNode
  className?: string
  searchPlaceholder?: string
  showResultCount?: boolean
  isLoading?: boolean
  customSort?: (items: T[], sortBy: string, sortOrder: 'asc' | 'desc') => T[]
}

export default function CardListView<T>({
  data,
  searchFields,
  sortOptions = [],
  defaultSortBy = '',
  defaultSortOrder = 'desc',
  viewMode: initialViewMode = 'list',
  gridColumns = { default: 1, md: 2, lg: 3 },
  renderItem,
  renderEmpty,
  renderLoading,
  className,
  searchPlaceholder,
  showResultCount = true,
  isLoading = false,
  customSort
}: CardListViewProps<T>) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState(defaultSortBy)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(defaultSortOrder)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(initialViewMode)

  const { filtered: searchFiltered, hasFilter } = useSearch(data, {
    searchFields
  })

  const sortedData = useMemo(() => {
    if (!sortBy || !customSort) return searchFiltered

    return customSort(searchFiltered, sortBy, sortOrder)
  }, [searchFiltered, sortBy, sortOrder, customSort])

  const defaultSort = (items: T[], sortBy: string, sortOrder: 'asc' | 'desc') => {
    return [...items].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortBy]
      const bVal = (b as Record<string, unknown>)[sortBy]

      // Convert to string for comparison if not string/number
      const aStr = typeof aVal === 'string' || typeof aVal === 'number' ? String(aVal) : ''
      const bStr = typeof bVal === 'string' || typeof bVal === 'number' ? String(bVal) : ''

      let comparison = 0
      if (aStr < bStr) comparison = -1
      else if (aStr > bStr) comparison = 1

      return sortOrder === 'asc' ? comparison : -comparison
    })
  }

  const finalSortedData = customSort ? sortedData : defaultSort(sortedData, sortBy, sortOrder)

  const gridClassName = useMemo(() => {
    const classes = [`grid-cols-${gridColumns.default}`]
    if (gridColumns.md) classes.push(`md:grid-cols-${gridColumns.md}`)
    if (gridColumns.lg) classes.push(`lg:grid-cols-${gridColumns.lg}`)
    if (gridColumns.xl) classes.push(`xl:grid-cols-${gridColumns.xl}`)
    return classes.join(' ')
  }, [gridColumns])

  if (isLoading && renderLoading) {
    return <div className={className}>{renderLoading()}</div>
  }

  const renderSearchBox = () => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div className="relative w-full sm:max-w-md md:max-w-xs lg:max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          aria-label={t('common.search')}
          className="pl-9 pr-9"
          placeholder={searchPlaceholder || t('common.search')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            type="button"
            aria-label={t('common.clearSearch')}
            className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground hover:bg-accent"
            onClick={() => setQuery('')}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {sortOptions.length > 0 && (
          <>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder={t('common.sortBy')} />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </>
        )}

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

        {showResultCount && hasFilter && (
          <Small className="text-muted-foreground whitespace-nowrap">
            {finalSortedData.length}/{data.length} {t('common.results')}
          </Small>
        )}
      </div>
    </div>
  )

  const renderContent = () => {
    if (isLoading) {
      return renderLoading ? renderLoading() : null
    }

    if (data.length === 0) {
      return renderEmpty ? renderEmpty() : (
        <div className="text-center py-8 text-muted-foreground">
          {t('common.noData')}
        </div>
      )
    }

    if (finalSortedData.length === 0 && hasFilter) {
      return renderEmpty ? renderEmpty() : (
        <div className="text-center py-8 text-muted-foreground">
          {t('common.noMatchingResults')}
        </div>
      )
    }

    return (
      <div className={cn(
        viewMode === 'grid' ? `grid ${gridClassName} gap-4 list-none` : "flex flex-col gap-3 list-none",
        className
      )}>
        {finalSortedData.map((item: T, index: number) => (
          <React.Fragment key={index}>
            {renderItem(item, viewMode)}
          </React.Fragment>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {renderSearchBox()}
      {renderContent()}
    </div>
  )
}

import React from 'react'
import { CardListView } from '@/shared/components'
import type { SortOption, GridColumns } from '@/shared/components'
import { Button, Large, P, Small, Skeleton, SkeletonLine } from '@/shared/ui'
import { cn } from '@/shared/lib/utils'
import { useTranslation } from 'react-i18next'

export interface CardItem {
  id: string
  front: string
  back: string
  description?: string
  createdAt?: string | number
  updatedAt?: string | number
  libraryId?: string
}

interface CardListProps {
  cards: CardItem[]
  isLoading?: boolean
  isOwner?: boolean
  onEdit?: (card: CardItem) => void
  onDelete?: (cardId: string) => void
  className?: string
  gridColumns?: GridColumns
  viewMode?: 'list' | 'grid'
  sortOptions?: SortOption[]
  defaultSortBy?: string
  defaultSortOrder?: 'asc' | 'desc'
  searchPlaceholder?: string
  showResultCount?: boolean
}

const CardItemComponent: React.FC<{
  card: CardItem
  viewMode?: 'list' | 'grid'
  isOwner?: boolean
  onEdit?: (card: CardItem) => void
  onDelete?: (cardId: string) => void
  t: (key: string) => string
}> = ({ card, viewMode = 'list', isOwner, onEdit, onDelete, t }) => (
  <li className={cn(
    "rounded-xl border p-3 shadow-sm bg-card text-card-foreground border-border transition-all hover:shadow-md",
    viewMode === 'grid' ? "flex-1 min-w-0" : ""
  )}>
    <div className={cn(
      "flex justify-between items-start gap-2",
      viewMode === 'grid' ? "flex-col" : ""
    )}>
      <div className="flex-1 min-w-0">
        <Large className="break-words font-semibold">{card.front}</Large>
        <P className="mt-2 text-sm text-muted-foreground break-words">{card.back}</P>
        {card.description && <Small className="mt-2 text-muted-foreground">{t('common.descriptionLabel')} {card.description}</Small>}
      </div>
      {isOwner && (
        <div className={cn(
          "flex gap-2 shrink-0",
          viewMode === 'grid' ? "mt-3 self-end" : "flex-col ml-3"
        )}>
          <Button variant="secondary" size="sm" onClick={() => onEdit?.(card)}>{t('common.editCard')}</Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete?.(card.id)}>{t('common.deleteCard')}</Button>
        </div>
      )}
    </div>
  </li>
)

const CardItemSkeleton: React.FC<{ viewMode: 'list' | 'grid' }> = ({ viewMode }) => (
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

const sortCards = (cards: CardItem[], sortBy: string, sortOrder: 'asc' | 'desc') => {
  return [...cards].sort((a, b) => {
    let aVal: string | number
    let bVal: string | number

    switch (sortBy) {
      case 'front':
        aVal = a.front
        bVal = b.front
        break
      case 'back':
        aVal = a.back
        bVal = b.back
        break
      case 'createdAt':
        aVal = new Date(a.createdAt || 0).getTime()
        bVal = new Date(b.createdAt || 0).getTime()
        break
      case 'updatedAt':
        aVal = new Date(a.updatedAt || 0).getTime()
        bVal = new Date(b.updatedAt || 0).getTime()
        break
      default:
        return 0
    }

    let comparison = 0
    if (aVal < bVal) comparison = -1
    else if (aVal > bVal) comparison = 1

    return sortOrder === 'asc' ? comparison : -comparison
  })
}

export default function CardList({
  cards,
  isLoading = false,
  isOwner = false,
  onEdit,
  onDelete,
  className,
  gridColumns = { default: 1, md: 2, lg: 3 },
  viewMode = 'list',
  sortOptions: customSortOptions,
  defaultSortBy = 'createdAt',
  defaultSortOrder = 'desc',
  searchPlaceholder,
  showResultCount = true
}: CardListProps) {
  const { t } = useTranslation()
  const finalSearchPlaceholder = searchPlaceholder || t('common.searchCards')
  const getSortOptions = (t: (key: string) => string): SortOption[] => [
    { value: 'createdAt', label: t('common.createdDate') },
    { value: 'updatedAt', label: t('common.updatedDate') },
    { value: 'front', label: t('common.front') },
    { value: 'back', label: t('common.backSide') }
  ]

  const finalSortOptions = customSortOptions || getSortOptions(t)

  const renderItem = (card: CardItem, viewMode: 'list' | 'grid' = 'list') => (
    <CardItemComponent
      key={card.id}
      card={card}
      viewMode={viewMode}
      isOwner={isOwner}
      onEdit={onEdit}
      onDelete={onDelete}
      t={t}
    />
  )

  const renderLoading = () => (
    <div className={cn(
      viewMode === 'grid' ? `grid gap-4 list-none` : "flex flex-col gap-3 list-none",
      viewMode === 'grid' && gridColumns ? `grid-cols-${gridColumns.default} md:grid-cols-${gridColumns.md || 2} lg:grid-cols-${gridColumns.lg || 3} xl:grid-cols-${gridColumns.xl || 4}` : ""
    )}>
      <CardItemSkeleton viewMode={viewMode} />
      <CardItemSkeleton viewMode={viewMode} />
      <CardItemSkeleton viewMode={viewMode} />
    </div>
  )

  const renderEmpty = () => (
    <div className="text-center py-8 text-muted-foreground">
      <P>{t('common.noCardsInLibrary')}</P>
    </div>
  )

  return (
    <CardListView
      data={cards}
      searchFields={['front', 'back', 'description']}
      sortOptions={finalSortOptions}
      defaultSortBy={defaultSortBy}
      defaultSortOrder={defaultSortOrder}
      viewMode={viewMode}
      gridColumns={gridColumns}
      renderItem={renderItem}
      renderEmpty={renderEmpty}
      renderLoading={renderLoading}
      className={className}
      searchPlaceholder={finalSearchPlaceholder}
      showResultCount={showResultCount}
      isLoading={isLoading}
      customSort={sortCards}
    />
  )
}

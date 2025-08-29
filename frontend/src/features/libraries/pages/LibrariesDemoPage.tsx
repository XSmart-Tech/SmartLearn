import { useState, useEffect } from 'react'
import { Container } from '@/shared/ui'
import { CardListView } from '@/shared/components'
import type { SortOption, GridColumns } from '@/shared/components'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui'
import { Plus, Users, BookOpen, TrendingUp } from 'lucide-react'

// Mock data cho demo
const mockLibraries = [
  {
    id: '1',
    name: 'Tiếng Anh Cơ Bản',
    description: 'Bộ thẻ học từ vựng tiếng Anh cho người mới bắt đầu',
    cardCount: 150,
    owner: 'Nguyễn Văn A',
    createdAt: '2024-01-15',
    category: 'Ngôn ngữ',
    difficulty: 'Dễ'
  },
  {
    id: '2',
    name: 'Toán Đại Số',
    description: 'Các công thức và định lý quan trọng trong đại số',
    cardCount: 89,
    owner: 'Trần Thị B',
    createdAt: '2024-01-20',
    category: 'Toán học',
    difficulty: 'Trung bình'
  },
  {
    id: '3',
    name: 'Lịch Sử Việt Nam',
    description: 'Các sự kiện lịch sử quan trọng của Việt Nam',
    cardCount: 200,
    owner: 'Lê Văn C',
    createdAt: '2024-01-10',
    category: 'Lịch sử',
    difficulty: 'Khó'
  },
  {
    id: '4',
    name: 'Hóa Học Hữu Cơ',
    description: 'Các phản ứng và hợp chất hữu cơ quan trọng',
    cardCount: 120,
    owner: 'Phạm Thị D',
    createdAt: '2024-01-25',
    category: 'Hóa học',
    difficulty: 'Khó'
  },
  {
    id: '5',
    name: 'Sinh Học Phân Tử',
    description: 'Kiến thức cơ bản về gen và ADN',
    cardCount: 75,
    owner: 'Hoàng Văn E',
    createdAt: '2024-01-18',
    category: 'Sinh học',
    difficulty: 'Trung bình'
  },
  {
    id: '6',
    name: 'Vật Lý Lượng Tử',
    description: 'Các nguyên lý cơ bản của vật lý lượng tử',
    cardCount: 95,
    owner: 'Đỗ Thị F',
    createdAt: '2024-01-22',
    category: 'Vật lý',
    difficulty: 'Khó'
  }
]

const sortOptions: SortOption[] = [
  { value: 'name', label: 'Tên thư viện' },
  { value: 'createdAt', label: 'Ngày tạo' },
  { value: 'cardCount', label: 'Số thẻ' },
  { value: 'category', label: 'Danh mục' }
]

const gridColumns: GridColumns = {
  default: 1,
  md: 2,
  lg: 3,
  xl: 4
}

const difficultyColors = {
  'Dễ': 'bg-green-100 text-green-800',
  'Trung bình': 'bg-yellow-100 text-yellow-800',
  'Khó': 'bg-red-100 text-red-800'
}

export default function LibrariesDemoPage() {
  const [isLoading, setIsLoading] = useState(true)

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const renderLibraryCard = (library: typeof mockLibraries[0]) => (
    <Card key={library.id} className="h-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2">{library.name}</CardTitle>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[library.difficulty as keyof typeof difficultyColors]}`}>
            {library.difficulty}
          </span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{library.description}</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Danh mục:</span>
            <span className="font-medium">{library.category}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Số thẻ:</span>
            <span className="font-medium">{library.cardCount} thẻ</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tạo bởi:</span>
            <span className="font-medium">{library.owner}</span>
          </div>
          <div className="flex gap-2 mt-4">
            <Button size="sm" className="flex-1">
              <BookOpen className="w-4 h-4 mr-1" />
              Học
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              <Users className="w-4 h-4 mr-1" />
              Chi tiết
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderLoading = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="h-full">
          <CardHeader className="pb-3">
            <div className="h-5 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                </div>
              ))}
              <div className="flex gap-2 mt-4">
                <div className="h-8 bg-gray-200 rounded animate-pulse flex-1" />
                <div className="h-8 bg-gray-200 rounded animate-pulse flex-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderEmpty = () => (
    <div className="text-center py-12">
      <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có thư viện nào</h3>
      <p className="text-gray-500 mb-4">Hãy tạo thư viện đầu tiên của bạn</p>
      <Button>
        <Plus className="w-4 h-4 mr-2" />
        Tạo thư viện mới
      </Button>
    </div>
  )

  const customSort = (items: typeof mockLibraries, sortBy: string, sortOrder: 'asc' | 'desc') => {
    return [...items].sort((a, b) => {
      let aVal: string | number
      let bVal: string | number

      switch (sortBy) {
        case 'name':
          aVal = a.name
          bVal = b.name
          break
        case 'createdAt':
          aVal = new Date(a.createdAt).getTime()
          bVal = new Date(b.createdAt).getTime()
          break
        case 'cardCount':
          aVal = a.cardCount
          bVal = b.cardCount
          break
        case 'category':
          aVal = a.category
          bVal = b.category
          break
        default:
          return 0
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }

  return (
    <Container className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Thư Viện Học Tập</h1>
        <p className="text-muted-foreground">
          Khám phá và học tập với hàng nghìn bộ thẻ ghi nhớ từ cộng đồng
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">2,847</p>
                <p className="text-sm text-muted-foreground">Thư viện</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">15,432</p>
                <p className="text-sm text-muted-foreground">Người dùng</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">98.5%</p>
                <p className="text-sm text-muted-foreground">Độ hài lòng</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Plus className="w-8 h-8 text-orange-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">+127</p>
                <p className="text-sm text-muted-foreground">Hôm nay</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Libraries List */}
      <CardListView
        data={mockLibraries}
        searchFields={['name', 'description', 'category', 'owner']}
        sortOptions={sortOptions}
        defaultSortBy="createdAt"
        defaultSortOrder="desc"
        viewMode="grid"
        gridColumns={gridColumns}
        renderItem={renderLibraryCard}
        renderEmpty={renderEmpty}
        renderLoading={renderLoading}
        isLoading={isLoading}
        searchPlaceholder="Tìm kiếm thư viện..."
        customSort={customSort}
      />
    </Container>
  )
}

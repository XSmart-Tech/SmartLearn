import { Container } from '@/shared/ui'
import { CardListView } from '@/shared/components'
import type { SortOption, GridColumns } from '@/shared/components'
import LibraryCardList from '@/features/libraries/components/LibraryCardList'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui'
import { BookOpen, TrendingUp, Library, Grid3X3, List } from 'lucide-react'

// Mock data cho demo
const mockProducts = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    price: 999,
    category: 'Electronics',
    description: 'Latest iPhone with advanced features',
    createdAt: '2024-01-15',
    inStock: true
  },
  {
    id: '2',
    name: 'MacBook Air M3',
    price: 1299,
    category: 'Electronics',
    description: 'Powerful laptop for professionals',
    createdAt: '2024-01-20',
    inStock: true
  },
  {
    id: '3',
    name: 'Wireless Headphones',
    price: 199,
    category: 'Audio',
    description: 'High-quality wireless headphones',
    createdAt: '2024-01-10',
    inStock: false
  },
  {
    id: '4',
    name: 'Smart Watch',
    price: 299,
    category: 'Wearables',
    description: 'Fitness tracking and notifications',
    createdAt: '2024-01-25',
    inStock: true
  }
]

const productSortOptions: SortOption[] = [
  { value: 'name', label: 'Tên sản phẩm' },
  { value: 'price', label: 'Giá' },
  { value: 'createdAt', label: 'Ngày tạo' },
  { value: 'category', label: 'Danh mục' }
]

const gridColumns: GridColumns = {
  default: 1,
  md: 2,
  lg: 3,
  xl: 4
}

export default function ComponentsShowcasePage() {
  const renderProduct = (product: typeof mockProducts[0]) => (
    <Card key={product.id} className="h-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{product.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{product.category}</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <p className="text-2xl font-bold text-green-600">${product.price}</p>
          <p className="text-sm">{product.description}</p>
          <div className="flex items-center justify-between">
            <span className={`px-2 py-1 rounded text-xs ${
              product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {product.inStock ? 'Còn hàng' : 'Hết hàng'}
            </span>
            <Button size="sm">Thêm vào giỏ</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const customSort = (items: typeof mockProducts, sortBy: string, sortOrder: 'asc' | 'desc') => {
    return [...items].sort((a, b) => {
      let aVal: string | number
      let bVal: string | number

      switch (sortBy) {
        case 'name':
          aVal = a.name.toLowerCase()
          bVal = b.name.toLowerCase()
          break
        case 'price':
          aVal = a.price
          bVal = b.price
          break
        case 'createdAt':
          aVal = new Date(a.createdAt).getTime()
          bVal = new Date(b.createdAt).getTime()
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

  const handleLibraryRemove = (library: { id: string; name: string }) => {
    console.log('Remove library:', library)
    // Handle library removal
  }

  return (
    <Container className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Components Showcase</h1>
        <p className="text-muted-foreground">
          Demo các component CardListView và LibraryCardList với tính năng tìm kiếm, sắp xếp, và grid tùy chỉnh
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Grid3X3 className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">CardListView</p>
                <p className="text-sm text-muted-foreground">Component chính</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Library className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">LibraryCardList</p>
                <p className="text-sm text-muted-foreground">Wrapper chuyên dụng</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <List className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">Tái sử dụng</p>
                <p className="text-sm text-muted-foreground">Đa dạng use cases</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-orange-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">Responsive</p>
                <p className="text-sm text-muted-foreground">Grid tùy chỉnh</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demo 1: CardListView với sản phẩm */}
      <div className="mb-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">1. CardListView - Danh sách sản phẩm</h2>
          <p className="text-muted-foreground">
            Component chính với tìm kiếm, sắp xếp, và chuyển đổi grid/list
          </p>
        </div>

        <CardListView
          data={mockProducts}
          searchFields={['name', 'category', 'description']}
          sortOptions={productSortOptions}
          defaultSortBy="createdAt"
          defaultSortOrder="desc"
          viewMode="grid"
          gridColumns={gridColumns}
          renderItem={renderProduct}
          searchPlaceholder="Tìm kiếm sản phẩm..."
          customSort={customSort}
        />
      </div>

      {/* Demo 2: LibraryCardList */}
      <div className="mb-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">2. LibraryCardList - Thư viện học tập</h2>
          <p className="text-muted-foreground">
            Wrapper chuyên dụng cho thư viện với permissions và actions
          </p>
        </div>

        <LibraryCardList
          onAskRemove={handleLibraryRemove}
          gridColumns={{ default: 1, md: 2, lg: 3, xl: 4 }}
        />
      </div>

      {/* Features Overview */}
      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Tính năng chính
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">🔍 Tìm kiếm & Lọc</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Tìm kiếm real-time</li>
                  <li>• Multiple search fields</li>
                  <li>• Debounced input</li>
                  <li>• Result counter</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">📊 Sắp xếp</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Multiple sort options</li>
                  <li>• ASC/DESC order</li>
                  <li>• Custom sort functions</li>
                  <li>• Date & string sorting</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">🎨 Hiển thị</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Grid/List toggle</li>
                  <li>• Responsive columns</li>
                  <li>• Custom grid layouts</li>
                  <li>• Loading skeletons</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">🔧 Tái sử dụng</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Generic TypeScript</li>
                  <li>• Custom render functions</li>
                  <li>• Flexible props</li>
                  <li>• Easy integration</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  )
}

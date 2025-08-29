import React from 'react'
import { CardListView } from '@/shared/components'
import type { SortOption, GridColumns } from '@/shared/components'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui'

// Example data types
interface Product {
  id: string
  name: string
  price: number
  category: string
  description: string
  createdAt: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
  lastLogin: string
}

// Example 1: Product List
const ProductListExample: React.FC = () => {
  const products: Product[] = [
    {
      id: '1',
      name: 'iPhone 15 Pro',
      price: 999,
      category: 'Electronics',
      description: 'Latest iPhone with advanced features',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'MacBook Air M3',
      price: 1299,
      category: 'Electronics',
      description: 'Powerful laptop for professionals',
      createdAt: '2024-01-10'
    },
    {
      id: '3',
      name: 'Wireless Headphones',
      price: 199,
      category: 'Audio',
      description: 'High-quality wireless headphones',
      createdAt: '2024-01-20'
    }
  ]

  const sortOptions: SortOption[] = [
    { value: 'name', label: 'Tên sản phẩm' },
    { value: 'price', label: 'Giá' },
    { value: 'createdAt', label: 'Ngày tạo' }
  ]

  const gridColumns: GridColumns = {
    default: 1,
    md: 2,
    lg: 3
  }

  const renderProduct = (product: Product) => (
    <Card key={product.id} className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">{product.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-2xl font-bold text-green-600">${product.price}</p>
          <p className="text-sm text-muted-foreground">{product.category}</p>
          <p className="text-sm">{product.description}</p>
          <div className="flex gap-2 mt-4">
            <Button size="sm">Xem chi tiết</Button>
            <Button size="sm" variant="outline">Thêm vào giỏ</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderEmpty = () => (
    <div className="text-center py-8">
      <p className="text-muted-foreground">Không có sản phẩm nào</p>
    </div>
  )

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Danh sách sản phẩm</h2>
      <CardListView
        data={products}
        searchFields={['name', 'category', 'description']}
        sortOptions={sortOptions}
        defaultSortBy="createdAt"
        defaultSortOrder="desc"
        viewMode="grid"
        gridColumns={gridColumns}
        renderItem={renderProduct}
        renderEmpty={renderEmpty}
        searchPlaceholder="Tìm kiếm sản phẩm..."
      />
    </div>
  )
}

// Example 2: User Management
const UserListExample: React.FC = () => {
  const users: User[] = [
    {
      id: '1',
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      role: 'Admin',
      lastLogin: '2024-01-20'
    },
    {
      id: '2',
      name: 'Trần Thị B',
      email: 'tranthib@example.com',
      role: 'User',
      lastLogin: '2024-01-19'
    },
    {
      id: '3',
      name: 'Lê Văn C',
      email: 'levanc@example.com',
      role: 'Moderator',
      lastLogin: '2024-01-18'
    }
  ]

  const sortOptions: SortOption[] = [
    { value: 'name', label: 'Tên' },
    { value: 'email', label: 'Email' },
    { value: 'role', label: 'Vai trò' },
    { value: 'lastLogin', label: 'Đăng nhập cuối' }
  ]

  const renderUser = (user: User) => (
    <Card key={user.id} className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">{user.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="text-sm">
            <span className="font-medium">Vai trò:</span> {user.role}
          </p>
          <p className="text-sm">
            <span className="font-medium">Đăng nhập cuối:</span> {user.lastLogin}
          </p>
          <div className="flex gap-2 mt-4">
            <Button size="sm">Chỉnh sửa</Button>
            <Button size="sm" variant="destructive">Xóa</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Quản lý người dùng</h2>
      <CardListView
        data={users}
        searchFields={['name', 'email']}
        sortOptions={sortOptions}
        defaultSortBy="name"
        viewMode="list"
        renderItem={renderUser}
        searchPlaceholder="Tìm kiếm người dùng..."
      />
    </div>
  )
}

// Example 3: Custom Sort Function
const CustomSortExample: React.FC = () => {
  const tasks = [
    { id: '1', title: 'Task A', priority: 'high', status: 'pending' },
    { id: '2', title: 'Task B', priority: 'low', status: 'completed' },
    { id: '3', title: 'Task C', priority: 'medium', status: 'in-progress' }
  ]

  const priorityOrder = { high: 3, medium: 2, low: 1 }
  const statusOrder = { pending: 1, 'in-progress': 2, completed: 3 }

  const customSort = (items: typeof tasks, sortBy: string, sortOrder: 'asc' | 'desc') => {
    return [...items].sort((a, b) => {
      let aVal: number
      let bVal: number

      if (sortBy === 'priority') {
        aVal = priorityOrder[a.priority as keyof typeof priorityOrder]
        bVal = priorityOrder[b.priority as keyof typeof priorityOrder]
      } else if (sortBy === 'status') {
        aVal = statusOrder[a.status as keyof typeof statusOrder]
        bVal = statusOrder[b.status as keyof typeof statusOrder]
      } else {
        aVal = a.title.charCodeAt(0)
        bVal = b.title.charCodeAt(0)
      }

      const comparison = aVal - bVal
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }

  const sortOptions: SortOption[] = [
    { value: 'title', label: 'Tiêu đề' },
    { value: 'priority', label: 'Độ ưu tiên' },
    { value: 'status', label: 'Trạng thái' }
  ]

  const renderTask = (task: typeof tasks[0]) => (
    <Card key={task.id} className="h-full">
      <CardContent className="p-4">
        <h3 className="font-medium">{task.title}</h3>
        <div className="flex gap-2 mt-2">
          <span className={`px-2 py-1 rounded text-xs ${
            task.priority === 'high' ? 'bg-red-100 text-red-800' :
            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {task.priority}
          </span>
          <span className={`px-2 py-1 rounded text-xs ${
            task.status === 'completed' ? 'bg-green-100 text-green-800' :
            task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {task.status}
          </span>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Danh sách công việc</h2>
      <CardListView
        data={tasks}
        searchFields={['title']}
        sortOptions={sortOptions}
        defaultSortBy="priority"
        defaultSortOrder="desc"
        viewMode="grid"
        gridColumns={{ default: 1, md: 2, lg: 4 }}
        renderItem={renderTask}
        customSort={customSort}
        searchPlaceholder="Tìm kiếm công việc..."
      />
    </div>
  )
}

// Main Example Component
const CardListViewExamples: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">CardListView Examples</h1>
        <p className="text-muted-foreground">
          Các ví dụ sử dụng component CardListView với các cấu hình khác nhau
        </p>
      </div>

      <ProductListExample />
      <hr className="my-8" />
      <UserListExample />
      <hr className="my-8" />
      <CustomSortExample />
    </div>
  )
}

export default CardListViewExamples

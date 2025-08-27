import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Trang không tồn tại</h1>
      <p className="mb-4">Đường dẫn bạn truy cập không tồn tại.</p>
      <div className="flex gap-4">
        <Link to="/" className="text-primary-600 underline">Quay về trang chủ</Link>
        <Link to="/app/settings" className="text-primary-600 underline">Trang Settings</Link>
      </div>
    </div>
  )
}

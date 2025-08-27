import { Outlet } from 'react-router-dom'

export default function LibraryLayout() {
  return (
    <div className="min-h-full p-4">
      <Outlet />
    </div>
  )
}
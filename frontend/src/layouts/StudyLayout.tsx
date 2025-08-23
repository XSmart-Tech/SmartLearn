import { Outlet } from 'react-router-dom'

export default function StudyLayout() {
  return (
    <div className="min-h-full p-4">
      <Outlet />
    </div>
  )
}
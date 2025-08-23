import { NavLink } from 'react-router-dom'

export default function Sidebar() {
  const link = (to: string, label: string) => (
    <NavLink to={to} className={({ isActive }) => `block rounded-xl px-3 py-2 text-sm ${isActive ? 'bg-gray-100 font-semibold' : ''}`}>{label}</NavLink>
  )
  return (
    <aside className="w-64 border-r p-3 space-y-1">
      {link('/app', 'Tổng quan')}
      {link('/app/libraries', 'Thư viện')}
      {link('/app/study', 'Học (SM-2)')}
      {link('/app/quiz', 'Quiz')}
    </aside>
  )
}
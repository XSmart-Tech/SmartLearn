import { Outlet } from 'react-router-dom'
import Header from '@/components/Header'

export default function HomeLayout() {
  return (
    <div className="min-h-full grid grid-rows-[auto,1fr]">
      <Header />
      <main className="p-4"><Outlet /></main>
    </div>
  )
}
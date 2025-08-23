import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <section className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-semibold">Học nhanh, nhớ lâu</h1>
      <p className="text-gray-600">Dự án flashcard với Firestore offline + cache-first (SWR), chia sẻ quyền Viewer/Editor, và cơ chế lặp lại ngắt quãng SM-2.</p>
      <div className="flex gap-2">
        <Link className="underline" to="/app">Vào Dashboard</Link>
      </div>
    </section>
  )
}
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { Button, H1, P, H3, Large, Small } from '@/components/ui'

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  function goIfAuth(path: string, message: string) {
    if (!user) {
      toast(message)
      return
    }
    navigate(path)
  }

  return (
    <section className="mx-auto max-w-6xl space-y-6 p-4">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm card-gradient">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <H1 className="text-left">Học nhanh, nhớ lâu</H1>
            <P className="text-left">
              Dự án flashcard với Firestore offline + cache-first (SWR), chia sẻ quyền Viewer/Editor, và cơ chế lặp lại ngắt quãng SM-2.
            </P>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => goIfAuth('/app', 'Vui lòng đăng nhập để vào Dashboard')}>Vào Dashboard</Button>
              <Button variant="outline" onClick={() => goIfAuth('/app/libraries', 'Vui lòng đăng nhập để duyệt thư viện')}>Duyệt Thư viện</Button>
            </div>
          </div>
          <div className="mt-4 grid w-full grid-cols-2 gap-3 md:mt-0 md:w-1/3">
            <div className="rounded-md border border-border bg-popover p-3 text-sm">
              <Large>Offline-ready</Large>
              <Small>Sẵn sàng cho lặp lại.</Small>
            </div>
            <div className="rounded-md border border-border bg-popover p-3 text-sm">
              <div className="font-semibold">SM-2 Spaced Repetition</div>
              <div className="text-xs text-muted-foreground">Học hiệu quả nhất.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <H3>Tạo thư viện</H3>
          <P>Tạo, chia sẻ và quản lý bộ thẻ nhanh chóng.</P>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <H3>Học</H3>
          <P>Lịch trình ôn tập tự động theo SM-2.</P>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <H3>Chia sẻ</H3>
          <P>Invite, share, and collaborate with teammates.</P>
        </div>
      </div>
    </section>
  )
}
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import {
  Button,
  H1,
  P,
  H3,
  Small,
  Card,
  CardContent,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui'
import { ArrowRight, Share2, BookOpen, Brain, Zap } from 'lucide-react'

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
    <section className="relative mx-auto max-w-6xl space-y-10 p-4">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_50%_-10%,rgba(99,102,241,0.18),transparent),radial-gradient(60%_40%_at_80%_10%,rgba(16,185,129,0.16),transparent)]"
        aria-hidden="true"
      />

      <Card className="rounded-2xl border bg-white/70 p-8 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <CardContent>
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <H1 className="text-left leading-tight">
                <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500 bg-clip-text text-transparent">
                  Flashcard cho việc học của bạn
                </span>
              </H1>
              <P className="mt-3 text-left text-muted-foreground">
                Công cụ flashcard tối giản, tập trung vào tốc độ tạo thẻ và sự ổn định.
              </P>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs text-muted-foreground">
                  <Zap className="h-3.5 w-3.5" /> Dùng khi không có mạng
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs text-muted-foreground">
                  <Brain className="h-3.5 w-3.5" /> Lặp lại ngắt quãng (SRS)
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs text-muted-foreground">
                  <Share2 className="h-3.5 w-3.5" /> Chia sẻ thời gian thực
                </span>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => goIfAuth('/app', 'Vui lòng đăng nhập để vào Dashboard')}>
                  Bắt đầu học <ArrowRight className=" h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => goIfAuth('/app/libraries', 'Vui lòng đăng nhập để duyệt thư viện')}
                >
                  Xem Thư viện
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-4">
        <Card className="rounded-xl border p-4 text-center">
          <div className="text-2xl font-semibold">5 phút</div>
          <Small className="text-muted-foreground">để tạo ~50 thẻ*</Small>
        </Card>
        <Card className="rounded-xl border p-4 text-center">
          <div className="text-2xl font-semibold">3 phút/ngày</div>
          <Small className="text-muted-foreground">nhắc ôn tự động</Small>
        </Card>
        <Card className="rounded-xl border p-4 text-center">
          <div className="text-2xl font-semibold">Realtime</div>
          <Small className="text-muted-foreground">cộng tác mượt mà</Small>
        </Card>
        <Card className="rounded-xl border p-4 text-center">
          <div className="text-2xl font-semibold">Offline</div>
          <Small className="text-muted-foreground">vẫn hoạt động ổn định</Small>
        </Card>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <H3 className="mb-3">Cách hoạt động</H3>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border p-4">
            <div className="mb-2 font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Tạo thẻ
            </div>
            <P className="text-muted-foreground">Viết nhanh mặt trước/sau, thêm gợi ý.</P>
          </div>
          <div className="rounded-lg border p-4">
            <div className="mb-2 font-medium flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Ôn theo SRS
            </div>
            <P className="text-muted-foreground">Hệ thống lên lịch nhắc ôn theo mức độ nhớ.</P>
          </div>
          <div className="rounded-lg border p-4">
            <div className="mb-2 font-medium flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Chia sẻ
            </div>
            <P className="text-muted-foreground">Mời bạn bè/đồng đội và học chung theo thời gian thực.</P>
          </div>
        </div>
      </div>

      <Card className="rounded-2xl border bg-white p-6 shadow-sm">
        <CardContent>
          <H3 className="mb-3">Câu hỏi thường gặp</H3>
          <div className="space-y-2">
            <Collapsible>
              <div className="group rounded-md border p-3">
                <CollapsibleTrigger className="cursor-pointer font-medium">Tôi có thể dùng khi offline?</CollapsibleTrigger>
                <CollapsibleContent>
                  <P className="mt-2 text-muted-foreground">Có. Ứng dụng lưu cục bộ và tự đồng bộ khi có mạng.</P>
                </CollapsibleContent>
              </div>
            </Collapsible>

            <Collapsible>
              <div className="group rounded-md border p-3">
                <CollapsibleTrigger className="cursor-pointer font-medium">SRS hoạt động thế nào?</CollapsibleTrigger>
                <CollapsibleContent>
                  <P className="mt-2 text-muted-foreground">Bạn sẽ được nhắc ôn theo khoảng cách tăng dần dựa trên mức nhớ.</P>
                </CollapsibleContent>
              </div>
            </Collapsible>

            <Collapsible>
              <div className="group rounded-md border p-3">
                <CollapsibleTrigger className="cursor-pointer font-medium">Có thể chia sẻ với người khác?</CollapsibleTrigger>
                <CollapsibleContent>
                  <P className="mt-2 text-muted-foreground">Có. Mời người khác vào thư viện để cùng học và quản lý.</P>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-2xl border bg-gradient-to-r from-indigo-50 to-emerald-50 p-6 text-center">
        <H3>Sẵn sàng bắt đầu?</H3>
        <P className="text-muted-foreground">Tạo thư viện đầu tiên và thử học 3 phút mỗi ngày.</P>
        <div className="mt-3 flex justify-center gap-2">
          <Button onClick={() => goIfAuth('/app', 'Vui lòng đăng nhập để vào Dashboard')}>Bắt đầu</Button>
          <Button variant="outline" onClick={() => goIfAuth('/app/libraries', 'Vui lòng đăng nhập để duyệt thư viện')}>Duyệt Thư viện</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <H3 className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-500" /> Tạo thư viện
          </H3>
          <P className="mt-1 text-muted-foreground">Tạo, sắp xếp và quản lý bộ thẻ theo chủ đề.</P>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <H3 className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-emerald-500" /> Học hiệu quả
          </H3>
          <P className="mt-1 text-muted-foreground">Ôn tập đều đặn với SRS để tối đa hóa khả năng ghi nhớ.</P>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <H3 className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-violet-500" /> Cộng tác linh hoạt
          </H3>
          <P className="mt-1 text-muted-foreground">Mời bạn học cùng, chia sẻ quyền và học chung theo thời gian thực.</P>
        </div>
      </div>
    </section>
  )
}

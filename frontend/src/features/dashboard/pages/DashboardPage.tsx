import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Container,
} from '@/shared/ui'
import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/shared/store'
import { useFetchLibrariesQuery, useCreateLibraryMutation } from '@/shared/store/apiSlice'
import { useRealtimeLibraries } from '@/shared/hooks/useRealtime'
import LibraryDialog from '@/features/libraries/components/LibraryDialog'
// import card import utilities removed from this page; import flow moved elsewhere
import { getRecentLibraryIds, addRecentLibrary } from '@/shared/lib/recent'
import { useNavigate } from 'react-router-dom'
import PageHeader from '@/shared/components/PageHeader'

export default function DashboardPage() {
  const navigate = useNavigate()
  const uid = useSelector((s: RootState) => s.auth.user?.uid ?? null)

  // Use RTK Query for fetching libraries
  const { data: libraries = [] } = useFetchLibrariesQuery(uid ?? '', {
    skip: !uid,
  })

  // Use realtime updates only when user is authenticated
  useRealtimeLibraries(uid ?? null)

  // Use RTK Query mutation for creating libraries
  const [createLibraryMutation] = useCreateLibraryMutation()

  const [recentLibraries, setRecentLibraries] = useState(() =>
    libraries
      .slice()
      .sort((a, b) => (Number(b.updatedAt ?? b.createdAt ?? 0) - Number(a.updatedAt ?? a.createdAt ?? 0)))
      .slice(0, 3)
  )

  useEffect(() => {
    let mounted = true
    void (async () => {
      const ids = await getRecentLibraryIds(3)
      if (!mounted) return
      if (ids.length === 0) {
        setRecentLibraries(
          libraries
            .slice()
            .sort((a, b) => (Number(b.updatedAt ?? b.createdAt ?? 0) - Number(a.updatedAt ?? a.createdAt ?? 0)))
            .slice(0, 3)
        )
        return
      }
      const mapped = ids.map((id) => libraries.find((l) => l.id === id)).filter(Boolean)
      if (mapped.length === 0) {
        setRecentLibraries(
          libraries
            .slice()
            .sort((a, b) => (Number(b.updatedAt ?? b.createdAt ?? 0) - Number(a.updatedAt ?? a.createdAt ?? 0)))
            .slice(0, 3)
        )
      } else {
        setRecentLibraries(mapped as typeof libraries)
      }
    })()
    return () => { mounted = false }
    // re-run when libraries change so mapping stays fresh
  }, [libraries])

  const onCreateLibrary = useCallback(
    async (name: string, description?: string) => {
      if (!uid) return navigate('/app/settings')
      const n = name.trim()
      if (!n) return
      await createLibraryMutation({ uid, name: n, description })
    },
    [createLibraryMutation, uid, navigate]
  )

  // import functionality removed from dashboard; keep import implementation in Libraries page or a dedicated flow

  const onStartStudy = useCallback(async () => {
    // Prefer recent library from IndexedDB, fallback to first library in list
    try {
      const ids = await getRecentLibraryIds(1)
      let target = ids && ids.length > 0 ? ids[0] : libraries[0]?.id
      if (!target && !uid) return navigate('/app/settings')
      if (!target && libraries.length > 0) target = libraries[0].id
      if (target) {
        await addRecentLibrary(target)
      }
    } catch {
      if (libraries[0]?.id) {
        await addRecentLibrary(libraries[0].id)
      }
    }
    navigate('/app/study')
  }, [libraries, uid, navigate])

  return (
    <Container className="space-y-4">
      <PageHeader
        title="Trang chủ"
        description="Khám phá học tập của bạn"
      />

      {/* Main row: Quick Actions + Recent libraries */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent libraries</CardTitle>
            <CardDescription>Latest libraries you accessed or created</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {recentLibraries.map((lib) => (
                <li key={lib.id} className="py-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{lib.name}</div>
                    <div className="text-sm text-muted-foreground truncate">{lib.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">{new Date(lib.updatedAt ?? lib.createdAt ?? 0).toLocaleDateString()}</div>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/app/libraries/${lib.id}`)}>Open</Button>
                  </div>
                </li>
              ))}
              {recentLibraries.length === 0 && (
                <li className="py-3 text-sm text-muted-foreground">Không có thư viện gần đây — tạo thư viện mới để bắt đầu.</li>
              )}
            </ul>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/app/libraries')}>Go to libraries</Button>
          </CardFooter>
        </Card>
        <Card className="shadow lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2 flex-wrap">
              <LibraryDialog mode="create" onCreate={onCreateLibrary} disabled={!uid} />
              <Button variant="ghost" onClick={onStartStudy}>Start study</Button>
            </div>
            <div className="text-sm text-muted-foreground">Tip: use recent libraries to resume quickly.</div>
          </CardContent>
        </Card>


      </section>
    </Container>
  )
}

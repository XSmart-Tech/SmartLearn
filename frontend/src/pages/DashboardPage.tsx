import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Large,
  Small,
} from '@/components/ui'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '@/store'
import { createLibrary } from '@/store/librariesSlice'
import CreateLibraryDialog from '@/components/CreateLibraryDialog'
// import card import utilities removed from this page; import flow moved elsewhere
import { getRecentLibraryIds, addRecentLibrary } from '@/lib/recent'
import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const uid = useSelector((s: RootState) => s.auth.user?.uid ?? null)

  const libraries = useSelector((s: RootState) => s.libraries.order.map((id) => s.libraries.items[id]).filter(Boolean))

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
    async (name?: string) => {
      if (!uid) return navigate('/app/settings')
      const n = name?.trim()
      if (!n) return
      await dispatch(createLibrary({ uid, name: n }))
    },
    [dispatch, uid, navigate]
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
    <div className="space-y-4 px-4 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <Large>Trang chủ</Large>
          <Small className="block text-muted-foreground">
            Khám phá học tập của bạn
          </Small>
        </div>
      </div>

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
              <CreateLibraryDialog onCreate={onCreateLibrary} disabled={!uid} />
              <Button variant="ghost" onClick={onStartStudy}>Start study</Button>
            </div>
            <div className="text-sm text-muted-foreground">Tip: use recent libraries to resume quickly.</div>
          </CardContent>
        </Card>


      </section>
    </div>
  )
}
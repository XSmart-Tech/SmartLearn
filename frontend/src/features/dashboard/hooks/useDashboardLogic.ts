import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/shared/store'
import { useFetchLibrariesQuery, useCreateLibraryMutation } from '@/shared/store/apiSlice'
import { useRealtimeLibraries } from '@/shared/hooks'
import { getRecentLibraryIds, addRecentLibrary } from '@/shared/lib/recent'
import { useNavigate } from 'react-router-dom'
import type { Library } from '@/shared/lib/types'

export function useDashboardLogic() {
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

  const [recentLibraries, setRecentLibraries] = useState<Library[]>(() =>
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
        setRecentLibraries(mapped as Library[])
      }
    })()
    return () => { mounted = false }
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

  return {
    libraries,
    recentLibraries,
    uid,
    onCreateLibrary,
    onStartStudy,
    navigate
  }
}

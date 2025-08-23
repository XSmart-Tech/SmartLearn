import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import type { RootState, AppDispatch } from '@/store'
import { createLibrary, fetchLibraries, removeLibrary } from '@/store/librariesSlice'
import { Button, Input, Small, Large } from '@/components/ui'

export default function LibraryList() {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((s: RootState) => s.auth)
  const libs = useSelector((s: RootState) => s.libraries.order.map(id => s.libraries.items[id]))
  const [name, setName] = useState('')

  useEffect(() => { if (user?.uid) dispatch(fetchLibraries(user.uid)) }, [dispatch, user?.uid])

  const add = async () => {
    if (!user?.uid || !name.trim()) return
    await dispatch(createLibrary({ uid: user.uid, name: name.trim() }))
    setName('')
  }

  return (
    <section className="space-y-3">
      <div className="flex gap-2">
        <Input placeholder="Tên thư viện" value={name} onChange={(e) => setName(e.target.value)} />
        <Button onClick={add}>Tạo</Button>
      </div>
      <ul className="space-y-2">
        {libs.map(lib => (
          <li key={lib.id} className="flex items-center justify-between rounded-xl border p-3">
            <div>
              <Link to={`/app/libraries/${lib.id}`} className="font-medium underline"><Large className="inline">{lib.name}</Large></Link>
              {lib.description && <Small>{lib.description}</Small>}
            </div>
            <div className="flex gap-2">
              <Link to={`/app/libraries/${lib.id}`} className="text-sm underline">Chi tiết</Link>
              {user?.uid === lib.ownerId && (
                <Button onClick={() => dispatch(removeLibrary(lib.id))}>Xóa</Button>
              )}
            </div>
          </li>
        ))}
  {libs.length === 0 && <li><Small className="text-gray-500">Chưa có thư viện nào.</Small></li>}
      </ul>
    </section>
  )
}
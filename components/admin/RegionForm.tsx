'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Region } from '@prisma/client'

interface RegionFormProps {
  region?: Region
}

export default function RegionForm({ region }: RegionFormProps) {
  const router = useRouter()
  const [name, setName] = useState(region?.name || '')
  const [slug, setSlug] = useState(region?.slug || '')
  const [description, setDescription] = useState(region?.description || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const url = region
        ? `/api/admin/regions/${region.id}`
        : '/api/admin/regions'
      const method = region ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          slug,
          description,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Ошибка при сохранении')
        return
      }

      router.push('/admin/regions')
      router.refresh()
    } catch (err) {
      setError('Ошибка при сохранении. Попробуйте еще раз.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">Название филиала *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">URL (slug) *</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          className="input"
          pattern="[a-z0-9\-]+"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Описание</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="textarea"
        />
      </div>

      <div className="flex space-x-4">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Сохранение...' : 'Сохранить'}
        </button>
        <Link href="/admin/regions" className="btn btn-secondary">
          Отмена
        </Link>
      </div>
    </form>
  )
}


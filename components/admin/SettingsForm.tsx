'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface SettingsFormProps {
  settings: Record<string, string>
}

export default function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter()
  const [heroBackground, setHeroBackground] = useState(
    settings.heroBackground || ''
  )
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          heroBackground,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при сохранении')
      }

      setMessage({
        type: 'success',
        text: 'Настройки успешно сохранены',
      })

      router.refresh()
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Ошибка при сохранении настроек',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-6 max-w-2xl">
      {message && (
        <div
          className={`px-4 py-3 rounded ${
            message.type === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">
          Изображение-подложка для главной страницы (URL)
        </label>
        <input
          type="url"
          value={heroBackground}
          onChange={(e) => setHeroBackground(e.target.value)}
          className="input"
          placeholder="https://example.com/image.jpg"
        />
        <p className="text-sm text-gray-500 mt-1">
          URL изображения, которое будет использоваться как фон на главной
          странице
        </p>
        {heroBackground && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Предпросмотр:</p>
            <div
              className="w-full h-48 rounded-lg bg-cover bg-center bg-gray-200 border"
              style={{ backgroundImage: `url(${heroBackground})` }}
            />
          </div>
        )}
      </div>

      <div className="flex space-x-4">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Сохранение...' : 'Сохранить настройки'}
        </button>
      </div>
    </form>
  )
}



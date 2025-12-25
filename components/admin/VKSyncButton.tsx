'use client'

import { useState } from 'react'

export default function VKSyncButton() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const handleSync = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/vk/sync', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка синхронизации')
      }

      setMessage({
        type: 'success',
        text: `Синхронизация завершена. Импортировано новых постов: ${data.newPostsCount}`,
      })

      // Обновляем страницу через 2 секунды
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Ошибка при синхронизации',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full sm:w-auto">
      <button
        onClick={handleSync}
        disabled={loading}
        className="btn btn-secondary w-full sm:w-auto"
      >
        {loading ? 'Синхронизация...' : 'Синхронизировать с VK'}
      </button>
      {message && (
        <div
          className={`mt-2 px-4 py-2 rounded ${
            message.type === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  )
}


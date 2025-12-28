'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DeleteDocumentButtonProps {
  documentId: string
  documentTitle: string
}

export default function DeleteDocumentButton({
  documentId,
  documentTitle,
}: DeleteDocumentButtonProps) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/documents/${documentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Ошибка при удалении')
      }

      router.refresh()
      router.push('/admin/documents')
    } catch (err: any) {
      setError(err.message || 'Ошибка при удалении')
      setLoading(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          Удалить "{documentTitle.substring(0, 30)}..."?
        </span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Удаление...' : 'Да'}
        </button>
        <button
          onClick={() => {
            setShowConfirm(false)
            setError('')
          }}
          disabled={loading}
          className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Отмена
        </button>
        {error && (
          <span className="text-sm text-red-600">{error}</span>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-red-600 hover:text-red-700 text-sm font-medium"
    >
      Удалить
    </button>
  )
}


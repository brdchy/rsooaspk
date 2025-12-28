'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Document } from '@prisma/client'

interface DocumentFormProps {
  document?: Document
}

export default function DocumentForm({ document }: DocumentFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(document?.title || '')
  const [slug, setSlug] = useState(document?.slug || '')
  const [category, setCategory] = useState(document?.category || 'ministry')
  const [content, setContent] = useState(document?.content || '')
  const [fileUrl, setFileUrl] = useState(document?.fileUrl || '')
  const [published, setPublished] = useState(document?.published ?? true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const url = document
        ? `/api/admin/documents/${document.id}`
        : '/api/admin/documents'
      const method = document ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          slug,
          category,
          content,
          fileUrl,
          published,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Ошибка при сохранении')
        return
      }

      router.push('/admin/documents')
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
        <label className="block text-sm font-medium mb-2">Название *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
        <label className="block text-sm font-medium mb-2">Категория *</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className="input"
        >
          <option value="ministry">Министерство спорта</option>
          <option value="decisions">Решения руководящих органов</option>
          <option value="teams">Сборные команды</option>
          <option value="samples">Образцы документов</option>
          <option value="charter">Устав</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">URL файла</label>
        <input
          type="url"
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          className="input"
          placeholder="https://example.com/document.pdf"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Содержание</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="textarea"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="published"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="published" className="ml-2 text-sm font-medium">
          Опубликовать
        </label>
      </div>

      <div className="flex space-x-4">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Сохранение...' : 'Сохранить'}
        </button>
        <Link href="/admin/documents" className="btn btn-secondary">
          Отмена
        </Link>
      </div>
    </form>
  )
}



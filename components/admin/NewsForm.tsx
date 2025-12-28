'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { News } from '@prisma/client'

interface NewsFormProps {
  news?: News
}

export default function NewsForm({ news }: NewsFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(news?.title || '')
  const [slug, setSlug] = useState(news?.slug || '')
  const [content, setContent] = useState(news?.content || '')
  const [excerpt, setExcerpt] = useState(news?.excerpt || '')
  const [image, setImage] = useState(news?.image || '')
  const [published, setPublished] = useState(news?.published ?? true) // По умолчанию опубликовано
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!news && title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-zа-я0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setSlug(generatedSlug)
    }
  }, [title, news])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const startTime = Date.now()
    console.log('[FORM] ===== NewsForm Submit - START =====')
    console.log('[FORM] Timestamp:', new Date().toISOString())
    console.log('[FORM] Режим:', news ? 'EDIT' : 'CREATE')
    
    setError('')
    setLoading(true)

    try {
      const url = news ? `/api/admin/news/${news.id}` : '/api/admin/news'
      const method = news ? 'PUT' : 'POST'

      const formData = {
        title,
        slug,
        content,
        excerpt,
        image,
        published,
        publishedAt: published ? new Date().toISOString() : null,
      }

      console.log('[FORM] Данные формы:', {
        title: title.substring(0, 50) + (title.length > 50 ? '...' : ''),
        slug,
        contentLength: content.length,
        excerptLength: excerpt.length,
        image: image || 'не указано',
        published,
        publishedAt: formData.publishedAt,
      })

      console.log('[FORM] Отправка запроса:', { url, method })
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      console.log('[FORM] Ответ получен:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      })

      const data = await response.json()
      console.log('[FORM] Данные ответа:', data)

      if (!response.ok) {
        const errorMessage = data.error || 'Ошибка при сохранении'
        const errorDetails = data.details ? ` (${data.details})` : ''
        const errorCode = data.code ? ` [${data.code}]` : ''
        const fullError = `${errorMessage}${errorDetails}${errorCode}`
        
        console.error('[FORM] ✗ Ошибка API:', {
          status: response.status,
          error: errorMessage,
          details: data.details,
          code: data.code,
          fullResponse: data,
        })
        
        setError(fullError)
        return
      }

      console.log('[FORM] ✓ Успешно сохранено:', {
        id: data.id,
        slug: data.slug,
      })
      console.log('[FORM] ===== NewsForm Submit - SUCCESS =====')
      console.log('[FORM] Время выполнения:', Date.now() - startTime, 'ms')

      router.push('/admin/news')
      router.refresh()
    } catch (err: any) {
      console.error('[FORM] ===== NewsForm Submit - ERROR =====')
      console.error('[FORM] Тип ошибки:', err?.constructor?.name || 'Unknown')
      console.error('[FORM] Сообщение:', err?.message)
      console.error('[FORM] Stack:', err?.stack)
      console.error('[FORM] Полная ошибка:', err)
      console.error('[FORM] Время выполнения до ошибки:', Date.now() - startTime, 'ms')
      console.error('[FORM] ===== NewsForm Submit - END (ERROR) =====')
      
      setError(`Ошибка при сохранении: ${err?.message || 'Неизвестная ошибка'}`)
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
        <label className="block text-sm font-medium mb-2">
          Заголовок *
        </label>
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
        <p className="text-sm text-gray-500 mt-1">
          Только строчные буквы, цифры и дефисы
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Краткое описание</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={3}
          className="textarea"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Содержание *
          <span className="text-xs text-gray-500 ml-2">
            (поддерживается HTML)
          </span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={15}
          className="textarea font-mono text-sm"
          placeholder="Введите текст новости. Можно использовать HTML разметку."
        />
        <p className="text-xs text-gray-500 mt-1">
          Используйте HTML теги для форматирования: &lt;p&gt;, &lt;strong&gt;,
          &lt;br&gt;, &lt;ul&gt;, &lt;li&gt; и т.д.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          URL изображения
        </label>
        <input
          type="url"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="input"
          placeholder="https://example.com/image.jpg"
        />
        {image && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Предпросмотр:</p>
            <div className="relative w-full h-48 bg-gray-200 rounded-lg overflow-hidden border">
              <img
                src={image}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          </div>
        )}
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
        <Link href="/admin/news" className="btn btn-secondary">
          Отмена
        </Link>
      </div>
    </form>
  )
}


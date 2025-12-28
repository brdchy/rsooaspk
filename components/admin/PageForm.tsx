'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Page } from '@prisma/client'

interface PageFormProps {
  page?: Page
}

export default function PageForm({ page }: PageFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(page?.title || '')
  const [slug, setSlug] = useState(page?.slug || '')
  const [section, setSection] = useState(page?.section || 'federation')
  const [subsection, setSubsection] = useState(page?.subsection || '')
  const [content, setContent] = useState(page?.content || '')
  const [published, setPublished] = useState(page?.published ?? true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [subsections, setSubsections] = useState<string[]>([])
  const [loadingSubsections, setLoadingSubsections] = useState(false)
  const [subsectionInput, setSubsectionInput] = useState(page?.subsection || '')
  const [isCustomSubsection, setIsCustomSubsection] = useState(false)

  // Инициализация при монтировании компонента
  useEffect(() => {
    if (page?.subsection) {
      setSubsectionInput(page.subsection)
      setSubsection(page.subsection)
    }
  }, [])

  // Загружаем подразделы при изменении раздела
  useEffect(() => {
    const fetchSubsections = async () => {
      if (!section) return

      setLoadingSubsections(true)
      try {
        const response = await fetch(
          `/api/admin/pages/subsections?section=${encodeURIComponent(section)}`
        )
        if (response.ok) {
          const data = await response.json()
          setSubsections(data)
          
          // Если редактируем существующую страницу, проверяем её подраздел
          if (page?.subsection && page.section === section) {
            const currentSub = page.subsection
            if (data.includes(currentSub)) {
              // Подраздел существует в базе
              setIsCustomSubsection(false)
            } else {
              // Подраздел новый
              setIsCustomSubsection(true)
            }
          } else if (!page) {
            // Сбрасываем при создании новой страницы
            setSubsection('')
            setSubsectionInput('')
            setIsCustomSubsection(false)
          }
        }
      } catch (error) {
        console.error('Error fetching subsections:', error)
      } finally {
        setLoadingSubsections(false)
      }
    }

    fetchSubsections()
  }, [section])

  const handleSubsectionChange = (value: string) => {
    if (value === '__custom__') {
      setIsCustomSubsection(true)
      setSubsectionInput('')
      setSubsection('')
    } else if (value === '') {
      setIsCustomSubsection(false)
      setSubsectionInput('')
      setSubsection('')
    } else {
      setIsCustomSubsection(false)
      setSubsectionInput(value)
      setSubsection(value)
    }
  }

  const handleCustomSubsectionChange = (value: string) => {
    setSubsectionInput(value)
    setSubsection(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const url = page ? `/api/admin/pages/${page.id}` : '/api/admin/pages'
      const method = page ? 'PUT' : 'POST'

      const finalSubsection = subsection || null

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          slug,
          section,
          subsection: finalSubsection,
          content,
          published,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Ошибка при сохранении')
        return
      }

      router.push('/admin/pages')
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
        <label className="block text-sm font-medium mb-2">Раздел *</label>
        <select
          value={section}
          onChange={(e) => setSection(e.target.value)}
          required
          className="input"
        >
          <option value="federation">Федерация</option>
          <option value="about-sport">О спорте</option>
          <option value="refereeing">Судейство</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Подраздел
          <span className="text-xs text-gray-500 ml-2">(необязательно)</span>
        </label>
        <div className="space-y-2">
          {loadingSubsections ? (
            <div className="text-sm text-gray-500">Загрузка подразделов...</div>
          ) : (
            <>
              {subsections.length > 0 ? (
                <>
                  <select
                    value={
                      isCustomSubsection
                        ? '__custom__'
                        : subsectionInput || ''
                    }
                    onChange={(e) => handleSubsectionChange(e.target.value)}
                    className="input"
                    disabled={loadingSubsections}
                  >
                    <option value="">-- Без подраздела --</option>
                    {subsections.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                    <option value="__custom__">
                      + Добавить новый подраздел
                    </option>
                  </select>
                  {isCustomSubsection && (
                    <input
                      type="text"
                      value={subsectionInput}
                      onChange={(e) =>
                        handleCustomSubsectionChange(e.target.value)
                      }
                      className="input mt-2"
                      placeholder="Введите новый подраздел (например: regulations, history)"
                      autoFocus
                    />
                  )}
                </>
              ) : (
                <input
                  type="text"
                  value={subsectionInput}
                  onChange={(e) => handleCustomSubsectionChange(e.target.value)}
                  className="input"
                  placeholder="Введите подраздел (например: regulations, history)"
                />
              )}
            </>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Выберите существующий подраздел или введите новый. Используйте латинские
          буквы и дефисы (например: regulations, president, history).
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Содержание *</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={15}
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
        <Link href="/admin/pages" className="btn btn-secondary">
          Отмена
        </Link>
      </div>
    </form>
  )
}


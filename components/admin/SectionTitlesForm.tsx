'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { predefinedSubsections } from '@/lib/subsections'

interface SectionTitlesFormProps {
  initialData: {
    sectionTitles: Record<string, string>
    subsectionTitles: Record<string, Record<string, string>>
  }
}

const sectionKeys = [
  'federation',
  'about-sport',
  'refereeing',
  'events',
  'documents',
]

export default function SectionTitlesForm({ initialData }: SectionTitlesFormProps) {
  const router = useRouter()
  const [sectionTitles, setSectionTitles] = useState(initialData.sectionTitles)
  const [subsectionTitles, setSubsectionTitles] = useState(
    initialData.subsectionTitles
  )
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  )

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const handleSectionTitleChange = (section: string, value: string) => {
    setSectionTitles({
      ...sectionTitles,
      [section]: value,
    })
  }

  const handleSubsectionTitleChange = (
    section: string,
    subsection: string,
    value: string
  ) => {
    setSubsectionTitles({
      ...subsectionTitles,
      [section]: {
        ...(subsectionTitles[section] || {}),
        [subsection]: value,
      },
    })
  }

  const handleAddSubsection = (section: string) => {
    const newKey = prompt('Введите ключ нового подраздела (например: new-section):')
    if (newKey && newKey.trim()) {
      const trimmedKey = newKey.trim()
      handleSubsectionTitleChange(section, trimmedKey, '')
    }
  }

  const handleDeleteSubsection = (section: string, subsection: string) => {
    if (
      confirm(
        `Удалить подраздел "${subsectionTitles[section]?.[subsection] || subsection}"?`
      )
    ) {
      const newSubsections = { ...subsectionTitles }
      if (newSubsections[section]) {
        delete newSubsections[section][subsection]
        setSubsectionTitles(newSubsections)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/section-titles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionTitles,
          subsectionTitles,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при сохранении')
      }

      setMessage({
        type: 'success',
        text: 'Названия успешно сохранены! Изменения появятся после обновления страниц.',
      })

      router.refresh()
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Ошибка при сохранении названий',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <div className="space-y-4">
        {sectionKeys.map((sectionKey) => {
          const subsections = predefinedSubsections[sectionKey] || []
          const isExpanded = expandedSections.has(sectionKey)
          const sectionSubsections = subsectionTitles[sectionKey] || {}

          return (
            <div key={sectionKey} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold capitalize">
                  Раздел: {sectionKey}
                </h2>
                <button
                  type="button"
                  onClick={() => toggleSection(sectionKey)}
                  className="text-primary-600 hover:text-primary-700 text-sm"
                >
                  {isExpanded ? 'Свернуть' : 'Развернуть'}
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Название раздела
                </label>
                <input
                  type="text"
                  value={sectionTitles[sectionKey] || ''}
                  onChange={(e) =>
                    handleSectionTitleChange(sectionKey, e.target.value)
                  }
                  className="input w-full"
                  placeholder={`Название для ${sectionKey}`}
                />
              </div>

              {isExpanded && (
                <div className="space-y-3 mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Подразделы</h3>
                    <button
                      type="button"
                      onClick={() => handleAddSubsection(sectionKey)}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      + Добавить подраздел
                    </button>
                  </div>

                  <div className="space-y-3">
                    {subsections.map((subsection) => (
                      <div key={subsection} className="flex items-center gap-2">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">
                            {subsection}
                          </label>
                          <input
                            type="text"
                            value={sectionSubsections[subsection] || ''}
                            onChange={(e) =>
                              handleSubsectionTitleChange(
                                sectionKey,
                                subsection,
                                e.target.value
                              )
                            }
                            className="input w-full"
                            placeholder={`Название для ${subsection}`}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteSubsection(sectionKey, subsection)
                          }
                          className="mt-6 px-3 py-2 text-sm text-red-600 hover:text-red-700"
                          title="Удалить подраздел"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {/* Дополнительные подразделы (не из predefined) */}
                    {Object.keys(sectionSubsections)
                      .filter((sub) => !subsections.includes(sub))
                      .map((subsection) => (
                        <div
                          key={subsection}
                          className="flex items-center gap-2"
                        >
                          <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">
                              {subsection} (кастомный)
                            </label>
                            <input
                              type="text"
                              value={sectionSubsections[subsection] || ''}
                              onChange={(e) =>
                                handleSubsectionTitleChange(
                                  sectionKey,
                                  subsection,
                                  e.target.value
                                )
                              }
                              className="input w-full"
                              placeholder={`Название для ${subsection}`}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteSubsection(sectionKey, subsection)
                            }
                            className="mt-6 px-3 py-2 text-sm text-red-600 hover:text-red-700"
                            title="Удалить подраздел"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </div>
    </form>
  )
}


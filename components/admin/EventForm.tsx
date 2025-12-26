'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Event } from '@prisma/client'

interface EventFormProps {
  event?: Event
}

export default function EventForm({ event }: EventFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(event?.title || '')
  const [slug, setSlug] = useState(event?.slug || '')
  const [description, setDescription] = useState(event?.description || '')
  const [startDate, setStartDate] = useState(
    event?.startDate
      ? new Date(event.startDate).toISOString().slice(0, 16)
      : ''
  )
  const [endDate, setEndDate] = useState(
    event?.endDate
      ? new Date(event.endDate).toISOString().slice(0, 16)
      : ''
  )
  const [location, setLocation] = useState(event?.location || '')
  const [type, setType] = useState(event?.type || 'competition')
  const [status, setStatus] = useState(event?.status || 'planned')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const url = event
        ? `/api/admin/events/${event.id}`
        : '/api/admin/events'
      const method = event ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          slug,
          description,
          startDate: new Date(startDate).toISOString(),
          endDate: endDate ? new Date(endDate).toISOString() : null,
          location,
          type,
          status,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Ошибка при сохранении')
        return
      }

      router.push('/admin/events')
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
          pattern="[a-z0-9-]+"
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Дата начала *
          </label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Дата окончания
          </label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Место проведения</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="input"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Тип *</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
            className="input"
          >
            <option value="competition">Соревнование</option>
            <option value="training">Тренировка</option>
            <option value="meeting">Встреча</option>
            <option value="other">Другое</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Статус *</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
            className="input"
          >
            <option value="planned">Запланировано</option>
            <option value="ongoing">Идет</option>
            <option value="completed">Завершено</option>
            <option value="cancelled">Отменено</option>
          </select>
        </div>
      </div>

      <div className="flex space-x-4">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Сохранение...' : 'Сохранить'}
        </button>
        <Link href="/admin/events" className="btn btn-secondary">
          Отмена
        </Link>
      </div>
    </form>
  )
}



import Link from 'next/link'
import { Event } from '@prisma/client'

interface EventCardProps {
  event: Event
}

export default function EventCard({ event }: EventCardProps) {
  const startDate = new Date(event.startDate).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const statusColors = {
    planned: 'bg-blue-100 text-blue-800',
    ongoing: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  const statusLabels = {
    planned: 'Запланировано',
    ongoing: 'Идет',
    completed: 'Завершено',
    cancelled: 'Отменено',
  }

  return (
    <Link href={`/events/${event.slug}`} className="card hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <span className={`text-xs px-2 py-1 rounded ${statusColors[event.status as keyof typeof statusColors] || statusColors.planned}`}>
            {statusLabels[event.status as keyof typeof statusLabels] || event.status}
          </span>
        </div>
        <h3 className="text-xl font-bold mb-2">{event.title}</h3>
        <p className="text-gray-600 mb-4">{startDate}</p>
        {event.location && (
          <p className="text-sm text-gray-500 mb-2">📍 {event.location}</p>
        )}
        {event.description && (
          <p className="text-gray-600 line-clamp-2 mb-4">{event.description}</p>
        )}
        <span className="text-primary-600 font-medium hover:text-primary-700">
          Подробнее →
        </span>
      </div>
    </Link>
  )
}


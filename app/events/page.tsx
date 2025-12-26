import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import EventCard from '@/components/EventCard'

async function getAllEvents() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { startDate: 'desc' },
    })
    return events
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

export default async function EventsPage() {
  const events = await getAllEvents()

  return (
    <div className="container-custom py-12">
      <h1 className="text-4xl font-bold mb-8">Мероприятия</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Link
          href="/events/calendar"
          className="card p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-bold mb-2">Календарь мероприятий</h2>
          <p className="text-gray-600">Просмотр всех мероприятий в календаре</p>
        </Link>
        <Link
          href="/events/plan"
          className="card p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-bold mb-2">Календарный план</h2>
          <p className="text-gray-600">План мероприятий на год</p>
        </Link>
        <Link
          href="/events/regulations"
          className="card p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-bold mb-2">Положения и регламенты</h2>
          <p className="text-gray-600">Документы по мероприятиям</p>
        </Link>
      </div>

      <h2 className="text-2xl font-bold mb-6">Все мероприятия</h2>
      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Мероприятия пока не добавлены</p>
      )}
    </div>
  )
}



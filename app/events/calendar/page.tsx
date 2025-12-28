import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { getSectionTitle, getSubsectionTitle } from '@/lib/sectionTitles'

// Отключаем кэширование для динамического контента
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getPage(section: string, subsection: string) {
  try {
    const page = await prisma.page.findFirst({
      where: {
        section,
        subsection,
        published: true,
      },
    })
    return page
  } catch (error) {
    return null
  }
}

async function getAllEvents() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { startDate: 'asc' },
      where: {
        startDate: { gte: new Date() },
      },
    })
    return events
  } catch (error) {
    return []
  }
}

export default async function EventsCalendarPage() {
  const page = await getPage('events', 'calendar')
  const sectionTitle = await getSectionTitle('events')
  const title = await getSubsectionTitle('events', 'calendar')
  const events = await getAllEvents()

  return (
    <div className="container-custom py-12">
      <Link
        href="/events"
        className="text-primary-600 hover:text-primary-700 mb-4 inline-block"
      >
        ← Назад к разделу {sectionTitle}
      </Link>

      <h1 className="text-4xl font-bold mb-8">{title}</h1>

      {page ? (
        <div
          className="prose prose-lg max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      ) : (
        <div className="card p-8 mb-8">
          <p className="text-gray-600 mb-4">
            Контент для этого раздела пока не добавлен.
          </p>
          <p className="text-sm text-gray-500">
            Администратор может добавить контент через админ-панель.
          </p>
        </div>
      )}

      {events.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Предстоящие мероприятия</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="card p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                <p className="text-gray-600 text-sm mb-2">
                  {new Date(event.startDate).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                {event.location && (
                  <p className="text-gray-500 text-sm">{event.location}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


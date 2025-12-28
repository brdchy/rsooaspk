import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import DeleteEventButton from '@/components/admin/DeleteEventButton'

// Отключаем кэширование для динамического контента
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getAllEvents() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { startDate: 'desc' },
    })
    return events
  } catch (error) {
    return []
  }
}

export default async function AdminEventsPage() {
  const events = await getAllEvents()

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Мероприятия</h1>
        <Link href="/admin/events/new" className="btn btn-primary">
          Добавить мероприятие
        </Link>
      </div>

      {/* Desktop Table */}
      <div className="card overflow-hidden hidden md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Название
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дата начала
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {events.map((event) => (
              <tr key={event.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {event.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(event.startDate).toLocaleDateString('ru-RU')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {event.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/admin/events/${event.id}`}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      Редактировать
                    </Link>
                    <DeleteEventButton
                      eventId={event.id}
                      eventTitle={event.title}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {events.map((event) => (
          <div key={event.id} className="card p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-2">
                {event.title}
              </h3>
              <span className="px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap bg-blue-100 text-blue-800">
                {event.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              {new Date(event.startDate).toLocaleDateString('ru-RU')}
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href={`/admin/events/${event.id}`}
                className="btn btn-primary text-center text-sm"
              >
                Редактировать
              </Link>
              <DeleteEventButton
                eventId={event.id}
                eventTitle={event.title}
              />
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Мероприятия не найдены. Создайте первое мероприятие.
          </div>
        )}
      </div>

      {/* Empty state for desktop */}
      {events.length === 0 && (
        <div className="hidden md:block p-8 text-center text-gray-500">
          Мероприятия не найдены. Создайте первое мероприятие.
        </div>
      )}
    </div>
  )
}


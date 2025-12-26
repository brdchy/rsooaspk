import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

async function getEventBySlug(slug: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { slug },
    })
    return event
  } catch (error) {
    return null
  }
}

export default async function EventDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const event = await getEventBySlug(params.slug)

  if (!event) {
    notFound()
  }

  const startDate = new Date(event.startDate).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const endDate = event.endDate
    ? new Date(event.endDate).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <div className="container-custom py-12">
      <Link
        href="/events"
        className="text-primary-600 hover:text-primary-700 mb-4 inline-block"
      >
        ← Назад к мероприятиям
      </Link>

      <article className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">{event.title}</h1>
        <div className="mb-8 space-y-2">
          <p className="text-gray-600">
            <strong>Дата начала:</strong> {startDate}
          </p>
          {endDate && (
            <p className="text-gray-600">
              <strong>Дата окончания:</strong> {endDate}
            </p>
          )}
          {event.location && (
            <p className="text-gray-600">
              <strong>Место проведения:</strong> {event.location}
            </p>
          )}
          <p className="text-gray-600">
            <strong>Тип:</strong> {event.type}
          </p>
          <p className="text-gray-600">
            <strong>Статус:</strong> {event.status}
          </p>
        </div>
        {event.description && (
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: event.description }}
          />
        )}
      </article>
    </div>
  )
}



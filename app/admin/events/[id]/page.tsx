import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import EventForm from '@/components/admin/EventForm'

// Отключаем кэширование для динамического контента
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getEventById(id: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { id },
    })
    return event
  } catch (error) {
    return null
  }
}

export default async function EditEventPage({
  params,
}: {
  params: { id: string }
}) {
  const event = await getEventById(params.id)

  if (!event) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Редактировать мероприятие</h1>
      <EventForm event={event} />
    </div>
  )
}



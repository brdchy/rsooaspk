import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PageForm from '@/components/admin/PageForm'

// Отключаем кэширование для динамического контента
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getPageById(id: string) {
  try {
    const page = await prisma.page.findUnique({
      where: { id },
    })
    return page
  } catch (error) {
    return null
  }
}

export default async function EditPagePage({
  params,
}: {
  params: { id: string }
}) {
  const page = await getPageById(params.id)

  if (!page) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Редактировать страницу</h1>
      <PageForm page={page} />
    </div>
  )
}



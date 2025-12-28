import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import NewsForm from '@/components/admin/NewsForm'
import Breadcrumbs from '@/components/Breadcrumbs'

// Отключаем кэширование для динамического контента
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getNewsById(id: string) {
  try {
    const news = await prisma.news.findUnique({
      where: { id },
    })
    return news
  } catch (error) {
    return null
  }
}

export default async function EditNewsPage({
  params,
}: {
  params: { id: string }
}) {
  const news = await getNewsById(params.id)

  if (!news) {
    notFound()
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Админ-панель', href: '/admin' },
          { label: 'Новости', href: '/admin/news' },
          { label: 'Редактировать' },
        ]}
      />
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
        Редактировать новость
      </h1>
      <NewsForm news={news} />
    </div>
  )
}


import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import VKSyncButton from '@/components/admin/VKSyncButton'
import DeleteNewsButton from '@/components/admin/DeleteNewsButton'
import Breadcrumbs from '@/components/Breadcrumbs'

// Отключаем кэширование для динамического контента
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getAllNews() {
  try {
    const news = await prisma.news.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })
    return news
  } catch (error) {
    return []
  }
}

export default async function AdminNewsPage() {
  const news = await getAllNews()

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Админ-панель', href: '/admin' },
          { label: 'Новости' },
        ]}
      />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Новости</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <VKSyncButton />
          <Link href="/admin/news/new" className="btn btn-primary text-center">
            Добавить новость
          </Link>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="card overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Заголовок
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата публикации
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {news.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 max-w-md truncate">
                      {item.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.published
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {item.published ? 'Опубликовано' : 'Черновик'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.publishedAt
                      ? new Date(item.publishedAt).toLocaleDateString('ru-RU')
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/admin/news/${item.id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        Редактировать
                      </Link>
                      <DeleteNewsButton
                        newsId={item.id}
                        newsTitle={item.title}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {news.map((item) => (
          <div key={item.id} className="card p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-2">
                {item.title}
              </h3>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                  item.published
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {item.published ? 'Опубликовано' : 'Черновик'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              {item.publishedAt
                ? new Date(item.publishedAt).toLocaleDateString('ru-RU')
                : 'Без даты'}
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href={`/admin/news/${item.id}`}
                className="btn btn-primary text-center text-sm"
              >
                Редактировать
              </Link>
              <DeleteNewsButton newsId={item.id} newsTitle={item.title} />
            </div>
          </div>
        ))}
        {news.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Новости не найдены. Создайте первую новость.
          </div>
        )}
      </div>

      {/* Empty state for desktop */}
      {news.length === 0 && (
        <div className="hidden md:block p-8 text-center text-gray-500">
          Новости не найдены. Создайте первую новость.
        </div>
      )}
    </div>
  )
}


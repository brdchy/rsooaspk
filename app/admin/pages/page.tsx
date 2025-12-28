import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import DeletePageButton from '@/components/admin/DeletePageButton'

// Отключаем кэширование для динамического контента
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getAllPages() {
  try {
    const pages = await prisma.page.findMany({
      orderBy: { section: 'asc' },
    })
    return pages
  } catch (error) {
    return []
  }
}

export default async function AdminPagesPage() {
  const pages = await getAllPages()

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Страницы</h1>
        <Link href="/admin/pages/new" className="btn btn-primary">
          Добавить страницу
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
                Раздел
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Подраздел
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pages.map((page) => (
              <tr key={page.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {page.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {page.section}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {page.subsection || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/admin/pages/${page.id}`}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      Редактировать
                    </Link>
                    <DeletePageButton
                      pageId={page.id}
                      pageTitle={page.title}
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
        {pages.map((page) => (
          <div key={page.id} className="card p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {page.title}
            </h3>
            <p className="text-sm text-gray-500 mb-2">
              Раздел: {page.section}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Подраздел: {page.subsection || '-'}
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href={`/admin/pages/${page.id}`}
                className="btn btn-primary text-center text-sm"
              >
                Редактировать
              </Link>
              <DeletePageButton
                pageId={page.id}
                pageTitle={page.title}
              />
            </div>
          </div>
        ))}
        {pages.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Страницы не найдены. Создайте первую страницу.
          </div>
        )}
      </div>

      {/* Empty state for desktop */}
      {pages.length === 0 && (
        <div className="hidden md:block p-8 text-center text-gray-500">
          Страницы не найдены. Создайте первую страницу.
        </div>
      )}
    </div>
  )
}



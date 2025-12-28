import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import DeleteDocumentButton from '@/components/admin/DeleteDocumentButton'

// Отключаем кэширование для динамического контента
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getAllDocuments() {
  try {
    const documents = await prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return documents
  } catch (error) {
    return []
  }
}

export default async function AdminDocumentsPage() {
  const documents = await getAllDocuments()

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Документы</h1>
        <Link href="/admin/documents/new" className="btn btn-primary">
          Добавить документ
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
                Категория
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
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {doc.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {doc.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      doc.published
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {doc.published ? 'Опубликовано' : 'Черновик'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/admin/documents/${doc.id}`}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      Редактировать
                    </Link>
                    <DeleteDocumentButton
                      documentId={doc.id}
                      documentTitle={doc.title}
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
        {documents.map((doc) => (
          <div key={doc.id} className="card p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-2">
                {doc.title}
              </h3>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                  doc.published
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {doc.published ? 'Опубликовано' : 'Черновик'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-4">{doc.category}</p>
            <div className="flex flex-col gap-2">
              <Link
                href={`/admin/documents/${doc.id}`}
                className="btn btn-primary text-center text-sm"
              >
                Редактировать
              </Link>
              <DeleteDocumentButton
                documentId={doc.id}
                documentTitle={doc.title}
              />
            </div>
          </div>
        ))}
        {documents.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Документы не найдены. Создайте первый документ.
          </div>
        )}
      </div>

      {/* Empty state for desktop */}
      {documents.length === 0 && (
        <div className="hidden md:block p-8 text-center text-gray-500">
          Документы не найдены. Создайте первый документ.
        </div>
      )}
    </div>
  )
}



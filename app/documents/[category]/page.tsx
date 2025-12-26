import { prisma } from '@/lib/prisma'
import Link from 'next/link'

async function getDocumentsByCategory(category: string) {
  try {
    const documents = await prisma.document.findMany({
      where: {
        category,
        published: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return documents
  } catch (error) {
    return []
  }
}

const categoryTitles: Record<string, string> = {
  ministry: 'Министерство спорта',
  decisions: 'Решения руководящих органов',
  teams: 'Сборные команды',
  samples: 'Образцы документов',
  charter: 'Устав',
}

export default async function DocumentsCategoryPage({
  params,
}: {
  params: { category: string }
}) {
  const documents = await getDocumentsByCategory(params.category)
  const title = categoryTitles[params.category] || params.category

  return (
    <div className="container-custom py-12">
      <Link
        href="/documents"
        className="text-primary-600 hover:text-primary-700 mb-4 inline-block"
      >
        ← Назад к документам
      </Link>

      <h1 className="text-4xl font-bold mb-8">{title}</h1>

      {documents.length > 0 ? (
        <div className="space-y-4">
          {documents.map((doc) => (
            <div key={doc.id} className="card p-6">
              <h2 className="text-xl font-bold mb-2">{doc.title}</h2>
              {doc.fileUrl && (
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Скачать документ →
                </a>
              )}
              {doc.content && (
                <div
                  className="mt-4 prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: doc.content }}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">
          Документы в этой категории пока не добавлены.
        </p>
      )}
    </div>
  )
}



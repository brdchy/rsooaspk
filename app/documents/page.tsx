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

const categories = [
  {
    key: 'ministry',
    title: 'Министерство спорта',
    href: '/documents/ministry',
  },
  {
    key: 'decisions',
    title: 'Решения руководящих органов',
    href: '/documents/decisions',
  },
  {
    key: 'teams',
    title: 'Сборные команды',
    href: '/documents/teams',
  },
  {
    key: 'samples',
    title: 'Образцы документов',
    href: '/documents/samples',
  },
  {
    key: 'charter',
    title: 'Устав',
    href: '/documents/charter',
  },
]

export default async function DocumentsPage() {
  return (
    <div className="container-custom py-12">
      <h1 className="text-4xl font-bold mb-8">Документы</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category) => (
          <Link
            key={category.href}
            href={category.href}
            className="card p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-bold mb-2">{category.title}</h2>
            <p className="text-gray-600">Просмотр документов категории</p>
          </Link>
        ))}
      </div>
    </div>
  )
}


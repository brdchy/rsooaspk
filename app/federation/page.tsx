import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { getSectionTitle, getSubsectionsWithTitles } from '@/lib/sectionTitles'

// Отключаем кэширование для динамического контента
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getPage(section: string, subsection?: string) {
  try {
    const page = await prisma.page.findFirst({
      where: {
        section,
        subsection: subsection || null,
        published: true,
      },
    })
    return page
  } catch (error) {
    return null
  }
}

export default async function FederationPage() {
  const sectionTitle = await getSectionTitle('federation')
  const subsections = await getSubsectionsWithTitles('federation')

  return (
    <div className="container-custom py-12">
      <h1 className="text-4xl font-bold mb-8">{sectionTitle}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subsections.map((subsection) => (
          <Link
            key={subsection.key}
            href={`/federation/${subsection.key}`}
            className="card p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-bold mb-2">{subsection.title}</h2>
            <p className="text-gray-600">
              {subsection.key === 'president' && 'Информация о президенте Федерации'}
              {subsection.key === 'presidium' && 'Состав президиума Федерации'}
              {subsection.key === 'history' && 'История Федерации страйкбола России'}
              {subsection.key === 'contacts' && 'Контактная информация'}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}



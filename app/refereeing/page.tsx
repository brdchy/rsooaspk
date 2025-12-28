import Link from 'next/link'
import { getSectionTitle, getSubsectionsWithTitles } from '@/lib/sectionTitles'

// Отключаем кэширование для динамического контента
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function RefereeingPage() {
  const sectionTitle = await getSectionTitle('refereeing')
  const subsections = await getSubsectionsWithTitles('refereeing')

  const descriptions: Record<string, string> = {
    regulations: 'Положения и регламенты для судей',
    requirements: 'Требования к квалификации судей',
    rules: 'Правила проведения соревнований',
    registry: 'Реестр судей Федерации',
    training: 'Программы обучения судей',
  }

  return (
    <div className="container-custom py-12">
      <h1 className="text-4xl font-bold mb-8">{sectionTitle}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subsections.map((subsection) => (
          <Link
            key={subsection.key}
            href={`/refereeing/${subsection.key}`}
            className="card p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-bold mb-2">{subsection.title}</h2>
            <p className="text-gray-600">{descriptions[subsection.key] || ''}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}



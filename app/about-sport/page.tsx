import Link from 'next/link'
import { getSectionTitle, getSubsectionsWithTitles } from '@/lib/sectionTitles'

// Отключаем кэширование для динамического контента
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AboutSportPage() {
  const sectionTitle = await getSectionTitle('about-sport')
  const subsections = await getSubsectionsWithTitles('about-sport')

  const descriptions: Record<string, string> = {
    history: 'История развития страйкбола как вида спорта',
    rules: 'Правила и регламенты страйкбола',
    'become-athlete': 'Как стать спортсменом Федерации страйкбола России',
    antidoping: 'Информация об антидопинговой политике',
    about: 'Основная информация о страйкболе',
  }

  return (
    <div className="container-custom py-12">
      <h1 className="text-4xl font-bold mb-8">{sectionTitle}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subsections.map((subsection) => (
          <Link
            key={subsection.key}
            href={`/about-sport/${subsection.key}`}
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



import { prisma } from '@/lib/prisma'
import Link from 'next/link'

async function getPage(section: string, subsection: string) {
  try {
    const page = await prisma.page.findFirst({
      where: {
        section,
        subsection,
        published: true,
      },
    })
    return page
  } catch (error) {
    return null
  }
}

const subsectionTitles: Record<string, string> = {
  history: 'История вида спорта',
  rules: 'Правила вида спорта',
  'become-athlete': 'Стать спортсменом',
  antidoping: 'Антидопинг',
  about: 'О страйкболе',
}

export default async function AboutSportSubsectionPage({
  params,
}: {
  params: { subsection: string }
}) {
  const page = await getPage('about-sport', params.subsection)
  const title = subsectionTitles[params.subsection] || params.subsection

  return (
    <div className="container-custom py-12">
      <Link
        href="/about-sport"
        className="text-primary-600 hover:text-primary-700 mb-4 inline-block"
      >
        ← Назад к разделу О спорте
      </Link>

      <h1 className="text-4xl font-bold mb-8">{title}</h1>

      {page ? (
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      ) : (
        <div className="card p-8">
          <p className="text-gray-600 mb-4">
            Контент для этого раздела пока не добавлен.
          </p>
          <p className="text-sm text-gray-500">
            Администратор может добавить контент через админ-панель.
          </p>
        </div>
      )}
    </div>
  )
}



import { prisma } from '@/lib/prisma'
import Link from 'next/link'

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
  const sections = [
    {
      title: 'Президент',
      href: '/federation/president',
      description: 'Информация о президенте Федерации',
    },
    {
      title: 'Президиум',
      href: '/federation/presidium',
      description: 'Состав президиума Федерации',
    },
    {
      title: 'История',
      href: '/federation/history',
      description: 'История Федерации страйкбола России',
    },
    {
      title: 'Контакты',
      href: '/federation/contacts',
      description: 'Контактная информация',
    },
  ]

  return (
    <div className="container-custom py-12">
      <h1 className="text-4xl font-bold mb-8">Федерация</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="card p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-bold mb-2">{section.title}</h2>
            <p className="text-gray-600">{section.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}



import Link from 'next/link'

export default function RefereeingPage() {
  const sections = [
    {
      title: 'Положения о судьях',
      href: '/refereeing/regulations',
      description: 'Положения и регламенты для судей',
    },
    {
      title: 'Квалификационные требования',
      href: '/refereeing/requirements',
      description: 'Требования к квалификации судей',
    },
    {
      title: 'Правила соревнований',
      href: '/refereeing/rules',
      description: 'Правила проведения соревнований',
    },
    {
      title: 'Реестр судей',
      href: '/refereeing/registry',
      description: 'Реестр судей Федерации',
    },
    {
      title: 'Обучение судей',
      href: '/refereeing/training',
      description: 'Программы обучения судей',
    },
  ]

  return (
    <div className="container-custom py-12">
      <h1 className="text-4xl font-bold mb-8">Судейство</h1>
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


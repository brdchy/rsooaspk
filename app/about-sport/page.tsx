import Link from 'next/link'

export default function AboutSportPage() {
  const sections = [
    {
      title: 'История вида спорта',
      href: '/about-sport/history',
      description: 'История развития страйкбола как вида спорта',
    },
    {
      title: 'Правила вида спорта',
      href: '/about-sport/rules',
      description: 'Правила и регламенты страйкбола',
    },
    {
      title: 'Стать спортсменом',
      href: '/about-sport/become-athlete',
      description: 'Как стать спортсменом Федерации страйкбола России',
    },
    {
      title: 'Антидопинг',
      href: '/about-sport/antidoping',
      description: 'Информация об антидопинговой политике',
    },
    {
      title: 'О страйкболе',
      href: '/about-sport/about',
      description: 'Основная информация о страйкболе',
    },
  ]

  return (
    <div className="container-custom py-12">
      <h1 className="text-4xl font-bold mb-8">О спорте</h1>
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



'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

const navigation = [
  {
    name: 'Федерация',
    href: '/federation',
    children: [
      { name: 'Президент', href: '/federation/president' },
      { name: 'Президиум', href: '/federation/presidium' },
      { name: 'История', href: '/federation/history' },
      { name: 'Контакты', href: '/federation/contacts' },
    ],
  },
  {
    name: 'О спорте',
    href: '/about-sport',
    children: [
      { name: 'История вида спорта', href: '/about-sport/history' },
      { name: 'Правила вида спорта', href: '/about-sport/rules' },
      { name: 'Стать спортсменом', href: '/about-sport/become-athlete' },
      { name: 'Антидопинг', href: '/about-sport/antidoping' },
      { name: 'О страйкболе', href: '/about-sport/about' },
    ],
  },
  {
    name: 'Мероприятия',
    href: '/events',
    children: [
      { name: 'Календарь мероприятий', href: '/events/calendar' },
      { name: 'Календарный план', href: '/events/plan' },
      { name: 'Положения и регламенты', href: '/events/regulations' },
      { name: 'Протоколы соревнований', href: '/events/protocols' },
    ],
  },
  {
    name: 'Новости',
    href: '/news',
  },
  {
    name: 'Судейство',
    href: '/refereeing',
    children: [
      { name: 'Положения о судьях', href: '/refereeing/regulations' },
      { name: 'Квалификационные требования', href: '/refereeing/requirements' },
      { name: 'Правила соревнований', href: '/refereeing/rules' },
      { name: 'Реестр судей', href: '/refereeing/registry' },
      { name: 'Обучение судей', href: '/refereeing/training' },
    ],
  },
  {
    name: 'Документы',
    href: '/documents',
    children: [
      { name: 'Министерство спорта', href: '/documents/ministry' },
      { name: 'Решения руководящих органов', href: '/documents/decisions' },
      { name: 'Сборные команды', href: '/documents/teams' },
      { name: 'Образцы документов', href: '/documents/samples' },
      { name: 'Устав', href: '/documents/charter' },
    ],
  },
  {
    name: 'Филиалы',
    href: '/regions',
  },
]

export default function Header() {
  const pathname = usePathname()
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary-700">РСОО "АСПК"</span>
          </Link>

      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            {navigation.map((item) => (
              <div
                key={item.name}
                className="relative group"
                onMouseEnter={() => setOpenMenu(item.name)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <Link
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                    pathname.startsWith(item.href)
                      ? 'text-primary-600'
                      : 'text-gray-700 hover:text-primary-600'
                  }`}
                >
                  {item.name}
                </Link>
                {item.children && openMenu === item.name && (
                  <div className="absolute left-0 mt-2 w-64 bg-white rounded-md shadow-lg py-2 border">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t">
            {navigation.map((item) => (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className={`block px-4 py-2 text-sm font-medium ${
                    pathname.startsWith(item.href)
                      ? 'text-primary-600'
                      : 'text-gray-700'
                  }`}
                  onClick={() => {
                    if (!item.children) setMobileMenuOpen(false)
                  }}
                >
                  {item.name}
                </Link>
                {item.children && (
                  <div className="pl-6">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-gray-600"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        )}
      </div>

      {/* Top bar with contact info */}
      <div className="bg-primary-700 text-white text-sm py-2">
        <div className="container-custom flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-4">
            <span>+7 (999) 616-36-09</span>
            <span>info@rsooaspk.ru</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>Россия</span>
            <Link href="/" className="hover:underline">
              RU
            </Link>
            <span>|</span>
            <Link href="/en" className="hover:underline">
              EN
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}


'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  name: string | null
  role: string
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role === 'admin') {
        setUser(parsedUser)
      } else {
        window.location.href = '/'
      }
    } else {
      window.location.href = '/account/login'
    }
    setLoading(false)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Загрузка...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const navItems = [
    { name: 'Главная', href: '/admin' },
    { name: 'Новости', href: '/admin/news' },
    { name: 'Мероприятия', href: '/admin/events' },
    { name: 'Документы', href: '/admin/documents' },
    { name: 'Страницы', href: '/admin/pages' },
    { name: 'Филиалы', href: '/admin/regions' },
    { name: 'Пользователи', href: '/admin/users' },
    { name: 'Настройки', href: '/admin/settings' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 py-4 lg:py-0 lg:h-16">
            <div className="flex items-center space-x-4 lg:space-x-8 w-full lg:w-auto">
              <Link
                href="/admin"
                className="text-lg lg:text-xl font-bold text-primary-700"
              >
                Админ-панель
              </Link>
              {/* Mobile menu button */}
              <button
                className="lg:hidden ml-auto"
                onClick={() => {
                  const menu = document.getElementById('mobile-admin-menu')
                  if (menu) {
                    menu.classList.toggle('hidden')
                  }
                }}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            <div className="hidden lg:flex space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium ${
                    pathname === item.href
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-700 hover:text-primary-600'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="hidden sm:inline text-sm text-gray-600">
                {user.email}
              </span>
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                На сайт
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Выйти
              </button>
            </div>
          </div>
          {/* Mobile menu */}
          <div id="mobile-admin-menu" className="hidden lg:hidden w-full pt-4 pb-2">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium rounded ${
                    pathname === item.href
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <main className="container-custom py-4 sm:py-8">{children}</main>
    </div>
  )
}


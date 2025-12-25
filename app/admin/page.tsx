import { prisma } from '@/lib/prisma'
import Link from 'next/link'

async function getStats() {
  try {
    const [newsCount, eventsCount, documentsCount, pagesCount, regionsCount, usersCount] =
      await Promise.all([
        prisma.news.count(),
        prisma.event.count(),
        prisma.document.count(),
        prisma.page.count(),
        prisma.region.count(),
        prisma.user.count(),
      ])

    return {
      news: newsCount,
      events: eventsCount,
      documents: documentsCount,
      pages: pagesCount,
      regions: regionsCount,
      users: usersCount,
    }
  } catch (error) {
    return {
      news: 0,
      events: 0,
      documents: 0,
      pages: 0,
      regions: 0,
      users: 0,
    }
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  const cards = [
    {
      title: 'Новости',
      count: stats.news,
      href: '/admin/news',
      color: 'bg-blue-500',
    },
    {
      title: 'Мероприятия',
      count: stats.events,
      href: '/admin/events',
      color: 'bg-green-500',
    },
    {
      title: 'Документы',
      count: stats.documents,
      href: '/admin/documents',
      color: 'bg-yellow-500',
    },
    {
      title: 'Страницы',
      count: stats.pages,
      href: '/admin/pages',
      color: 'bg-purple-500',
    },
    {
      title: 'Филиалы',
      count: stats.regions,
      href: '/admin/regions',
      color: 'bg-red-500',
    },
    {
      title: 'Пользователи',
      count: stats.users,
      href: '/admin/users',
      color: 'bg-indigo-500',
    },
  ]

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
        Панель управления
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="card p-6 hover:shadow-lg transition-shadow"
          >
            <div className={`${card.color} w-12 h-12 rounded-lg mb-4`}></div>
            <h2 className="text-xl font-bold mb-2">{card.title}</h2>
            <p className="text-3xl font-bold text-gray-800">{card.count}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}


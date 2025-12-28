import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import NewsCard from '@/components/NewsCard'
import EventCard from '@/components/EventCard'
import { getSiteSettings } from '@/lib/settings'

async function getLatestNews() {
  console.log('[HOME] ===== Получение последних новостей - START =====')
  console.log('[HOME] Timestamp:', new Date().toISOString())
  
  try {
    console.log('[HOME] Запрос к БД: опубликованные новости...')
    // Сначала получаем все опубликованные новости
    const allNews = await prisma.news.findMany({
      where: { published: true },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    })
    
    console.log('[HOME] Получено новостей из БД:', allNews.length)
    
    // Сортируем вручную: сначала по publishedAt (если есть), затем по createdAt
    const sortedNews = allNews
      .sort((a, b) => {
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : new Date(a.createdAt).getTime()
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : new Date(b.createdAt).getTime()
        return dateB - dateA // Сортируем по убыванию (новые первыми)
      })
      .slice(0, 3) // Берем первые 3
    
    console.log('[HOME] ✓ Возвращаем', sortedNews.length, 'последних новостей')
    console.log('[HOME] ===== Получение последних новостей - SUCCESS =====')
    
    return sortedNews
  } catch (error: any) {
    console.error('[HOME] ===== Получение последних новостей - ERROR =====')
    console.error('[HOME] Тип ошибки:', error?.constructor?.name)
    console.error('[HOME] Сообщение:', error?.message)
    console.error('[HOME] Stack:', error?.stack)
    console.error('[HOME] ===== Получение последних новостей - END (ERROR) =====')
    return []
  }
}

async function getUpcomingEvents() {
  try {
    const events = await prisma.event.findMany({
      where: {
        status: { in: ['planned', 'ongoing'] },
        startDate: { gte: new Date() },
      },
      orderBy: { startDate: 'asc' },
      take: 3,
    })
    return events
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

export default async function Home() {
  console.log('[PAGE] ===== Главная страница - START =====')
  console.log('[PAGE] Timestamp:', new Date().toISOString())
  
  const news = await getLatestNews()
  console.log('[PAGE] Получено новостей:', news.length)
  
  const events = await getUpcomingEvents()
  console.log('[PAGE] Получено мероприятий:', events.length)
  
  const settings = await getSiteSettings()
  const heroBackground = settings.heroBackground || ''
  console.log('[PAGE] heroBackground установлен:', !!heroBackground)
  if (heroBackground) {
    console.log('[PAGE] heroBackground URL:', heroBackground.substring(0, 100))
  }
  
  console.log('[PAGE] ===== Главная страница - END =====')

  return (
    <div>
      {/* Hero Section */}
      <section
        className={`text-white py-12 sm:py-16 md:py-20 ${
          heroBackground
            ? 'bg-cover bg-center bg-no-repeat'
            : 'bg-gradient-to-r from-primary-600 to-primary-800'
        }`}
        style={
          heroBackground
            ? {
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${heroBackground})`,
              }
            : undefined
        }
      >
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            РСОО "АСПК"
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Официальный сайт
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/about-sport" className="btn btn-secondary">
              О спорте
            </Link>
            <Link href="/events" className="btn btn-secondary">
              Мероприятия
            </Link>
            <Link href="/regions" className="btn btn-secondary">
              Филиалы
            </Link>
          </div>
        </div>
      </section>

      {/* Region Info Section */}
      <section className="py-12 bg-gray-50">
        <div className="container-custom">
          <div className="card p-6">
            <h2 className="text-2xl font-bold mb-4">Филиалы</h2>
            <p className="text-gray-600 mb-4">
              Информация о филиалах организации.
            </p>
            <div className="mb-4">
              <strong>Москва и Московская область</strong>
            </div>
            <Link
              href="/regions"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Перейти на страницу филиалов →
            </Link>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-12">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Новости</h2>
            <Link
              href="/news"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Все новости →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.length > 0 ? (
              news.map((item) => <NewsCard key={item.id} news={item} />)
            ) : (
              <p className="text-gray-500 col-span-full">
                Новости пока не добавлены
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-8 sm:py-12 bg-gray-50">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold">
              Календарь мероприятий
            </h2>
            <Link
              href="/events"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Все мероприятия →
            </Link>
          </div>
          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              В ближайшее время нет запланированных мероприятий!
            </p>
          )}
        </div>
      </section>
    </div>
  )
}


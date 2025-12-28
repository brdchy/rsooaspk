import { prisma } from '@/lib/prisma'
import NewsCard from '@/components/NewsCard'

async function getAllNews() {
  console.log('[NEWS PAGE] ===== Получение всех новостей - START =====')
  console.log('[NEWS PAGE] Timestamp:', new Date().toISOString())
  
  try {
    console.log('[NEWS PAGE] Запрос к БД: опубликованные новости...')
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
    
    console.log('[NEWS PAGE] Получено новостей из БД:', allNews.length)
    console.log('[NEWS PAGE] Детали новостей:', allNews.map(n => ({
      id: n.id,
      title: n.title.substring(0, 30) + '...',
      slug: n.slug,
      published: n.published,
      publishedAt: n.publishedAt?.toISOString() || null,
      createdAt: n.createdAt.toISOString(),
    })))
    
    // Сортируем вручную: сначала по publishedAt (если есть), затем по createdAt
    const sortedNews = allNews.sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : new Date(a.createdAt).getTime()
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : new Date(b.createdAt).getTime()
      return dateB - dateA // Сортируем по убыванию (новые первыми)
    })
    
    console.log('[NEWS PAGE] ✓ Новости отсортированы, возвращаем', sortedNews.length, 'шт.')
    console.log('[NEWS PAGE] ===== Получение всех новостей - SUCCESS =====')
    
    return sortedNews
  } catch (error: any) {
    console.error('[NEWS PAGE] ===== Получение всех новостей - ERROR =====')
    console.error('[NEWS PAGE] Тип ошибки:', error?.constructor?.name)
    console.error('[NEWS PAGE] Сообщение:', error?.message)
    console.error('[NEWS PAGE] Stack:', error?.stack)
    console.error('[NEWS PAGE] ===== Получение всех новостей - END (ERROR) =====')
    return []
  }
}

export default async function NewsPage() {
  const news = await getAllNews()

  return (
    <div className="container-custom py-6 sm:py-12">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8">
        Новости
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.length > 0 ? (
          news.map((item) => <NewsCard key={item.id} news={item} />)
        ) : (
          <p className="text-gray-500 col-span-full">Новости пока не добавлены</p>
        )}
      </div>
    </div>
  )
}


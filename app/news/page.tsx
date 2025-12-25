import { prisma } from '@/lib/prisma'
import NewsCard from '@/components/NewsCard'

async function getAllNews() {
  try {
    const news = await prisma.news.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    })
    return news
  } catch (error) {
    console.error('Error fetching news:', error)
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


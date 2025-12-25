import Link from 'next/link'
import { News } from '@prisma/client'

interface NewsCardProps {
  news: News & {
    author?: {
      name: string | null
    } | null
  }
}

export default function NewsCard({ news }: NewsCardProps) {
  const publishedDate = news.publishedAt
    ? new Date(news.publishedAt).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : null

  return (
    <Link
      href={`/news/${news.slug}`}
      className="card hover:shadow-lg transition-shadow h-full flex flex-col"
    >
      {news.image && (
        <div className="aspect-video bg-gray-200 relative overflow-hidden flex-shrink-0">
          <img
            src={news.image}
            alt={news.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4 sm:p-6 flex-1 flex flex-col">
        {publishedDate && (
          <p className="text-sm text-gray-500 mb-2">{publishedDate}</p>
        )}
        <h3 className="text-xl font-bold mb-2 line-clamp-2">{news.title}</h3>
        {news.excerpt && (
          <p className="text-gray-600 mb-4 line-clamp-3">{news.excerpt}</p>
        )}
        <span className="text-primary-600 font-medium hover:text-primary-700">
          Подробнее →
        </span>
      </div>
    </Link>
  )
}


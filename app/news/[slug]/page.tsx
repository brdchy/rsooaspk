import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

// Отключаем кэширование для динамического контента
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getNewsBySlug(slug: string) {
  try {
    const news = await prisma.news.findUnique({
      where: { slug },
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
    return null
  }
}

export default async function NewsDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const news = await getNewsBySlug(params.slug)

  if (!news || !news.published) {
    notFound()
  }

  const publishedDate = news.publishedAt
    ? new Date(news.publishedAt).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <div className="container-custom py-12">
      <Link
        href="/news"
        className="text-primary-600 hover:text-primary-700 mb-4 inline-block"
      >
        ← Назад к новостям
      </Link>

      <article className="max-w-4xl mx-auto">
        {publishedDate && (
          <p className="text-gray-500 mb-4">{publishedDate}</p>
        )}
        <h1 className="text-4xl font-bold mb-6">{news.title}</h1>
        {news.image && (
          <div className="mb-8">
            <img
              src={news.image}
              alt={news.title}
              className="w-full h-auto rounded-lg"
            />
          </div>
        )}
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: news.content }}
        />
      </article>
    </div>
  )
}



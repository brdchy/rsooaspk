import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import {
  getVKWallPostsPublic,
  getLargestPhoto,
  cleanVKText,
  createSlugFromText,
  createVKPostLink,
  extractExcerpt,
} from '@/lib/vk-scraper'

const prisma = new PrismaClient()
const VK_GROUP_ID = '-225463959'

/**
 * Ручной запуск синхронизации новых постов из VK (без токена)
 * POST /api/admin/vk/sync
 */
export async function POST(request: NextRequest) {
  try {
    // Получаем последние 20 постов (без токена, через публичный API или парсинг)
    const posts = await getVKWallPostsPublic(20, 0)

    // Получаем администратора
    const admin = await prisma.user.findFirst({
      where: { role: 'admin' },
    })

    if (!admin) {
      return NextResponse.json(
        { error: 'Администратор не найден' },
        { status: 500 }
      )
    }

    let newPostsCount = 0
    const errors: string[] = []

    for (const post of posts) {
      try {
        // Проверяем, не импортирован ли уже этот пост
        const existing = await prisma.news.findUnique({
          where: { vkPostId: post.id.toString() },
        })

        if (existing) {
          continue
        }

        // Пропускаем пустые посты
        if (!post.text || post.text.trim().length === 0) {
          continue
        }

        // Обрабатываем текст
        const cleanedText = cleanVKText(post.text)
        const title = cleanedText.substring(0, 100).replace(/\n/g, ' ').trim()
        const slug = createSlugFromText(title, post.id)
        const content = cleanedText
        const excerpt = extractExcerpt(cleanedText)
        const image = getLargestPhoto(post)
        const vkLink = createVKPostLink(VK_GROUP_ID, post.id)

        // Проверяем уникальность slug
        let finalSlug = slug
        let slugCounter = 1
        while (
          await prisma.news.findUnique({
            where: { slug: finalSlug },
          })
        ) {
          finalSlug = `${slug}-${slugCounter}`
          slugCounter++
        }

        // Создаем новость
        await prisma.news.create({
          data: {
            title: title || `Пост из VK #${post.id}`,
            slug: finalSlug,
            content: content || title,
            excerpt: excerpt || title.substring(0, 200),
            image: image || null,
            published: true,
            publishedAt: new Date(post.date * 1000),
            vkPostId: post.id.toString(),
            vkLink: vkLink,
            authorId: admin.id,
          },
        })

        newPostsCount++
      } catch (error: any) {
        errors.push(`Пост ${post.id}: ${error.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      newPostsCount,
      checked: posts.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    console.error('Ошибка синхронизации VK:', error)
    return NextResponse.json(
      { error: error.message || 'Ошибка синхронизации' },
      { status: 500 }
    )
  }
}


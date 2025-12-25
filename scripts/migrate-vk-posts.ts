/**
 * Скрипт для миграции постов из VK в базу данных
 * 
 * Использование:
 *   VK_ACCESS_TOKEN=your_token tsx scripts/migrate-vk-posts.ts
 *   или
 *   tsx scripts/migrate-vk-posts.ts --token=your_token --limit=50
 */

import { PrismaClient } from '@prisma/client'
import {
  getAllVKPostsPublic,
  getLargestPhoto,
  cleanVKText,
  createSlugFromText,
  createVKPostLink,
  extractExcerpt,
} from '../lib/vk-scraper'
import { getVKWallPostsSimple } from '../lib/vk-scraper-simple'

const prisma = new PrismaClient()

const VK_GROUP_ID = '-225463959' // Для создания ссылок

async function migrateVKPosts(limit?: number) {
  console.log('Начинаем миграцию постов из VK (без токена)...')
  
  try {
    // Получаем все посты (без токена, через публичный API или парсинг)
    const posts = await getAllVKPostsPublic(limit)
    console.log(`Найдено ${posts.length} постов`)

    let imported = 0
    let skipped = 0
    let errors = 0

    // Получаем администратора для назначения автором
    const admin = await prisma.user.findFirst({
      where: { role: 'admin' },
    })

    if (!admin) {
      throw new Error('Администратор не найден в базе данных')
    }

    for (const post of posts) {
      try {
        // Проверяем, не импортирован ли уже этот пост
        const existing = await prisma.news.findUnique({
          where: { vkPostId: post.id.toString() },
        })

        if (existing) {
          console.log(`Пост ${post.id} уже импортирован, пропускаем`)
          skipped++
          continue
        }

        // Пропускаем пустые посты
        if (!post.text || post.text.trim().length === 0) {
          console.log(`Пост ${post.id} пустой, пропускаем`)
          skipped++
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

        console.log(`✓ Импортирован пост ${post.id}: ${title.substring(0, 50)}...`)
        imported++

        // Небольшая задержка
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error: any) {
        console.error(`✗ Ошибка при импорте поста ${post.id}:`, error.message)
        errors++
      }
    }

    console.log('\n=== Результаты миграции ===')
    console.log(`Импортировано: ${imported}`)
    console.log(`Пропущено: ${skipped}`)
    console.log(`Ошибок: ${errors}`)
    console.log(`Всего обработано: ${posts.length}`)
  } catch (error: any) {
    console.error('Критическая ошибка:', error.message)
    throw error
  }
}

async function main() {
  const args = process.argv.slice(2)
  let limit: number | undefined

  // Парсим аргументы командной строки
  for (const arg of args) {
    if (arg.startsWith('--limit=')) {
      limit = parseInt(arg.split('=')[1])
    }
  }

  try {
    await migrateVKPosts(limit)
  } catch (error) {
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()


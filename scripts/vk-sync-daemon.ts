/**
 * Демон для периодической синхронизации новых постов из VK
 * 
 * Использование:
 *   VK_ACCESS_TOKEN=your_token tsx scripts/vk-sync-daemon.ts
 *   или
 *   tsx scripts/vk-sync-daemon.ts --token=your_token --interval=3600000
 */

import { PrismaClient } from '@prisma/client'
import {
  getVKWallPostsPublic,
  getLargestPhoto,
  cleanVKText,
  createSlugFromText,
  createVKPostLink,
  extractExcerpt,
} from '../lib/vk-scraper'

const prisma = new PrismaClient()

const DEFAULT_INTERVAL = 3600000 // 1 час в миллисекундах
const VK_GROUP_ID = process.env.VK_GROUP_ID || '-225463959' // ID группы для создания ссылок

/**
 * Синхронизация новых постов
 */
async function syncNewPosts() {
  console.log(`[${new Date().toISOString()}] Проверка новых постов...`)

  try {
    // Получаем последние 20 постов (без токена)
    const posts = await getVKWallPostsPublic(20, 0)

    // Получаем администратора
    const admin = await prisma.user.findFirst({
      where: { role: 'admin' },
    })

    if (!admin) {
      throw new Error('Администратор не найден в базе данных')
    }

    let newPostsCount = 0

    for (const post of posts) {
      try {
        // Проверяем, не импортирован ли уже этот пост
        const existing = await prisma.news.findUnique({
          where: { vkPostId: post.id.toString() },
        })

        if (existing) {
          // Если пост уже есть, прекращаем проверку
          // (посты в VK идут по убыванию даты)
          break
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

        console.log(`  ✓ Импортирован новый пост ${post.id}: ${title.substring(0, 50)}...`)
        newPostsCount++
      } catch (error: any) {
        console.error(`  ✗ Ошибка при импорте поста ${post.id}:`, error.message)
      }
    }

    if (newPostsCount > 0) {
      console.log(`  Импортировано новых постов: ${newPostsCount}`)
    } else {
      console.log(`  Новых постов не найдено`)
    }
  } catch (error: any) {
    console.error(`  Ошибка синхронизации:`, error.message)
  }
}

/**
 * Запуск демона
 */
async function startDaemon(interval: number) {
  console.log('Демон синхронизации VK запущен (без токена)')
  console.log(`Интервал проверки: ${interval / 1000 / 60} минут`)
  console.log('Нажмите Ctrl+C для остановки\n')

  // Первая проверка сразу
  await syncNewPosts()

  // Затем проверяем периодически
  const timer = setInterval(async () => {
    await syncNewPosts()
  }, interval)

  // Обработка сигналов завершения
  process.on('SIGINT', async () => {
    console.log('\nОстановка демона...')
    clearInterval(timer)
    await prisma.$disconnect()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    console.log('\nОстановка демона...')
    clearInterval(timer)
    await prisma.$disconnect()
    process.exit(0)
  })
}

async function main() {
  const args = process.argv.slice(2)
  let interval = DEFAULT_INTERVAL

  // Парсим аргументы командной строки
  for (const arg of args) {
    if (arg.startsWith('--interval=')) {
      interval = parseInt(arg.split('=')[1])
    }
  }

  try {
    await startDaemon(interval)
  } catch (error) {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

main()


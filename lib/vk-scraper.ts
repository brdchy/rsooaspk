/**
 * Парсер публичной страницы VK без использования API токена
 * Использует публичные endpoints и парсинг HTML
 */

const VK_GROUP_ID = '225463959' // ID группы без минуса
const VK_API_VERSION = '5.131'

interface VKPost {
  id: number
  date: number
  text: string
  attachments?: Array<{
    type: string
    photo?: {
      sizes: Array<{
        type: string
        url: string
        width?: number
        height?: number
      }>
    }
  }>
}

interface VKWallResponse {
  response?: {
    count: number
    items: VKPost[]
  }
  error?: any
}

/**
 * Получить посты через публичный метод API (без токена, работает для публичных групп)
 * Это работает через специальный публичный endpoint
 */
export async function getVKWallPostsPublic(
  count: number = 100,
  offset: number = 0
): Promise<VKPost[]> {
  // Используем публичный endpoint для получения постов
  // Формат: https://api.vk.com/method/wall.get?owner_id=-GROUP_ID&count=COUNT&offset=OFFSET&v=VERSION
  const url = new URL('https://api.vk.com/method/wall.get')
  url.searchParams.set('owner_id', `-${VK_GROUP_ID}`)
  url.searchParams.set('count', count.toString())
  url.searchParams.set('offset', offset.toString())
  url.searchParams.set('extended', '0')
  url.searchParams.set('v', VK_API_VERSION)

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    const data: VKWallResponse = await response.json()

    if (data.error) {
      throw new Error(`VK API ошибка: ${JSON.stringify(data.error)}`)
    }

    if (!data.response || !data.response.items) {
      throw new Error('VK API вернул неожиданный ответ')
    }

    return data.response.items
  } catch (error: any) {
    // Если публичный API не работает, пробуем упрощенный парсинг HTML напрямую
    console.warn('Публичный API не доступен, используем парсинг HTML')
    // Импортируем динамически чтобы избежать циклических зависимостей
    const { getVKWallPostsSimple } = await import('./vk-scraper-simple')
    try {
      return await getVKWallPostsSimple(count, offset)
    } catch (simpleError: any) {
      // Если упрощенный не работает, пробуем RSS
      console.warn('Парсинг HTML не сработал, пробуем RSS:', simpleError.message)
      try {
        return await getVKWallPostsFromRSS(count, offset)
      } catch (rssError: any) {
        // Если и RSS не работает, пробуем полный парсинг
        console.warn('RSS фид не доступен, используем полный парсинг HTML:', rssError.message)
        return await getVKWallPostsFromHTML(count, offset)
      }
    }
  }
}

/**
 * Получить посты через RSS фид VK
 */
export async function getVKWallPostsFromRSS(
  count: number = 100,
  offset: number = 0
): Promise<VKPost[]> {
  // Пробуем разные варианты RSS URL
  const rssUrls = [
    `https://vk.com/rss.php?owner_id=-${VK_GROUP_ID}`,
    `https://vk.com/feed?section=rss&owner_id=-${VK_GROUP_ID}`,
    `https://m.vk.com/rss.php?owner_id=-${VK_GROUP_ID}`,
  ]
  
  for (const rssUrl of rssUrls) {
    try {
      const response = await fetch(rssUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        },
      })

      if (!response.ok) {
        continue // Пробуем следующий URL
      }

      const xmlText = await response.text()

      if (!xmlText || xmlText.length < 100) {
        continue // Пустой ответ, пробуем следующий
      }
    const posts: VKPost[] = []

    // Парсим RSS XML
    // Ищем все <item> элементы
    const itemRegex = /<item>(.*?)<\/item>/gis
    const items = Array.from(xmlText.matchAll(itemRegex))

    for (let i = offset; i < Math.min(items.length, offset + count); i++) {
      const item = items[i][1]
      
      // Извлекаем title (заголовок поста)
      const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/s)
      const title = titleMatch ? titleMatch[1] : null

      // Извлекаем description (текст поста)
      const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/s)
      const description = descMatch ? descMatch[1] : null

      // Извлекаем link (для получения ID поста)
      const linkMatch = item.match(/<link>(.*?)<\/link>/)
      const link = linkMatch ? linkMatch[1] : null

      // Извлекаем pubDate (дата публикации)
      const dateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/)
      const pubDate = dateMatch ? dateMatch[1] : null

      // Извлекаем ID поста из ссылки (например, wall-225463959_12345)
      let postId = 0
      if (link) {
        const idMatch = link.match(/wall-\d+_(\d+)/)
        if (idMatch) {
          postId = parseInt(idMatch[1])
        } else {
          // Генерируем ID на основе индекса, если не можем извлечь
          postId = Date.now() - i
        }
      }

      // Используем description как текст поста, если есть
      const text = description || title || ''
      
      if (text && text.trim().length > 0) {
        // Преобразуем дату
        let date = Math.floor(Date.now() / 1000) - i * 86400
        if (pubDate) {
          const parsedDate = new Date(pubDate)
          if (!isNaN(parsedDate.getTime())) {
            date = Math.floor(parsedDate.getTime() / 1000)
          }
        }

        // Очищаем HTML из текста
        const cleanText = text
          .replace(/<[^>]+>/g, ' ')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
          .replace(/\s+/g, ' ')
          .trim()

        if (cleanText && cleanText.length > 0) {
          posts.push({
            id: postId,
            date: date,
            text: cleanText,
          })
        }
      }
    }

      return posts
    } catch (error: any) {
      // Пробуем следующий URL
      continue
    }
  }
  
  throw new Error('Все RSS фиды недоступны')
}

/**
 * Получить посты через парсинг HTML страницы
 */
export async function getVKWallPostsFromHTML(
  count: number = 100,
  offset: number = 0
): Promise<VKPost[]> {
  // Пробуем разные варианты URL
  const urls = [
    `https://vk.com/club${VK_GROUP_ID}`,
    `https://m.vk.com/club${VK_GROUP_ID}`,
    `https://vk.com/public${VK_GROUP_ID}`,
    `https://vk.com/wall-${VK_GROUP_ID}`,
  ]
  
  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': url.includes('m.vk.com') 
            ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
            : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
          'Referer': 'https://vk.com/',
        },
      })

      if (!response.ok) {
        continue // Пробуем следующий URL
      }

      const html = await response.text()

      if (!html || html.length < 1000) {
        continue // Пустой ответ
      }

    const posts: VKPost[] = []

    // Ищем данные в JSON внутри скриптов
    // VK часто использует window._pageData или похожие структуры
    const jsonDataMatches = [
      /window\._pageData\s*=\s*({.+?});/s,
      /window\.initData\s*=\s*({.+?});/s,
      /"wall":\s*({[^}]+"items":\[.*?\].*?})/s,
      /<script[^>]*>.*?var\s+wallData\s*=\s*({.+?});/s,
    ]

    for (const regex of jsonDataMatches) {
      const match = html.match(regex)
      if (match && match[1]) {
        try {
          const data = JSON.parse(match[1])
          // Пытаемся найти посты в различных структурах данных
          const foundPosts = findPostsInData(data)
          if (foundPosts.length > 0) {
            return foundPosts.slice(offset, offset + count)
          }
        } catch (e) {
          // Продолжаем искать
        }
      }
    }

    // Альтернативный способ: парсим HTML напрямую
    // Ищем посты по структуре wall_item или похожим классам
    const postBlocks = html.match(/<div[^>]*class="[^"]*wall_item[^"]*"[^>]*>.*?<\/div>/gis)
    
    if (postBlocks) {
      for (let i = 0; i < Math.min(postBlocks.length, count); i++) {
        const block = postBlocks[i]
        
        // Извлекаем ID поста
        const postIdMatch = block.match(/data-post-id="(-?\d+)_(\d+)"/)
        if (!postIdMatch) continue

        const postId = parseInt(postIdMatch[2])
        
        // Извлекаем текст
        const textMatch = block.match(/<div[^>]*class="[^"]*wall_post_text[^"]*"[^>]*>(.*?)<\/div>/is)
        if (!textMatch) continue

        let text = textMatch[1]
          .replace(/<[^>]+>/g, ' ') // Удаляем HTML теги
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
          .replace(/\s+/g, ' ')
          .trim()

        if (text && text.length > 10) {
          // Извлекаем дату (если есть)
          const dateMatch = block.match(/data-time="(\d+)"/)
          const date = dateMatch ? parseInt(dateMatch[1]) : Math.floor(Date.now() / 1000) - i * 86400

          posts.push({
            id: postId,
            date: date,
            text: text,
          })
        }
      }
    }

    // Если ничего не нашли, пробуем более простой поиск по data-post-id
    if (posts.length === 0) {
      const postIdRegex = /data-post-id="(-?\d+)_(\d+)"/g
      const textRegex = /<div[^>]*wall_post_text[^>]*>(.*?)(?:<\/div>|$)/gis
      
      const allTexts = Array.from(html.matchAll(textRegex))
      let matchIndex = 0
      let match

      while ((match = postIdRegex.exec(html)) !== null && posts.length < count) {
        const postId = parseInt(match[2])
        
        if (matchIndex < allTexts.length) {
          let text = allTexts[matchIndex][1]
            .replace(/<[^>]+>/g, ' ')
            .replace(/&[a-z]+;/gi, ' ')
            .replace(/\s+/g, ' ')
            .trim()

          if (text && text.length > 10) {
            posts.push({
              id: postId,
              date: Math.floor(Date.now() / 1000) - posts.length * 86400,
              text: text,
            })
          }
        }
        matchIndex++
      }
    }

      if (posts.length > 0) {
        return posts.slice(0, count)
      }
    } catch (error: any) {
      // Пробуем следующий URL
      continue
    }
  }
  
  // Если ничего не нашли, возвращаем пустой массив
  console.warn('Не удалось извлечь посты из HTML')
  return []
}

/**
 * Рекурсивно ищем посты в структуре данных
 */
function findPostsInData(data: any): VKPost[] {
  const posts: VKPost[] = []

  if (Array.isArray(data)) {
    for (const item of data) {
      posts.push(...findPostsInData(item))
    }
  } else if (data && typeof data === 'object') {
    // Проверяем, является ли это постом
    if (data.id && data.text && typeof data.text === 'string') {
      posts.push({
        id: data.id,
        date: data.date || Math.floor(Date.now() / 1000),
        text: data.text,
        attachments: data.attachments,
      })
    }

    // Рекурсивно ищем в дочерних объектах
    for (const key in data) {
      if (key === 'items' || key === 'posts' || key === 'wall') {
        posts.push(...findPostsInData(data[key]))
      } else if (typeof data[key] === 'object') {
        posts.push(...findPostsInData(data[key]))
      }
    }
  }

  return posts
}

/**
 * Получить все посты (с учетом пагинации)
 */
export async function getAllVKPostsPublic(
  maxPosts?: number
): Promise<VKPost[]> {
  const allPosts: VKPost[] = []
  let offset = 0
  const batchSize = 100

  while (true) {
    try {
      const posts = await getVKWallPostsPublic(batchSize, offset)
      
      if (posts.length === 0) break

      allPosts.push(...posts)
      offset += batchSize

      if (maxPosts && allPosts.length >= maxPosts) {
        return allPosts.slice(0, maxPosts)
      }

      // Небольшая задержка чтобы не превысить rate limit
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      // Если публичный API недоступен, пробуем RSS
      console.warn('Не удалось получить посты через API, используем RSS фид')
      try {
        return await getVKWallPostsFromRSS(maxPosts || 100, 0)
      } catch (rssError) {
        // Если RSS тоже не работает, пробуем упрощенный парсинг
        console.warn('RSS фид не доступен, используем упрощенный парсинг HTML')
        try {
          return await getVKWallPostsSimple(maxPosts || 20, 0)
        } catch (simpleError) {
          // Если и это не работает, пробуем полный парсинг
          console.warn('Упрощенный парсинг не сработал, пробуем полный HTML парсинг')
          const htmlPosts = await getVKWallPostsFromHTML(20, 0)
          return htmlPosts
        }
      }
    }
  }

  return allPosts
}

/**
 * Получить самую большую фотографию из вложений
 */
export function getLargestPhoto(post: VKPost): string | null {
  if (!post.attachments) return null

  // Приоритет размеров фотографий (от большего к меньшему)
  const sizePriority = ['w', 'z', 'y', 'r', 'q', 'p', 'o', 'x', 'm', 's']
  
  for (const attachment of post.attachments) {
    if (attachment.type === 'photo' && attachment.photo) {
      const sizes = attachment.photo.sizes
      
      // Если есть width и height, используем их для выбора
      if (sizes.some(s => s.width && s.height)) {
        const largest = sizes.reduce((prev, curr) => {
          const prevSize = (prev.width || 0) * (prev.height || 0)
          const currSize = (curr.width || 0) * (curr.height || 0)
          return currSize > prevSize ? curr : prev
        }, sizes[0])
        return largest.url
      }
      
      // Иначе используем приоритет по типу размера
      for (const priorityType of sizePriority) {
        const size = sizes.find(s => s.type === priorityType)
        if (size) {
          return size.url
        }
      }
      
      // Если ничего не найдено, возвращаем последний размер (обычно самый большой)
      return sizes[sizes.length - 1]?.url || null
    }
  }

  return null
}

/**
 * Очистить текст от HTML тегов и форматирования VK
 */
export function cleanVKText(text: string): string {
  // Убираем упоминания [id123456|Имя] -> Имя
  let cleaned = text.replace(/\[([^\]]+)\|([^\]]+)\]/g, '$2')
  
  // Убираем ссылки [url|текст] -> текст
  cleaned = cleaned.replace(/\[([^\]]+)\|([^\]]+)\]/g, '$2')
  
  // Убираем простые ссылки https://...
  cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, '')
  
  // Очищаем от лишних пробелов
  cleaned = cleaned.replace(/\s+/g, ' ').trim()
  
  return cleaned
}

/**
 * Создать slug из текста
 */
export function createSlugFromText(text: string, vkPostId: number): string {
  // Берем первые 50 символов текста для slug
  const textForSlug = text.substring(0, 50)
    .toLowerCase()
    .replace(/[^a-zа-я0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-+|-+$/g, '')

  return textForSlug || `vk-post-${vkPostId}`
}

/**
 * Создать ссылку на пост в VK
 */
export function createVKPostLink(ownerId: string, postId: number): string {
  const groupId = Math.abs(parseInt(ownerId.replace('-', ''))).toString()
  return `https://vk.com/club${groupId}?w=wall${ownerId}_${postId}`
}

/**
 * Извлечь краткое описание из текста (первые 200 символов)
 */
export function extractExcerpt(text: string, maxLength: number = 200): string {
  const cleaned = cleanVKText(text)
  if (cleaned.length <= maxLength) return cleaned
  return cleaned.substring(0, maxLength).replace(/\s+\S*$/, '') + '...'
}


/**
 * Простой парсер VK через публичную страницу группы
 * Использует прямое извлечение данных из HTML
 */

const VK_GROUP_ID = '225463959'

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
      }>
    }
  }>
}

/**
 * Получить посты напрямую из HTML страницы группы
 */
export async function getVKWallPostsSimple(
  count: number = 20,
  offset: number = 0
): Promise<VKPost[]> {
  // Используем десктопную версию, так как там больше данных в HTML
  const url = `https://vk.com/club${VK_GROUP_ID}`
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'ru-RU,ru;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0',
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const html = await response.text()
  const posts: VKPost[] = []

  // Ищем посты через различные паттерны
  // VK использует data-post-id для идентификации постов
  const postIdPattern = /data-post-id="(-?\d+)_(\d+)"/g
  const postIds: Array<{ owner: string; id: string }> = []

  let match
  while ((match = postIdPattern.exec(html)) !== null) {
    postIds.push({ owner: match[1], id: match[2] })
  }

  console.log(`Найдено ID постов: ${postIds.length}`)

  // Пробуем найти данные в JavaScript коде страницы
  // VK часто встраивает данные в window._pageData или подобные структуры
  const jsonMatches = [
    /window\._pageData\s*=\s*({.+?});/s,
    /window\.initData\s*=\s*({.+?});/s,
    /"wall":\s*({[^}]+"items":\[.*?\].*?})/s,
    /"items":\s*\[(.*?)\]}/s,
  ]

  // Для каждого поста пытаемся извлечь текст
  for (let i = 0; i < Math.min(postIds.length, count); i++) {
    const postId = parseInt(postIds[i].id)
    const ownerId = postIds[i].owner
    const postIdString = `${ownerId}_${postIds[i].id}`
    
    // Ищем блок с этим post-id - используем более широкий поиск
    const escapedPostId = postIdString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const postBlockPattern = new RegExp(`<div[^>]*data-post-id="${escapedPostId}"[^>]*>(.*?)(?=<div[^>]*data-post-id=|<\/body>|$)`, 'gis')
    const postBlockMatch = html.match(postBlockPattern)
    
    let text = ''
    
    // Ищем текст поста различными способами
    // 1. Ищем в самом атрибуте или сразу после data-post-id
    const nearbyPattern = new RegExp(`data-post-id="${escapedPostId}"[^>]*>.*?([А-Яа-яA-Za-z0-9\\s\\.,!?:;\\-]{30,500})`, 'is')
    const nearbyMatch = html.match(nearbyPattern)
    
    if (nearbyMatch && nearbyMatch[1]) {
      text = nearbyMatch[1].trim()
    }
    
    if (!text && postBlockMatch && postBlockMatch[1]) {
      const postBlock = postBlockMatch[1]
      
      // Пробуем разные паттерны для извлечения текста
      const textPatterns = [
        /<div[^>]*class="[^"]*wall_post_text[^"]*"[^>]*>(.*?)<\/div>/is,
        /<div[^>]*class="[^"]*post_text[^"]*"[^>]*>(.*?)<\/div>/is,
        /<div[^>]*class="[^"]*pi_text[^"]*"[^>]*>(.*?)<\/div>/is,
      ]
      
      for (const pattern of textPatterns) {
        const textMatch = postBlock.match(pattern)
        if (textMatch && textMatch[1]) {
          text = textMatch[1]
          break
        }
      }
      
      // Если не нашли через паттерны, берем первые 500 символов блока и очищаем от HTML
      if (!text) {
        text = postBlock.substring(0, 500)
      }
      
      // Очищаем HTML
      text = text
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
        .replace(/\s+/g, ' ')
        .trim()
    }
    
    if (text && text.length > 10) {
      // Ищем дату в HTML
      const datePattern = new RegExp(`data-post-id="${escapedPostId}"[^>]*data-time="(\\d+)"`)
      const dateMatch = html.match(datePattern)
      const date = dateMatch ? parseInt(dateMatch[1]) : Math.floor(Date.now() / 1000) - i * 86400

      posts.push({
        id: postId,
        date: date,
        text: text.substring(0, 10000), // Ограничиваем длину
      })
      
      console.log(`  Извлечен пост ${postId}: ${text.substring(0, 50)}...`)
    }
  }

  console.log(`Извлечено постов: ${posts.length}`)
  
  if (posts.length === 0) {
    throw new Error('Не удалось извлечь тексты постов из HTML')
  }

  return posts.slice(offset, offset + count)
}

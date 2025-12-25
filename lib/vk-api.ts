/**
 * Утилиты для работы с VK API
 * Документация: https://dev.vk.com/ru/api
 */

const VK_API_VERSION = '5.131'
const VK_GROUP_ID = '-225463959' // ID группы (отрицательное число)

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
  response: {
    count: number
    items: VKPost[]
  }
}

/**
 * Получить посты со стены группы
 */
export async function getVKWallPosts(
  accessToken: string,
  count: number = 100,
  offset: number = 0
): Promise<VKPost[]> {
  const url = new URL('https://api.vk.com/method/wall.get')
  url.searchParams.set('access_token', accessToken)
  url.searchParams.set('owner_id', VK_GROUP_ID)
  url.searchParams.set('count', count.toString())
  url.searchParams.set('offset', offset.toString())
  url.searchParams.set('extended', '0')
  url.searchParams.set('v', VK_API_VERSION)

  const response = await fetch(url.toString())
  const data: VKWallResponse | { error?: any } = await response.json()

  if ('error' in data) {
    throw new Error(`VK API ошибка: ${JSON.stringify(data.error)}`)
  }

  if (!('response' in data) || !data.response) {
    throw new Error('VK API вернул неожиданный ответ')
  }

  return data.response.items
}

/**
 * Получить все посты (с учетом пагинации)
 */
export async function getAllVKPosts(
  accessToken: string,
  maxPosts?: number
): Promise<VKPost[]> {
  const allPosts: VKPost[] = []
  let offset = 0
  const batchSize = 100

  while (true) {
    const posts = await getVKWallPosts(accessToken, batchSize, offset)
    
    if (posts.length === 0) break

    allPosts.push(...posts)
    offset += batchSize

    if (maxPosts && allPosts.length >= maxPosts) {
      return allPosts.slice(0, maxPosts)
    }

    // Небольшая задержка чтобы не превысить rate limit
    await new Promise(resolve => setTimeout(resolve, 350))
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
  const groupId = Math.abs(parseInt(ownerId)).toString()
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


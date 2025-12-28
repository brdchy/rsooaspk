import { prisma } from './prisma'

export async function getSiteSettings() {
  console.log('[SETTINGS] Получение настроек сайта...')
  try {
    const settings = await prisma.siteSettings.findMany()
    console.log('[SETTINGS] Найдено настроек:', settings.length)
    console.log('[SETTINGS] Ключи настроек:', settings.map(s => s.key))
    
    const result = settings.reduce(
      (acc, s) => {
        acc[s.key] = s.value
        return acc
      },
      {} as Record<string, string>
    )
    
    console.log('[SETTINGS] Настройки загружены:', Object.keys(result))
    if (result.heroBackground) {
      console.log('[SETTINGS] heroBackground:', result.heroBackground.substring(0, 100) + '...')
    }
    
    return result
  } catch (error: any) {
    console.error('[SETTINGS] ✗ Ошибка при получении настроек:', {
      message: error?.message,
      stack: error?.stack,
    })
    return {}
  }
}



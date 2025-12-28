import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const startTime = Date.now()
  console.log('[API] ===== GET /api/admin/settings - START =====')
  console.log('[API] Timestamp:', new Date().toISOString())
  
  try {
    console.log('[API] Получение настроек из БД...')
    const settings = await prisma.siteSettings.findMany()
    console.log('[API] Найдено настроек:', settings.length)
    console.log('[API] Настройки:', settings.map(s => ({ key: s.key, valueLength: s.value.length })))
    
    const settingsObj = settings.reduce(
      (acc, s) => {
        acc[s.key] = s.value
        return acc
      },
      {} as Record<string, string>
    )
    
    console.log('[API] ✓ Настройки успешно получены')
    console.log('[API] ===== GET /api/admin/settings - SUCCESS =====')
    console.log('[API] Время выполнения:', Date.now() - startTime, 'ms')
    
    return NextResponse.json(settingsObj)
  } catch (error: any) {
    console.error('[API] ===== GET /api/admin/settings - ERROR =====')
    console.error('[API] Ошибка:', error.message)
    console.error('[API] Stack:', error.stack)
    console.error('[API] ===== GET /api/admin/settings - END (ERROR) =====')
    
    return NextResponse.json({}, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  console.log('[API] ===== POST /api/admin/settings - START =====')
  console.log('[API] Timestamp:', new Date().toISOString())
  
  try {
    console.log('[API] Получение данных из запроса...')
    const body = await request.json()
    const { heroBackground } = body
    
    console.log('[API] Полученные данные:', {
      heroBackground: heroBackground?.substring(0, 100) || 'не указано',
      heroBackgroundLength: heroBackground?.length || 0,
    })

    // Проверка подключения к БД
    console.log('[API] Проверка подключения к БД...')
    try {
      await prisma.$connect()
      console.log('[API] ✓ Подключение к БД успешно')
    } catch (dbError: any) {
      console.error('[API] ✗ Ошибка подключения к БД:', dbError.message)
      return NextResponse.json(
        {
          error: 'Ошибка подключения к базе данных',
          details: dbError.message,
          code: 'DB_CONNECTION_ERROR',
        },
        { status: 500 }
      )
    }

    console.log('[API] Сохранение настроек в БД...')
    const result = await prisma.siteSettings.upsert({
      where: { key: 'heroBackground' },
      update: { value: heroBackground || '' },
      create: {
        key: 'heroBackground',
        value: heroBackground || '',
        description: 'Изображение-подложка для главной страницы',
      },
    })

    console.log('[API] ✓ Настройки успешно сохранены:', {
      key: result.key,
      valueLength: result.value.length,
      updatedAt: result.updatedAt.toISOString(),
    })
    console.log('[API] ===== POST /api/admin/settings - SUCCESS =====')
    console.log('[API] Время выполнения:', Date.now() - startTime, 'ms')

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[API] ===== POST /api/admin/settings - ERROR =====')
    console.error('[API] Тип ошибки:', error.constructor.name)
    console.error('[API] Сообщение ошибки:', error.message)
    console.error('[API] Код ошибки:', error.code)
    console.error('[API] Prisma meta:', JSON.stringify(error.meta, null, 2))
    console.error('[API] Stack trace:', error.stack)
    console.error('[API] Полная ошибка:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    console.error('[API] Время выполнения до ошибки:', Date.now() - startTime, 'ms')
    console.error('[API] ===== POST /api/admin/settings - END (ERROR) =====')
    
    return NextResponse.json(
      { 
        error: 'Ошибка при сохранении настроек',
        details: error.message || 'Неизвестная ошибка',
        code: error.code || 'UNKNOWN',
      },
      { status: 500 }
    )
  }
}



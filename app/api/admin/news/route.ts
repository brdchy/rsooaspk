import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  console.log('[API] ===== POST /api/admin/news - START =====')
  console.log('[API] Timestamp:', new Date().toISOString())
  
  try {
    // Проверка подключения к БД
    console.log('[API] Проверка подключения к базе данных...')
    try {
      await prisma.$connect()
      console.log('[API] ✓ Подключение к БД успешно')
    } catch (dbError: any) {
      console.error('[API] ✗ ОШИБКА подключения к БД:', {
        message: dbError.message,
        code: dbError.code,
        error: dbError,
      })
      return NextResponse.json(
        { 
          error: 'Ошибка подключения к базе данных',
          details: dbError.message || 'Не удалось подключиться к БД',
          code: 'DB_CONNECTION_ERROR',
        },
        { status: 500 }
      )
    }

    console.log('[API] Получение данных из запроса...')
    const body = await request.json()
    console.log('[API] Полученные данные:', {
      title: body.title?.substring(0, 50) + (body.title?.length > 50 ? '...' : ''),
      slug: body.slug,
      contentLength: body.content?.length || 0,
      excerptLength: body.excerpt?.length || 0,
      image: body.image?.substring(0, 100) || 'не указано',
      published: body.published,
      publishedAt: body.publishedAt,
    })

    const { title, slug, content, excerpt, image, published, publishedAt } = body

    // Валидация обязательных полей
    console.log('[API] Валидация обязательных полей...')
    if (!title || !slug || !content) {
      console.warn('[API] ✗ Валидация не пройдена:', {
        hasTitle: !!title,
        hasSlug: !!slug,
        hasContent: !!content,
      })
      return NextResponse.json(
        { error: 'Заголовок, URL и содержимое обязательны для заполнения' },
        { status: 400 }
      )
    }
    console.log('[API] ✓ Все обязательные поля присутствуют')

    // Проверка на пустые строки после trim
    console.log('[API] Проверка на пустые строки после trim...')
    const trimmedTitle = title.trim()
    const trimmedSlug = slug.trim()
    const trimmedContent = content.trim()

    if (!trimmedTitle || !trimmedSlug || !trimmedContent) {
      console.warn('[API] ✗ После trim остались пустые поля:', {
        titleEmpty: !trimmedTitle,
        slugEmpty: !trimmedSlug,
        contentEmpty: !trimmedContent,
      })
      return NextResponse.json(
        { error: 'Заголовок, URL и содержимое не могут быть пустыми' },
        { status: 400 }
      )
    }
    console.log('[API] ✓ После trim все поля не пустые')

    // Подготовка данных для создания
    const newsData = {
      title: trimmedTitle,
      slug: trimmedSlug,
      content: trimmedContent,
      excerpt: excerpt?.trim() || null,
      image: image?.trim() || null,
      published: published || false,
      publishedAt: publishedAt ? new Date(publishedAt) : null,
    }
    
    console.log('[API] Данные для создания новости:', {
      title: newsData.title.substring(0, 50) + '...',
      slug: newsData.slug,
      contentLength: newsData.content.length,
      excerptLength: newsData.excerpt?.length || 0,
      image: newsData.image || 'не указано',
      published: newsData.published,
      publishedAt: newsData.publishedAt?.toISOString() || null,
    })

    console.log('[API] Создание новости в БД...')
    const news = await prisma.news.create({
      data: newsData,
    })

    console.log('[API] ✓ Новость успешно создана:', {
      id: news.id,
      slug: news.slug,
      published: news.published,
      createdAt: news.createdAt.toISOString(),
    })
    console.log('[API] ===== POST /api/admin/news - SUCCESS =====')
    console.log('[API] Время выполнения:', Date.now() - startTime, 'ms')

    return NextResponse.json(news)
  } catch (error: any) {
    console.error('[API] ===== POST /api/admin/news - ERROR =====')
    console.error('[API] Тип ошибки:', error.constructor.name)
    console.error('[API] Сообщение ошибки:', error.message)
    console.error('[API] Код ошибки:', error.code)
    console.error('[API] Prisma meta:', JSON.stringify(error.meta, null, 2))
    console.error('[API] Stack trace:', error.stack)
    console.error('[API] Полная ошибка:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    console.error('[API] Время выполнения до ошибки:', Date.now() - startTime, 'ms')
    
    if (error.code === 'P2002') {
      console.warn('[API] Конфликт уникальности (slug уже существует)')
      return NextResponse.json(
        { error: 'Новость с таким URL уже существует' },
        { status: 400 }
      )
    }
    
    // Возвращаем детальную ошибку для отладки
    const errorMessage = error.message || 'Неизвестная ошибка'
    const errorCode = error.code || 'UNKNOWN'
    
    console.error('[API] ===== POST /api/admin/news - END (ERROR) =====')
    
    return NextResponse.json(
      { 
        error: 'Ошибка при создании новости',
        details: errorMessage,
        code: errorCode,
      },
      { status: 500 }
    )
  }
}



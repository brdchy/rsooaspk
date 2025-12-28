import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Проверка подключения к БД
    try {
      await prisma.$connect()
    } catch (dbError: any) {
      console.error('Database connection error:', dbError)
      return NextResponse.json(
        { 
          error: 'Ошибка подключения к базе данных',
          details: dbError.message || 'Не удалось подключиться к БД',
          code: 'DB_CONNECTION_ERROR',
        },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { title, slug, content, excerpt, image, published, publishedAt } = body

    // Валидация обязательных полей
    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: 'Заголовок, URL и содержимое обязательны для заполнения' },
        { status: 400 }
      )
    }

    // Проверка на пустые строки после trim
    const trimmedTitle = title.trim()
    const trimmedSlug = slug.trim()
    const trimmedContent = content.trim()

    if (!trimmedTitle || !trimmedSlug || !trimmedContent) {
      return NextResponse.json(
        { error: 'Заголовок, URL и содержимое не могут быть пустыми' },
        { status: 400 }
      )
    }

    const news = await prisma.news.create({
      data: {
        title: trimmedTitle,
        slug: trimmedSlug,
        content: trimmedContent,
        excerpt: excerpt?.trim() || null,
        image: image?.trim() || null,
        published: published || false,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
      },
    })

    return NextResponse.json(news)
  } catch (error: any) {
    console.error('Error creating news:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack?.substring(0, 500), // Ограничиваем длину stack trace
    })
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Новость с таким URL уже существует' },
        { status: 400 }
      )
    }
    
    // Возвращаем детальную ошибку для отладки
    const errorMessage = error.message || 'Неизвестная ошибка'
    const errorCode = error.code || 'UNKNOWN'
    
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



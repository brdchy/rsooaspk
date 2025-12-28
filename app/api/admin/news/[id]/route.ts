import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now()
  console.log('[API] ===== PUT /api/admin/news/[id] - START =====')
  console.log('[API] Timestamp:', new Date().toISOString())
  console.log('[API] News ID:', params.id)
  
  try {
    console.log('[API] Получение данных из запроса...')
    const body = await request.json()
    const { title, slug, content, excerpt, image, published, publishedAt } = body

    console.log('[API] Полученные данные:', {
      id: params.id,
      title: title?.substring(0, 50) + (title?.length > 50 ? '...' : ''),
      slug,
      contentLength: content?.length || 0,
      published,
      publishedAt,
    })

    console.log('[API] Обновление новости в БД...')
    const news = await prisma.news.update({
      where: { id: params.id },
      data: {
        title,
        slug,
        content,
        excerpt,
        image,
        published: published || false,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
      },
    })

    console.log('[API] ✓ Новость успешно обновлена:', {
      id: news.id,
      slug: news.slug,
      published: news.published,
    })
    console.log('[API] ===== PUT /api/admin/news/[id] - SUCCESS =====')
    console.log('[API] Время выполнения:', Date.now() - startTime, 'ms')

    return NextResponse.json(news)
  } catch (error: any) {
    console.error('[API] ===== PUT /api/admin/news/[id] - ERROR =====')
    console.error('[API] News ID:', params.id)
    console.error('[API] Тип ошибки:', error.constructor.name)
    console.error('[API] Сообщение:', error.message)
    console.error('[API] Код ошибки:', error.code)
    console.error('[API] Stack:', error.stack)
    console.error('[API] Время выполнения до ошибки:', Date.now() - startTime, 'ms')
    console.error('[API] ===== PUT /api/admin/news/[id] - END (ERROR) =====')
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Новость с таким URL уже существует' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { 
        error: 'Ошибка при обновлении новости',
        details: error.message || 'Неизвестная ошибка',
        code: error.code || 'UNKNOWN',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now()
  console.log('[API] ===== DELETE /api/admin/news/[id] - START =====')
  console.log('[API] Timestamp:', new Date().toISOString())
  console.log('[API] News ID:', params.id)
  
  try {
    console.log('[API] Удаление новости из БД...')
    await prisma.news.delete({
      where: { id: params.id },
    })

    console.log('[API] ✓ Новость успешно удалена')
    console.log('[API] ===== DELETE /api/admin/news/[id] - SUCCESS =====')
    console.log('[API] Время выполнения:', Date.now() - startTime, 'ms')

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[API] ===== DELETE /api/admin/news/[id] - ERROR =====')
    console.error('[API] News ID:', params.id)
    console.error('[API] Тип ошибки:', error?.constructor?.name || 'Unknown')
    console.error('[API] Сообщение:', error?.message)
    console.error('[API] Код ошибки:', error?.code)
    console.error('[API] Stack:', error?.stack)
    console.error('[API] Время выполнения до ошибки:', Date.now() - startTime, 'ms')
    console.error('[API] ===== DELETE /api/admin/news/[id] - END (ERROR) =====')
    
    return NextResponse.json(
      { 
        error: 'Ошибка при удалении новости',
        details: error?.message || 'Неизвестная ошибка',
        code: error?.code || 'UNKNOWN',
      },
      { status: 500 }
    )
  }
}



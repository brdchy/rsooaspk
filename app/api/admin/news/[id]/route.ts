import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, slug, content, excerpt, image, published, publishedAt } = body

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

    return NextResponse.json(news)
  } catch (error: any) {
    console.error('Error updating news:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Новость с таким URL уже существует' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Ошибка при обновлении новости' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.news.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting news:', error)
    return NextResponse.json(
      { error: 'Ошибка при удалении новости' },
      { status: 500 }
    )
  }
}



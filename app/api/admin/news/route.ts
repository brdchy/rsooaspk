import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, slug, content, excerpt, image, published, publishedAt } = body

    const news = await prisma.news.create({
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
    console.error('Error creating news:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Новость с таким URL уже существует' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Ошибка при создании новости' },
      { status: 500 }
    )
  }
}


